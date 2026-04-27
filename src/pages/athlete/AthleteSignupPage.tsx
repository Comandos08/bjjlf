import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AthleteAuthLayout, fieldStyles, btnStyle } from "./AthleteAuthLayout";

function parseSignupError(error: Error): string {
  const msg = error.message.toLowerCase();
  if (
    msg.includes("user already registered") ||
    msg.includes("email already") ||
    msg.includes("already been registered")
  ) {
    return "Este email já está cadastrado. Tente fazer login ou use outro email.";
  }
  if (msg.includes("invalid email")) {
    return "Email inválido. Verifique o endereço digitado.";
  }
  if (msg.includes("password") && msg.includes("short")) {
    return "Senha muito curta. Use no mínimo 8 caracteres.";
  }
  if (msg.includes("rate limit") || msg.includes("too many")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }
  if (msg.includes("network") || msg.includes("fetch")) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }
  return "Erro ao criar conta. Verifique os dados e tente novamente.";
}

const BELTS = ["Branca", "Azul", "Roxa", "Marrom", "Preta", "Coral", "Vermelha"] as const;
const DEGREES = [0, 1, 2, 3, 4] as const;
const CATEGORIES = [
  "Infanto-Juvenil",
  "Juvenil",
  "Adulto",
  "Master 1",
  "Master 2",
  "Master 3",
  "Master 4",
] as const;
const MODALITIES = ["GI", "NO-GI", "GI & NO-GI"] as const;

const schema = z
  .object({
    full_name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(120),
    email: z
      .string()
      .trim()
      .min(1, "Email obrigatório")
      .email("Email inválido")
      .max(255),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(128),
    confirm_password: z.string().min(8, "Confirme a senha").max(128),
    academy: z
      .string()
      .trim()
      .min(2, "Academia deve ter no mínimo 2 caracteres")
      .max(120),
    professor: z.string().trim().max(120).optional().or(z.literal("")),
    belt: z.enum(BELTS),
    degree: z.coerce.number().int().min(0).max(4),
    country: z.string().trim().min(1, "País obrigatório").max(80),
    category: z.enum(CATEGORIES),
    modality: z.enum(MODALITIES),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "As senhas não coincidem. Digite a mesma senha nos dois campos.",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export function AthleteSignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      belt: "Branca",
      degree: 0,
      country: "Brasil",
      category: "Adulto",
      modality: "GI & NO-GI",
    },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const redirectTo = `${window.location.origin}/athlete/login`;
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: { emailRedirectTo: redirectTo, data: { full_name: values.full_name } },
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("Falha ao criar usuário.");

      // Insert athlete profile (status defaults to 'pending')
      const { error: insertErr } = await supabase.from("athlete_profiles").insert({
        user_id: userId,
        full_name: values.full_name,
        belt: values.belt,
        degree: values.degree,
        academy: values.academy || null,
        professor: values.professor || null,
        country: values.country,
        category: values.category,
        modality: values.modality,
      });
      if (insertErr) throw insertErr;

      setSentEmail(values.email);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido.";
      toast.error(`Falha no cadastro: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (sentEmail) {
    return (
      <AthleteAuthLayout
        title="Verifique seu email"
        subtitle="Confirme para continuar"
        footer={
          <Link to="/athlete/login" className="text-[#C8211A] hover:underline">
            Já tem conta? Fazer login
          </Link>
        }
      >
        <div className="text-center py-4">
          <MailCheck className="h-14 w-14 text-green-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600" style={{ fontFamily: "Barlow" }}>
            Enviamos um link de confirmação para
          </p>
          <p className="text-base text-gray-900 font-medium mt-1" style={{ fontFamily: "Barlow" }}>
            {sentEmail}
          </p>
          <p className="text-sm text-gray-500 mt-4" style={{ fontFamily: "Barlow" }}>
            Após confirmar, aguarde a aprovação da federação para acessar sua área restrita.
          </p>
        </div>
      </AthleteAuthLayout>
    );
  }

  return (
    <AthleteAuthLayout
      title="Cadastro de Atleta"
      subtitle="Crie sua conta e aguarde a aprovação da federação"
      footer={
        <Link to="/athlete/login" className="text-[#C8211A] hover:underline">
          Já tem conta? Fazer login
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
        <Field label="Nome completo" error={errors.full_name?.message}>
          <input {...register("full_name")} className={fieldStyles.input} type="text" autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email?.message}>
          <input {...register("email")} className={fieldStyles.input} type="email" autoComplete="email" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Senha" error={errors.password?.message}>
            <input {...register("password")} className={fieldStyles.input} type="password" autoComplete="new-password" />
          </Field>
          <Field label="Confirmar senha" error={errors.confirm_password?.message}>
            <input {...register("confirm_password")} className={fieldStyles.input} type="password" autoComplete="new-password" />
          </Field>
        </div>
        <Field label="Academia" error={errors.academy?.message}>
          <input {...register("academy")} className={fieldStyles.input} type="text" />
        </Field>
        <Field label="Professor / Mestre" error={errors.professor?.message}>
          <input {...register("professor")} className={fieldStyles.input} type="text" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Faixa" error={errors.belt?.message}>
            <select {...register("belt")} className={fieldStyles.select}>
              {BELTS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>
          <Field label="Grau" error={errors.degree?.message}>
            <select {...register("degree")} className={fieldStyles.select}>
              {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </Field>
        </div>
        <Field label="País" error={errors.country?.message}>
          <input {...register("country")} className={fieldStyles.input} type="text" />
        </Field>
        <Field label="Categoria" error={errors.category?.message}>
          <select {...register("category")} className={fieldStyles.select}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Modalidade" error={errors.modality?.message}>
          <select {...register("modality")} className={fieldStyles.select}>
            {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>

        <button type="submit" disabled={submitting} className={fieldStyles.primaryBtn} style={btnStyle}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Criar Conta
        </button>
      </form>
    </AthleteAuthLayout>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={fieldStyles.label}>{label}</span>
      {children}
      {error && <span className={fieldStyles.error}>{error}</span>}
    </label>
  );
}
