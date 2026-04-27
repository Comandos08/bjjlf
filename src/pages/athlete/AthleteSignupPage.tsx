import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { AthleteAuthLayout, fieldStyles, btnStyle } from "./AthleteAuthLayout";
import { BeltSelector } from "@/components/BeltSelector";
import { BELT_NAMES, defaultDegreeForBelt, degreesForBelt, type BeltName } from "@/lib/belts-ibjjf";
import { Controller } from "react-hook-form";

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

const BELTS = BELT_NAMES;
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

const accountSchema = z
  .object({
    full_name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(120),
    email: z.string().trim().min(1, "Email obrigatório").email("Email inválido").max(255),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres").max(128),
    confirm_password: z.string().min(8, "Confirme a senha").max(128),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "As senhas não coincidem.",
    path: ["confirm_password"],
  });

const profileSchema = z.object({
  academy: z.string().trim().min(2, "Academia deve ter no mínimo 2 caracteres").max(120),
  professor: z.string().trim().max(120).optional().or(z.literal("")),
  belt: z.string().refine((b) => (BELT_NAMES as string[]).includes(b), "Faixa inválida"),
  degree: z.coerce.number().int().min(0).max(10),
  country: z.string().trim().min(1, "País obrigatório").max(80),
  category: z.enum(CATEGORIES),
  modality: z.enum(MODALITIES),
}).refine((d) => degreesForBelt(d.belt).includes(d.degree), {
  message: "Grau inválido para esta faixa",
  path: ["degree"],
});

type AccountForm = z.infer<typeof accountSchema>;
type ProfileForm = z.infer<typeof profileSchema>;

export function AthleteSignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [account, setAccount] = useState<AccountForm | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      subtitle={step === 1 ? "Crie sua conta" : "Complete seu perfil esportivo"}
      footer={
        <Link to="/athlete/login" className="text-[#C8211A] hover:underline">
          Já tem conta? Fazer login
        </Link>
      }
    >
      <StepIndicator step={step} />

      {step === 1 ? (
        <AccountStep
          defaults={account ?? undefined}
          onSubmit={(values) => {
            setAccount(values);
            setSubmitError(null);
            setStep(2);
          }}
        />
      ) : (
        <ProfileStep
          submitting={submitting}
          submitError={submitError}
          onBack={() => setStep(1)}
          onSubmit={async (values) => {
            if (!account) return;
            setSubmitting(true);
            setSubmitError(null);
            try {
              const redirectTo = `${window.location.origin}/athlete/login`;
              const { data, error } = await supabase.auth.signUp({
                email: account.email,
                password: account.password,
                options: { emailRedirectTo: redirectTo, data: { full_name: account.full_name } },
              });
              if (error) throw error;
              const userId = data.user?.id;
              if (!userId) throw new Error("Falha ao criar usuário.");

              const { error: insertErr } = await supabase.from("athlete_profiles").insert({
                user_id: userId,
                full_name: account.full_name,
                belt: values.belt,
                degree: values.degree,
                academy: values.academy || null,
                professor: values.professor || null,
                country: values.country,
                category: values.category,
                modality: values.modality,
              });
              if (insertErr) throw insertErr;

              setSentEmail(account.email);
            } catch (e) {
              const err = e instanceof Error ? e : new Error("Erro desconhecido.");
              setSubmitError(parseSignupError(err));
            } finally {
              setSubmitting(false);
            }
          }}
        />
      )}
    </AthleteAuthLayout>
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center mb-6 px-2">
      <StepDot index={1} active={step >= 1} label="Conta" />
      <div
        className={cn(
          "h-0.5 flex-1 mx-2 transition-colors",
          step >= 2 ? "bg-[#C8211A]" : "bg-gray-200",
        )}
      />
      <StepDot index={2} active={step >= 2} label="Perfil" />
    </div>
  );
}

function StepDot({ index, active, label }: { index: number; active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "w-8 h-8 rounded-full grid place-items-center text-sm transition-colors",
          active ? "bg-[#C8211A] text-white" : "bg-gray-200 text-gray-400",
        )}
        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
      >
        {index}
      </div>
      <span
        className="text-xs text-gray-500 mt-1.5"
        style={{ fontFamily: "Barlow", fontWeight: 400 }}
      >
        {label}
      </span>
    </div>
  );
}

function AccountStep({
  defaults,
  onSubmit,
}: {
  defaults?: AccountForm;
  onSubmit: (values: AccountForm) => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    defaultValues: defaults,
  });

  return (
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
      <button type="submit" className={fieldStyles.primaryBtn} style={btnStyle}>
        Continuar →
      </button>
    </form>
  );
}

function ProfileStep({
  submitting,
  submitError,
  onBack,
  onSubmit,
}: {
  submitting: boolean;
  submitError: string | null;
  onBack: () => void;
  onSubmit: (values: ProfileForm) => Promise<void>;
}) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      belt: "Branca",
      degree: 0,
      country: "Brasil",
      category: "Adulto",
      modality: "GI & NO-GI",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      <Field label="Academia" error={errors.academy?.message}>
        <input {...register("academy")} className={fieldStyles.input} type="text" />
      </Field>
      <Field label="Professor / Mestre" error={errors.professor?.message}>
        <input {...register("professor")} className={fieldStyles.input} type="text" />
      </Field>
      <Controller
        control={control}
        name="belt"
        render={({ field: beltField }) => (
          <Controller
            control={control}
            name="degree"
            render={({ field: degreeField }) => (
              <div>
                <BeltSelector
                  belt={beltField.value}
                  degree={degreeField.value}
                  onBeltChange={(b: BeltName) => {
                    beltField.onChange(b);
                    degreeField.onChange(defaultDegreeForBelt(b));
                  }}
                  onDegreeChange={(d) => degreeField.onChange(d)}
                  selectClassName={fieldStyles.select}
                  labelClassName={fieldStyles.label}
                />
                {(errors.belt?.message || errors.degree?.message) && (
                  <span className={fieldStyles.error}>
                    {errors.belt?.message ?? errors.degree?.message}
                  </span>
                )}
              </div>
            )}
          />
        )}
      />
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

      {submitError && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="text-red-500 w-4 h-4 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
            {submitError}
          </p>
        </div>
      )}

      <button type="submit" disabled={submitting} className={fieldStyles.primaryBtn} style={btnStyle}>
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Criar Conta
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={submitting}
        className="w-full inline-flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-[#C8211A] transition-colors py-1"
        style={{ fontFamily: "Barlow", fontWeight: 500 }}
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Voltar
      </button>
    </form>
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
