import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AthleteAuthLayout, fieldStyles, btnStyle } from "./AthleteAuthLayout";

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
});
type FormValues = z.infer<typeof schema>;

export function AthleteForgotPasswordPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/athlete/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido.";
      toast.error(`Falha ao enviar: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AthleteAuthLayout
        title="Verifique seu email"
        footer={
          <Link to="/athlete/login" className="text-[#C8211A] hover:underline">
            Voltar ao login
          </Link>
        }
      >
        <div className="text-center py-2">
          <MailCheck className="h-14 w-14 text-green-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600" style={{ fontFamily: "Barlow" }}>
            Enviamos um link para redefinir sua senha. Verifique sua caixa de entrada.
          </p>
        </div>
      </AthleteAuthLayout>
    );
  }

  return (
    <AthleteAuthLayout
      title="Esqueci minha senha"
      subtitle="Informe seu email para receber o link"
      footer={
        <Link to="/athlete/login" className="text-[#C8211A] hover:underline">
          Voltar ao login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <label className="block">
          <span className={fieldStyles.label}>Email</span>
          <input {...register("email")} className={fieldStyles.input} type="email" autoComplete="email" />
          {errors.email && <span className={fieldStyles.error}>{errors.email.message}</span>}
        </label>
        <button type="submit" disabled={submitting} className={fieldStyles.primaryBtn} style={btnStyle}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Enviar Link
        </button>
      </form>
    </AthleteAuthLayout>
  );
}
