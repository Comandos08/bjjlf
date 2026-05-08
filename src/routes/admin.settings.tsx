/**
 * /admin/settings — super_admin-only.
 *
 * Two sections:
 *   - Admin users: list + toggle is_active + delete + create new (signUp + insert).
 *     Cannot deactivate or delete yourself.
 *   - Federation info: read-only placeholder.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  useAdminUsers, useToggleAdminUserActive, useDeleteAdminUser,
} from "@/lib/admin-queries";
import {
  AdminButton, AdminToggle, AdminBadge, AdminModal, AdminConfirm,
  AdminSection, AdminTableShell, AdminTH, AdminTD, EmptyState,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Configurações — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SettingsPage,
});

const ROLE_BADGE: Record<string, "red" | "gold" | "gray"> = {
  super_admin: "red", editor: "gold", viewer: "gray",
};

function SettingsPage() {
  const { role, user } = useAdminAuth();
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useAdminUsers();
  const toggleActive = useToggleAdminUserActive();
  const del = useDeleteAdminUser();
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; email: string } | null>(null);

  // Hard guard: viewers/editors land here → bounce back.
  useEffect(() => {
    if (role && role !== "super_admin") void navigate({ to: "/admin" });
  }, [role, navigate]);

  if (role !== "super_admin") return null;

  return (
    <div className="space-y-8">
      <AdminSection
        title="Usuários do Admin"
        actions={<AdminButton onClick={() => setCreating(true)}><Plus size={16} /> Novo Usuário</AdminButton>}
      >
        {isLoading ? (
          <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-[#666666]" /></div>
        ) : users.length === 0 ? (
          <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}><EmptyState message="Nenhum usuário." /></div>
        ) : (
          <AdminTableShell>
            <thead>
              <tr>
                <AdminTH>Nome</AdminTH>
                <AdminTH>Email</AdminTH>
                <AdminTH>Role</AdminTH>
                <AdminTH>Ativo</AdminTH>
                <AdminTH className="text-right">Ações</AdminTH>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = user?.id === u.id;
                return (
                  <tr key={u.id} className="hover:bg-[#F5F5F5]">
                    <AdminTD className="text-[#1A1A1A] font-medium">{u.full_name ?? "—"}</AdminTD>
                    <AdminTD>{u.email}</AdminTD>
                    <AdminTD><AdminBadge color={ROLE_BADGE[u.role] ?? "gray"}>{u.role}</AdminBadge></AdminTD>
                    <AdminTD>
                      <AdminToggle checked={u.is_active} disabled={isSelf}
                        onChange={(v) => toggleActive.mutate({ id: u.id, value: v }, {
                          onSuccess: () => toast.success("Atualizado."),
                          onError: (e) => toast.error((e as Error).message),
                        })} />
                    </AdminTD>
                    <AdminTD className="text-right">
                      {!isSelf && (
                        <button onClick={() => setConfirmDelete({ id: u.id, email: u.email })} className="text-[#C8211A] p-1.5"><Trash2 size={14} /></button>
                      )}
                    </AdminTD>
                  </tr>
                );
              })}
            </tbody>
          </AdminTableShell>
        )}
      </AdminSection>

      <AdminSection title="Informações da Federação">
        <div className="border p-6 space-y-3" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
          <div>
            <label className="admin-label">Nome da Federação</label>
            <input className="admin-input w-full" defaultValue="Brazilian Jiu-Jitsu Legends Federation" readOnly />
          </div>
          <div>
            <label className="admin-label">Contato público</label>
            <p className="text-sm text-[#666666]">
              Contato público via /contact. Nenhum email é exibido publicamente.
            </p>
          </div>
          <p className="text-xs text-[#999999] pt-2">Mais configurações disponíveis em breve.</p>
        </div>
      </AdminSection>

      <CreateUserModal open={creating} onClose={() => setCreating(false)} />
      <AdminConfirm
        open={!!confirmDelete}
        message={`Excluir o usuário "${confirmDelete?.email}"? A conta de autenticação não é removida automaticamente — apenas o registro de acesso admin.`}
        confirmLabel="Excluir"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && del.mutate(confirmDelete.id, {
          onSuccess: () => { toast.success("Excluído."); setConfirmDelete(null); },
          onError: (e) => toast.error((e as Error).message),
        })}
      />
    </div>
  );
}

const userSchema = z.object({
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(128),
  role: z.enum(["super_admin", "editor", "viewer"]),
  is_active: z.boolean(),
});
type UserFormValues = z.infer<typeof userSchema>;

function CreateUserModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { full_name: "", email: "", password: "", role: "viewer", is_active: true },
  });
  const isActive = watch("is_active");

  async function onSubmit(v: UserFormValues) {
    setSubmitting(true);
    try {
      // 1. Create auth user. signUp does NOT replace the current session — admin stays logged in.
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: v.email,
        password: v.password,
      });
      if (signUpErr) throw signUpErr;
      const newId = signUpData.user?.id;
      if (!newId) throw new Error("Falha ao criar usuário de autenticação.");

      // 2. Insert admin row (RLS allows because current session is still super_admin).
      const { error: insertErr } = await supabase
        .from("admin_users")
        .insert({ id: newId, email: v.email, full_name: v.full_name, role: v.role, is_active: v.is_active });
      if (insertErr) throw insertErr;

      toast.success("Usuário criado!");
      reset();
      onClose();
    } catch (e) {
      toast.error(`Erro: ${(e as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminModal open={open} onClose={onClose} title="Novo Usuário">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div><label className="admin-label">Nome</label><input className="admin-input w-full" {...register("full_name")} />
          {errors.full_name && <span className="text-xs text-[#C8211A]">{errors.full_name.message}</span>}</div>
        <div><label className="admin-label">Email</label><input type="email" className="admin-input w-full" {...register("email")} />
          {errors.email && <span className="text-xs text-[#C8211A]">{errors.email.message}</span>}</div>
        <div><label className="admin-label">Senha</label><input type="password" className="admin-input w-full" {...register("password")} />
          {errors.password && <span className="text-xs text-[#C8211A]">{errors.password.message}</span>}</div>
        <div><label className="admin-label">Role</label>
          <select className="admin-input w-full" {...register("role")}>
            <option value="viewer">viewer</option>
            <option value="editor">editor</option>
            <option value="super_admin">super_admin</option>
          </select>
        </div>
        <AdminToggle checked={isActive} onChange={(v) => setValue("is_active", v)} label="Ativo" />
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
          <AdminButton variant="outline" onClick={onClose} disabled={submitting}>Cancelar</AdminButton>
          <AdminButton type="submit" disabled={submitting}>{submitting && <Loader2 size={14} className="animate-spin" />} Criar</AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}
