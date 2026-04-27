/**
 * One-time super_admin bootstrap page.
 *
 * Lifecycle:
 *   1. On mount, call the public `super_admin_exists()` SQL function.
 *   2. If true → permanent redirect to /admin/login (page is dead forever).
 *   3. If false → render the form. Submitting:
 *        a. supabase.auth.signUp({ email, password })
 *        b. supabase.rpc('bootstrap_first_admin', {...}) — server-side guard
 *           refuses to create a second super_admin even if the client is
 *           tampered with.
 *        c. signInWithPassword to ensure a session is active
 *        d. navigate to /admin
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/setup")({
  head: () => ({
    meta: [
      { title: "BJJLF Admin — Setup" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SetupPage,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Nome muito curto").max(100),
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
});
type FormValues = z.infer<typeof schema>;

function SetupPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase.rpc("super_admin_exists");
      if (cancelled) return;
      if (error) {
        // Fail safe: if we can't tell, refuse to show the form.
        toast.error("Erro ao verificar configuração inicial.");
        await navigate({ to: "/admin/login" });
        return;
      }
      if (data === true) {
        await navigate({ to: "/admin/login" });
        return;
      }
      setAllowed(true);
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      // Step 1: create the auth user. Use emailRedirectTo so confirmation links
      // (if enabled) come back to the right origin.
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/login`,
          data: { full_name: values.fullName },
        },
      });
      if (signUpError) throw signUpError;
      const userId = signUpData.user?.id;
      if (!userId) throw new Error("Falha ao criar usuário.");

      // Step 2: server-side bootstrap. Function refuses if a super_admin already exists.
      const { error: bootError } = await supabase.rpc("bootstrap_first_admin", {
        _user_id: userId,
        _email: values.email,
        _full_name: values.fullName,
      });
      if (bootError) throw bootError;

      // Step 3: ensure we have an active session (signUp may not auto-login if email confirm is on).
      if (!signUpData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (signInError) {
          // If email confirmation is required, we still bootstrapped successfully.
          toast.success("Super admin criado. Confirme seu email e faça login.");
          await navigate({ to: "/admin/login" });
          return;
        }
      }

      toast.success("Super admin criado com sucesso!");
      await navigate({ to: "/admin" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido.";
      toast.error(`Falha: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#F8F8F8" }}>
        <Loader2 className="h-6 w-6 animate-spin text-[#1A1A1A]" />
      </div>
    );
  }
  if (!allowed) return null;

  return (
    <div className="min-h-screen grid place-items-center px-4" style={{ background: "#F8F8F8" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
          <div className="p-6 border-b" style={{ borderColor: "#E5E5E5" }}>
            <h1 className="text-[#1A1A1A] text-xl font-bold uppercase" style={{ fontFamily: "Barlow Condensed" }}>
              Configuração Inicial
            </h1>
            <p className="text-[#666666] text-sm mt-1">Crie a primeira conta Super Admin do sistema.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <Field label="Nome completo" error={errors.fullName?.message}>
              <input
                {...register("fullName")}
                type="text"
                autoComplete="name"
                className="admin-input w-full"
                placeholder="Mestre Roberto Silva"
              />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="admin-input w-full"
                placeholder="admin@bjjlf.com"
              />
            </Field>
            <Field label="Senha" error={errors.password?.message}>
              <input
                {...register("password")}
                type="password"
                autoComplete="new-password"
                className="admin-input w-full"
                placeholder="Mínimo 8 caracteres"
              />
            </Field>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 text-white font-semibold uppercase tracking-wide text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#C8211A", borderRadius: 0 }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar Super Admin
            </button>
          </form>
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-[#999999] text-xs hover:text-[#666666]">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-[#666666] mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-[#C8211A] mt-1">{error}</span>}
    </label>
  );
}
