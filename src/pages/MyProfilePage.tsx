import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useRequireActiveAthlete } from "@/hooks/useRequireActiveAthlete";

const CATEGORIES = [
  "Infanto-Juvenil", "Juvenil", "Adulto",
  "Master 1", "Master 2", "Master 3", "Master 4",
] as const;
const MODALITIES = ["GI", "NO-GI", "GI & NO-GI"] as const;

const profileSchema = z.object({
  full_name: z.string().trim().min(3, "Nome obrigatório").max(120),
  academy: z.string().trim().max(120).optional().or(z.literal("")),
  professor: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().min(1, "País obrigatório").max(80),
  category: z.enum(CATEGORIES),
  modality: z.enum(MODALITIES),
});
type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    password: z.string().min(8, "Mínimo 8 caracteres").max(128),
    confirm_password: z.string().min(8).max(128),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "As senhas não coincidem",
    path: ["confirm_password"],
  });
type PasswordForm = z.infer<typeof passwordSchema>;

const inputCls =
  "w-full h-11 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-[#C8211A] focus:ring-1 focus:ring-[#C8211A]";
const labelCls = "block text-xs uppercase tracking-wider text-gray-500 mb-1.5";
const errorCls = "block text-xs text-[#C8211A] mt-1";
const btnPrimary =
  "w-full h-11 bg-[#C8211A] hover:bg-[#8B1612] text-white text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 disabled:opacity-60 transition-colors";
const btnStyle = { fontFamily: "Barlow Condensed", fontWeight: 700 } as const;

export function MyProfilePage() {
  const { profile, user, isLoading, refresh } = useRequireActiveAthlete();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: "",
      academy: "",
      professor: "",
      country: "Brasil",
      category: "Adulto",
      modality: "GI & NO-GI",
    },
  });

  // Hydrate form once profile loads
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name,
        academy: profile.academy ?? "",
        professor: profile.professor ?? "",
        country: profile.country ?? "Brasil",
        category: (profile.category as ProfileForm["category"]) ?? "Adulto",
        modality: (profile.modality as ProfileForm["modality"]) ?? "GI & NO-GI",
      });
    }
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  if (isLoading || !profile || !user) {
    return (
      <div className="bg-gray-50 min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  async function onSaveProfile(values: ProfileForm) {
    if (!profile) return;
    const { error } = await supabase
      .from("athlete_profiles")
      .update({
        full_name: values.full_name,
        academy: values.academy || null,
        professor: values.professor || null,
        country: values.country,
        category: values.category,
        modality: values.modality,
      })
      .eq("id", profile.id);
    if (error) {
      toast.error(`Falha ao salvar: ${error.message}`);
      return;
    }
    await refresh();
    toast.success("Perfil atualizado.");
  }

  async function onChangePassword(values: PasswordForm) {
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      toast.error(`Falha: ${error.message}`);
      return;
    }
    passwordForm.reset({ password: "", confirm_password: "" });
    toast.success("Senha atualizada.");
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${profile.user_id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("athlete-photos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("athlete-photos").getPublicUrl(path);
      const { error: updErr } = await supabase
        .from("athlete_profiles")
        .update({ photo_url: pub.publicUrl })
        .eq("id", profile.id);
      if (updErr) throw updErr;
      await refresh();
      toast.success("Foto atualizada.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(`Falha ao enviar foto: ${msg}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const initials = profile.full_name
    .trim().split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2).join("");

  const statusBadge = profile.status === "active"
    ? { cls: "bg-green-50 text-green-700 border-green-200", label: "Ativo" }
    : profile.status === "pending"
      ? { cls: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "Pendente" }
      : { cls: "bg-red-50 text-red-700 border-red-200", label: "Suspenso" };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-6">
        <header className="mb-10">
          <h1 className="text-3xl text-gray-900 uppercase font-heading font-bold tracking-wide">
            Meu Perfil
          </h1>
          <div className="h-1 w-12 bg-[#C8211A] rounded mt-3" />
        </header>

        {/* Dados Pessoais */}
        <Section title="Dados Pessoais">
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center" style={{ outline: "2px solid #C8A84B", outlineOffset: "2px" }}>
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl text-[#C8A84B]" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
                    {initials}
                  </span>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 bg-[#C8211A] text-white rounded-full p-1.5 shadow hover:bg-[#8B1612] disabled:opacity-60"
                aria-label="Atualizar foto"
              >
                {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
            <div>
              <p className="text-lg text-gray-900" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
                Faixa {profile.belt} · {profile.degree}º grau
              </p>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "Barlow" }}>
                Faixa e grau são alterados pela federação.
              </p>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-3.5">
            <Field label="Nome completo" error={profileForm.formState.errors.full_name?.message}>
              <input {...profileForm.register("full_name")} className={inputCls} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Academia" error={profileForm.formState.errors.academy?.message}>
                <input {...profileForm.register("academy")} className={inputCls} />
              </Field>
              <Field label="Professor" error={profileForm.formState.errors.professor?.message}>
                <input {...profileForm.register("professor")} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="País" error={profileForm.formState.errors.country?.message}>
                <input {...profileForm.register("country")} className={inputCls} />
              </Field>
              <Field label="Categoria" error={profileForm.formState.errors.category?.message}>
                <select {...profileForm.register("category")} className={cn(inputCls, "bg-white")}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Modalidade" error={profileForm.formState.errors.modality?.message}>
                <select {...profileForm.register("modality")} className={cn(inputCls, "bg-white")}>
                  {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Field>
            </div>
            <button type="submit" disabled={profileForm.formState.isSubmitting} className={btnPrimary} style={btnStyle}>
              {profileForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Salvar Alterações
            </button>
          </form>
        </Section>

        {/* Segurança */}
        <Section title="Segurança">
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Nova senha" error={passwordForm.formState.errors.password?.message}>
                <input type="password" {...passwordForm.register("password")} className={inputCls} autoComplete="new-password" />
              </Field>
              <Field label="Confirmar nova senha" error={passwordForm.formState.errors.confirm_password?.message}>
                <input type="password" {...passwordForm.register("confirm_password")} className={inputCls} autoComplete="new-password" />
              </Field>
            </div>
            <button type="submit" disabled={passwordForm.formState.isSubmitting} className={btnPrimary} style={btnStyle}>
              {passwordForm.formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Atualizar Senha
            </button>
          </form>
        </Section>

        {/* Conta */}
        <Section title="Conta">
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm" style={{ fontFamily: "Barlow" }}>
            <Info label="Email" value={user.email ?? "—"} />
            <Info
              label="Status"
              value={
                <span className={cn("inline-block px-2.5 py-1 text-xs uppercase tracking-wider border rounded-full", statusBadge.cls)} style={{ fontFamily: "Barlow", fontWeight: 600 }}>
                  {statusBadge.label}
                </span>
              }
            />
            <Info label="Data de cadastro" value={new Date(profile.created_at).toLocaleDateString("pt-BR")} />
            <Info label="Válido até" value={profile.valid_until ? new Date(profile.valid_until).toLocaleDateString("pt-BR") : "—"} />
            <Info label="ID do atleta" value={profile.registration_number ?? "—"} />
          </dl>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
      <h2 className="text-lg uppercase text-gray-900 tracking-wide mb-5" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      {children}
      {error && <span className={errorCls}>{error}</span>}
    </label>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</dt>
      <dd className="text-gray-900">{value}</dd>
    </div>
  );
}
