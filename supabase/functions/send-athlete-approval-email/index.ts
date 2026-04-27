// Edge function: send-athlete-approval-email
// Sends a transactional email when an athlete is approved.
// Uses RESEND_API_KEY when present; otherwise no-ops with a 200 response so
// the admin approve flow never breaks.
//
// Body: { athleteId: string }
// Auth: requires caller to be an authenticated admin (editor/super_admin).

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = Deno.env.get("SITE_URL") ?? "https://bjjlf.lovable.app";
const FROM_ADDRESS =
  Deno.env.get("APPROVAL_EMAIL_FROM") ?? "BJJLF <onboarding@resend.dev>";

interface Profile {
  id: string;
  full_name: string;
  registration_number: string | null;
  belt: string;
  degree: number;
  status: string;
  user_id: string;
}

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function buildHtml(name: string, regNumber: string, cardUrl: string) {
  const safeName = escape(name);
  const safeReg = escape(regNumber);
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;">
        <tr><td style="background:#C8211A;padding:24px;text-align:center;color:#fff;font-size:22px;letter-spacing:2px;">BJJLF</td></tr>
        <tr><td style="padding:32px 28px;color:#1a1a1a;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#1a1a1a;">Sua carteirinha está pronta! 🥋</h1>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.55;">Olá <strong>${safeName}</strong>,</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.55;">
            Seu cadastro foi aprovado pela federação. Bem-vindo à família BJJLF!
          </p>
          <div style="background:#fff8e8;border:1px solid #C8A84B;padding:16px;margin:18px 0;text-align:center;">
            <div style="font-size:11px;letter-spacing:2px;color:#8B6F08;text-transform:uppercase;">Sua carteirinha</div>
            <div style="font-size:20px;font-weight:bold;color:#1a1a1a;margin-top:6px;letter-spacing:1px;">${safeReg}</div>
          </div>
          <p style="margin:18px 0 22px;font-size:15px;line-height:1.55;">
            Acesse sua carteirinha digital, QR code de verificação e seu perfil de atleta clicando abaixo:
          </p>
          <p style="text-align:center;margin:0 0 24px;">
            <a href="${cardUrl}" style="background:#C8211A;color:#fff;text-decoration:none;padding:14px 28px;display:inline-block;font-size:14px;letter-spacing:2px;text-transform:uppercase;font-weight:bold;">Ver minha carteirinha</a>
          </p>
          <p style="margin:0;font-size:12px;color:#999;line-height:1.5;">
            Se o botão não funcionar, copie este link: <br/>
            <span style="color:#666;word-break:break-all;">${cardUrl}</span>
          </p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#fafafa;border-top:1px solid #e5e5e5;font-size:11px;color:#999;text-align:center;">
          Brazilian Jiu-Jitsu Legends Federation
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";

    // Verify caller is an admin via their JWT
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use service role for the rest
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: adminRow } = await admin
      .from("admin_users")
      .select("role, is_active")
      .eq("id", user.id)
      .maybeSingle();
    if (!adminRow || !adminRow.is_active || !["editor", "super_admin"].includes(adminRow.role)) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { athleteId } = await req.json();
    if (!athleteId) {
      return new Response(JSON.stringify({ error: "missing athleteId" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await admin
      .from("athlete_profiles")
      .select("id, full_name, registration_number, belt, degree, status, user_id")
      .eq("id", athleteId)
      .maybeSingle<Profile>();

    if (!profile) {
      return new Response(JSON.stringify({ error: "athlete not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (profile.status !== "active" || !profile.registration_number) {
      return new Response(JSON.stringify({ error: "athlete not active or no registration number" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get email from auth.users via admin API
    const { data: authData } = await admin.auth.admin.getUserById(profile.user_id);
    const recipient = authData?.user?.email;
    if (!recipient) {
      return new Response(JSON.stringify({ error: "recipient email not found" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cardUrl = `${SITE_URL}/my-card`;
    const html = buildHtml(profile.full_name, profile.registration_number, cardUrl);
    const subject = "Sua carteirinha BJJLF está pronta! 🥋";

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      // No SMTP/Resend configured yet — return success with a flag so the
      // admin sees the warning but the approve flow doesn't break.
      console.log("[send-athlete-approval-email] RESEND_API_KEY missing — skipped send");
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "no_email_provider_configured", recipient }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [recipient],
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("[send-athlete-approval-email] Resend error:", resp.status, text);
      return new Response(
        JSON.stringify({ ok: false, error: "email_provider_error", detail: text }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-athlete-approval-email] error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
