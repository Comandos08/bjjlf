import { useState } from "react";
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

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

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
