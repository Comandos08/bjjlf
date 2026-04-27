import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Clock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";
import { AthleteAuthLayout, fieldStyles, btnStyle } from "./AthleteAuthLayout";

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(1, "Senha obrigatória").max(128),
});
type FormValues = z.infer<typeof schema>;

export function AthleteLoginPage() {
  const navigate = useNavigate();
  const { user, profile, isLoading, signOut } = useAthleteAuth();
  const [submitting, setSubmitting] = useState(false);

  // If already logged in and active → redirect.
  useEffect(() => {
    if (!isLoading && user && profile?.status === "active") {
      void navigate({ to: "/my-card" });
    }
  }, [isLoading, user, profile, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      // The auth listener in athlete-auth will fetch the profile shortly;
      // the useEffect above (or the status banners below) will react.
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido.";
      toast.error(`Falha no login: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  // Logged in but not active → show status screens.
  if (!isLoading && user && profile && profile.status !== "active") {
    if (profile.status === "pending") {
      return (
        <AthleteAuthLayout title="Cadastro em análise">
          <div className="text-center py-2">
            <Clock className="h-14 w-14 text-yellow-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600" style={{ fontFamily: "Barlow" }}>
              Seu cadastro está sendo analisado pela federação. Você receberá um
              email quando for aprovado.
            </p>
            <button onClick={() => void signOut()} className="mt-6 text-sm text-[#C8211A] hover:underline" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
              Sair
            </button>
          </div>
        </AthleteAuthLayout>
      );
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
        <Link to="/athlete/signup" className="text-[#C8211A] hover:underline">
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
        <button type="submit" disabled={submitting} className={fieldStyles.primaryBtn} style={btnStyle}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar
        </button>
      </form>
    </AthleteAuthLayout>
  );
}
