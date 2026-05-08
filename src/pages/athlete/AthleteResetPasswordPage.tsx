import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AthleteAuthLayout, fieldStyles, btnStyle } from "./AthleteAuthLayout";

const schema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres").max(128),
    confirm_password: z.string().min(8).max(128),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "As senhas não coincidem",
    path: ["confirm_password"],
  });
type FormValues = z.infer<typeof schema>;

export function AthleteResetPasswordPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);
  const [invalidLink, setInvalidLink] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    let cancelled = false;
    async function check() {
      // Wait a tick to allow Supabase to parse the recovery hash from the URL.
      const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
      const hashParams = new URLSearchParams(hash);
      const isRecoveryHash = hashParams.get("type") === "recovery";

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (!data.session && !isRecoveryHash) {
        setInvalidLink(true);
      }
      setChecking(false);
    }
    void check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) throw error;
      toast.success("Senha atualizada.");
      void navigate({ to: "/athlete/login" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido.";
      toast.error(`Falha: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <AthleteAuthLayout title="Nova senha" subtitle="Validando link...">
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-[#C8211A]" />
        </div>
      </AthleteAuthLayout>
    );
  }

  if (invalidLink) {
    return (
      <AthleteAuthLayout
        title="Link inválido"
        subtitle="Este link de redefinição não é mais válido"
        footer={
          <Link to="/athlete/login" className="text-[#C8211A] hover:underline">
            Voltar ao login
          </Link>
        }
      >
        <p className="text-sm text-gray-700">
          Link inválido ou expirado. Solicite um novo link de redefinição.
        </p>
        <Link
          to="/athlete/forgot-password"
          className={fieldStyles.primaryBtn}
          style={btnStyle}
        >
          Solicitar novo link
        </Link>
      </AthleteAuthLayout>
    );
  }

  return (
    <AthleteAuthLayout
      title="Nova senha"
      subtitle="Defina sua nova senha de acesso"
      footer={
        <Link to="/athlete/login" className="text-[#C8211A] hover:underline">
          Voltar ao login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <label className="block">
          <span className={fieldStyles.label}>Nova senha</span>
          <input {...register("password")} className={fieldStyles.input} type="password" autoComplete="new-password" />
          {errors.password && <span className={fieldStyles.error}>{errors.password.message}</span>}
        </label>
        <label className="block">
          <span className={fieldStyles.label}>Confirmar nova senha</span>
          <input {...register("confirm_password")} className={fieldStyles.input} type="password" autoComplete="new-password" />
          {errors.confirm_password && <span className={fieldStyles.error}>{errors.confirm_password.message}</span>}
        </label>
        <button type="submit" disabled={submitting} className={fieldStyles.primaryBtn} style={btnStyle}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Atualizar Senha
        </button>
      </form>
    </AthleteAuthLayout>
  );
}
