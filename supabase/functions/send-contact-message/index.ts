// Edge function: send-contact-message
// Public endpoint that receives a contact form submission, validates it,
// stores it in the `contact_messages` table, and (when RESEND_API_KEY is
// configured) forwards it via email to CONTACT_RECIPIENT_EMAIL.
//
// The recipient address is NEVER exposed to the frontend.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RECIPIENT = Deno.env.get("CONTACT_RECIPIENT_EMAIL") ?? "bjjlf.org@gmail.com";
const FROM_ADDRESS = Deno.env.get("CONTACT_EMAIL_FROM") ?? "BJJLF <onboarding@resend.dev>";

function escape(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json().catch(() => null) as
      | { name?: string; email?: string; subject?: string; message?: string }
      | null;

    const name = (body?.name ?? "").toString().trim();
    const email = (body?.email ?? "").toString().trim();
    const subject = (body?.subject ?? "").toString().trim();
    const message = (body?.message ?? "").toString().trim();

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: "missing_fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (name.length > 200 || subject.length > 300 || message.length > 5000 || email.length > 320) {
      return new Response(JSON.stringify({ error: "field_too_long" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!isEmail(email)) {
      return new Response(JSON.stringify({ error: "invalid_email" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { error: insertErr } = await admin
      .from("contact_messages")
      .insert({ name, email, subject, message });

    if (insertErr) {
      console.error("[send-contact-message] insert error:", insertErr);
      return new Response(JSON.stringify({ error: "store_failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional: forward via Resend if configured
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey) {
      const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:24px;">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #e5e5e5;margin:0 auto;">
          <tr><td style="background:#0F0F0F;padding:20px;color:#B8960C;font-size:18px;letter-spacing:2px;text-align:center;">BJJLF — NOVA MENSAGEM</td></tr>
          <tr><td style="padding:24px;color:#1a1a1a;font-size:14px;line-height:1.6;">
            <p style="margin:0 0 8px;"><strong>Nome:</strong> ${escape(name)}</p>
            <p style="margin:0 0 8px;"><strong>E-mail:</strong> ${escape(email)}</p>
            <p style="margin:0 0 8px;"><strong>Assunto:</strong> ${escape(subject)}</p>
            <p style="margin:16px 0 4px;"><strong>Mensagem:</strong></p>
            <div style="white-space:pre-wrap;background:#fafafa;border:1px solid #eee;padding:12px;">${escape(message)}</div>
          </td></tr>
        </table>
      </body></html>`;

      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_ADDRESS,
          to: [RECIPIENT],
          reply_to: email,
          subject: `[Contato BJJLF] ${subject}`,
          html,
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error("[send-contact-message] Resend error:", resp.status, text);
        // Don't fail the whole request — message is already stored.
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[send-contact-message] error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
