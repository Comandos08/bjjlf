/**
 * Admin login page.
 *
 * - Email + password (Supabase Auth).
 * - After sign-in, look up the user in `admin_users`. If row missing or
 *   `is_active=false`, sign out and show "Acesso negado".
 * - On success → /admin.
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
import { useAdminAuth } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "BJJLF Admin — Login" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(1, "Senha obrigatória").max(128),
});
type FormValues = z.infer<typeof schema>;

function LoginPage() {
  const navigate = useNavigate();
  const { user, role, isLoading } = useAdminAuth();
  const [submitting, setSubmitting] = useState(false);

  // Already signed in as a valid admin? Skip the form.
  useEffect(() => {
    if (!isLoading && user && role) {
      void navigate({ to: "/admin" });
    }
  }, [isLoading, user, role, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (!userId) throw new Error("Falha no login.");

      // Verify admin membership server-side (RLS already protects writes,
      // but we want to fail fast before showing the panel).
      const { data: row } = await supabase
        .from("admin_users")
        .select("is_active")
        .eq("id", userId)
        .maybeSingle();

      if (!row || !row.is_active) {
        await supabase.auth.signOut();
        toast.error("Acesso negado. Conta inativa.");
        return;
      }

      toast.success("Login efetuado.");
      await navigate({ to: "/admin" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro desconhecido.";
      toast.error(`Falha no login: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center px-4" style={{ background: "#0A0A0A" }}>
      <div className="w-full max-w-[400px]">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>
        <div className="border" style={{ background: "#111111", borderColor: "#222" }}>
          <div className="p-6 border-b" style={{ borderColor: "#222" }}>
            <h1 className="text-white text-xl font-bold uppercase" style={{ fontFamily: "Barlow Condensed" }}>
              Acesso Admin
            </h1>
            <p className="text-[#888] text-sm mt-1">Entre com suas credenciais.</p>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[#888] mb-1.5">Email</span>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                className="admin-input w-full"
                placeholder="admin@bjjlf.com"
              />
              {errors.email && <span className="block text-xs text-[#C41E3A] mt-1">{errors.email.message}</span>}
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-[#888] mb-1.5">Senha</span>
              <input
                {...register("password")}
                type="password"
                autoComplete="current-password"
                className="admin-input w-full"
              />
              {errors.password && <span className="block text-xs text-[#C41E3A] mt-1">{errors.password.message}</span>}
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 text-white font-semibold uppercase tracking-wide text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: "#C41E3A", borderRadius: 0 }}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Entrar no Admin
            </button>
            <div className="pt-2 text-center">
              <span className="text-[#666] text-xs">Esqueci a senha</span>
            </div>
          </form>
        </div>
        <div className="text-center mt-4">
          <Link to="/" className="text-[#666] text-xs hover:text-[#999]">← Voltar ao site</Link>
        </div>
      </div>
    </div>
  );
}
