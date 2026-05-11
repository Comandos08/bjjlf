import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, Clock, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";
import { AthleteAuthLayout, fieldStyles, btnStyle } from "./AthleteAuthLayout";

function parseLoginError(error: Error): string {
  const msg = error.message.toLowerCase();
  if (msg.includes("email not confirmed")) {
    return "Confirme seu email antes de fazer login. Verifique sua caixa de entrada.";
  }
  if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
    return "Email ou senha incorretos. Verifique os dados.";
  }
  if (msg.includes("too many") || msg.includes("rate limit")) {
    return "Muitas tentativas. Aguarde alguns minutos.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Erro de conexão. Verifique sua internet.";
  }
  return "Erro ao fazer login. Tente novamente.";
}

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(1, "Senha obrigatória").max(128),
});
type FormValues = z.infer<typeof schema>;

export function AthleteLoginPage() {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut } = useAthleteAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If already logged in and active → redirect.
  // First-time users (first_login_completed === false) go to /welcome.
  useEffect(() => {
    if (!isLoading && user && profile?.status === "active") {
      void navigate({ to: profile.first_login_completed ? "/my-card" : "/welcome" });
    }
  }, [isLoading, user, profile, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      // The auth listener in athlete-auth will fetch the profile shortly;
      // the useEffect above (or the status banners below) will react.
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Erro desconhecido.");
      setSubmitError(parseLoginError(err));
    } finally {
      setSubmitting(false);
    }
  }

  // Logged in but not active → show status screens.
  if (!isLoading && user && profile && profile.status !== "active") {
    if (profile.status === "pending") {
      return <PendingStatusScreen email={user.email ?? ""} confirmed={!!user.email_confirmed_at} signOut={signOut} />;
    }
    return (
      <AthleteAuthLayout title="Conta suspensa">
        <div className="text-center py-2">
          <ShieldAlert className="h-14 w-14 text-[#C8211A] mx-auto mb-3" />
          <p className="text-sm text-gray-600" style={{ fontFamily: "Barlow" }}>
            Sua conta de atleta foi suspensa. Entre em contato com a federação
            para mais informações.
          </p>
          <button onClick={() => void signOut()} className="mt-6 text-sm text-[#C8211A] hover:underline" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
            Sair
          </button>
        </div>
      </AthleteAuthLayout>
    );
  }

  // Logged in but no profile (e.g. legacy admin user) — let admin handle this; show generic logout.
  if (!isLoading && user && !profile) {
    return (
      <AthleteAuthLayout title="Conta sem perfil de atleta">
        <div className="text-center py-2">
          <p className="text-sm text-gray-600" style={{ fontFamily: "Barlow" }}>
            Esta conta não possui um perfil de atleta. Faça login como
            administrador ou crie uma nova conta.
          </p>
          <button onClick={() => void signOut()} className="mt-6 text-sm text-[#C8211A] hover:underline" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
            Sair
          </button>
        </div>
      </AthleteAuthLayout>
    );
  }

  return (
    <AthleteAuthLayout
      title="Entrar"
      subtitle="Acesse sua área de atleta"
      footer={
        <Link to="/register/athlete" className="text-[#C8211A] hover:underline">
          Não tem conta? Cadastre-se
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <label className="block">
          <span className={fieldStyles.label}>Email</span>
          <input {...register("email")} className={fieldStyles.input} type="email" autoComplete="email" />
          {errors.email && <span className={fieldStyles.error}>{errors.email.message}</span>}
        </label>
        <label className="block">
          <span className={fieldStyles.label}>Senha</span>
          <input {...register("password")} className={fieldStyles.input} type="password" autoComplete="current-password" />
          {errors.password && <span className={fieldStyles.error}>{errors.password.message}</span>}
        </label>
        <div className="text-right">
          <Link to="/athlete/forgot-password" className="text-xs text-gray-500 hover:text-[#C8211A]" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
            Esqueci minha senha
          </Link>
        </div>
        {submitError && (
          <div
            role="alert"
            className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
          >
            <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
            <p
              className="text-sm text-red-700"
              style={{ fontFamily: "Barlow", fontWeight: 500 }}
            >
              {submitError}
            </p>
          </div>
        )}
        <button type="submit" disabled={submitting} className={fieldStyles.primaryBtn} style={btnStyle}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar
        </button>
      </form>
    </AthleteAuthLayout>
  );
}

/* ----------------------- Pending status screen ----------------------- */
function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 1) return `${local}***@${domain}`;
  return `${local[0]}***@${domain}`;
}

function PendingStatusScreen({
  email,
  confirmed,
  signOut,
}: {
  email: string;
  confirmed: boolean;
  signOut: () => Promise<void>;
}) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  async function resend() {
    if (!email) return;
    setResending(true);
    setResendError(null);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      setResent(true);
    } catch (e) {
      setResendError(e instanceof Error ? e.message : "Falha ao reenviar.");
    } finally {
      setResending(false);
    }
  }

  return (
    <AthleteAuthLayout title="Sua solicitação está em análise">
      <div className="text-center py-2">
        <Clock className="h-14 w-14 text-yellow-500 mx-auto mb-3" />
        <p className="text-sm text-gray-700" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
          Normalmente aprovamos em até 48 horas úteis.
        </p>
        <p className="mt-2 text-sm text-gray-600" style={{ fontFamily: "Barlow" }}>
          Você receberá um email quando sua conta for aprovada.
        </p>
        {email && (
          <div className="mt-4 inline-block rounded bg-gray-100 px-3 py-1.5 text-xs text-gray-700" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
            {maskEmail(email)}
          </div>
        )}

        {!confirmed && (
          <div className="mt-5 border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 mb-2" style={{ fontFamily: "Barlow" }}>
              Ainda não confirmou seu email?
            </p>
            {resent ? (
              <p className="text-xs text-green-700" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
                Email de confirmação reenviado ✓
              </p>
            ) : (
              <button
                onClick={() => void resend()}
                disabled={resending}
                className="text-sm text-[#C8211A] hover:underline disabled:opacity-60"
                style={{ fontFamily: "Barlow", fontWeight: 600 }}
              >
                {resending ? "Reenviando…" : "Reenviar email de confirmação"}
              </button>
            )}
            {resendError && (
              <p className="mt-2 text-xs text-red-600" style={{ fontFamily: "Barlow" }}>
                {resendError}
              </p>
            )}
          </div>
        )}

        <button
          onClick={() => void signOut()}
          className="mt-6 text-sm text-[#C8211A] hover:underline"
          style={{ fontFamily: "Barlow", fontWeight: 600 }}
        >
          Sair
        </button>
      </div>
    </AthleteAuthLayout>
  );
}
