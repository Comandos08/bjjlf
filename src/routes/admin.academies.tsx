/**
 * /admin/academies — affiliated academies CRUD.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAdminAuth, canWrite } from "@/lib/admin-auth";
import {
  useAdminAcademies, useUpsertAcademy, useDeleteAcademy, useToggleAcademyField, type AcademyRow,
} from "@/lib/admin-queries";
import {
  AdminButton, AdminToggle, AdminModal, AdminConfirm,
  AdminSection, AdminTableShell, AdminTH, AdminTD, EmptyState,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/academies")({
  head: () => ({ meta: [{ title: "Academias — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AcademiesAdminPage,
});

const BELTS = ["white", "blue", "purple", "brown", "black", "coral", "red"];

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }
function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}
function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function AcademiesAdminPage() {
  const { role } = useAdminAuth();
  const writable = canWrite(role, "academies");
  const { data: rows = [], isLoading } = useAdminAcademies();
  const toggleField = useToggleAcademyField();
  const del = useDeleteAcademy();
  const [editing, setEditing] = useState<AcademyRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<AcademyRow | null>(null);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterState, setFilterState] = useState("");

  const countries = useMemo(() => uniq(rows.map((r) => r.country_code)), [rows]);
  const states = useMemo(() => uniq(rows.map((r) => r.state).filter(Boolean) as string[]), [rows]);

  const filtered = useMemo(() => rows.filter((r) =>
    (!filterCountry || r.country_code === filterCountry) &&
    (!filterState || r.state === filterState),
  ), [rows, filterCountry, filterState]);

  return (
    <AdminSection
      title="Academias"
      actions={writable && <AdminButton onClick={() => setCreating(true)}><Plus size={16} /> Nova Academia</AdminButton>}
    >
      <div className="grid grid-cols-2 gap-2 max-w-md">
        <select className="admin-input" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
          <option value="">Todos os países</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="admin-input" value={filterState} onChange={(e) => setFilterState(e.target.value)}>
          <option value="">Todos os estados</option>
          {states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-[#666666]" /></div>
      ) : filtered.length === 0 ? (
        <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}><EmptyState message="Nenhuma academia." /></div>
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTH className="w-[60px]">Logo</AdminTH>
              <AdminTH>Nome</AdminTH>
              <AdminTH>Professor</AdminTH>
              <AdminTH>Cidade/País</AdminTH>
              <AdminTH>Faixa</AdminTH>
              <AdminTH>Afiliada desde</AdminTH>
              <AdminTH>Ativa</AdminTH>
              <AdminTH className="text-right">Ações</AdminTH>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-[#F5F5F5]">
                <AdminTD>
                  {r.logo_url ? <img src={r.logo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    : <div className="h-10 w-10 rounded-full bg-[#E5E5E5] grid place-items-center text-xs font-bold text-[#1A1A1A]">{initials(r.name)}</div>}
                </AdminTD>
                <AdminTD className="text-[#1A1A1A] font-medium">{r.name}</AdminTD>
                <AdminTD>{r.professor}</AdminTD>
                <AdminTD>{r.city}{r.state ? `, ${r.state}` : ""} — {r.flag_emoji} {r.country_code}</AdminTD>
                <AdminTD>{r.belt} {r.belt_degree > 0 ? `${r.belt_degree}°` : ""}</AdminTD>
                <AdminTD>{new Date(r.affiliated_since).toLocaleDateString("pt-BR")}</AdminTD>
                <AdminTD>
                  <AdminToggle checked={r.is_active} disabled={!writable}
                    onChange={(v) => toggleField.mutate({ id: r.id, field: "is_active", value: v })} />
                </AdminTD>
                <AdminTD className="text-right">
                  {writable && (
                    <div className="inline-flex gap-1">
                      <button onClick={() => setEditing(r)} className="text-[#C8A84B] p-1.5"><Pencil size={14} /></button>
                      <button onClick={() => setConfirmDelete(r)} className="text-[#C8211A] p-1.5"><Trash2 size={14} /></button>
                    </div>
                  )}
                </AdminTD>
              </tr>
            ))}
          </tbody>
        </AdminTableShell>
      )}

      <AcademyFormModal open={creating || !!editing} row={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      <AdminConfirm
        open={!!confirmDelete}
        message={`Excluir "${confirmDelete?.name}"?`}
        confirmLabel="Excluir"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && del.mutate(confirmDelete.id, { onSuccess: () => { toast.success("Excluído."); setConfirmDelete(null); } })}
      />
    </AdminSection>
  );
}

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(80),
  professor: z.string().trim().min(1).max(120),
  belt: z.string().min(1),
  belt_degree: z.coerce.number().int().min(0).max(9),
  city: z.string().trim().min(1).max(120),
  state: z.string().max(120).optional().or(z.literal("")),
  country: z.string().trim().min(1).max(120),
  country_code: z.string().trim().length(2).toUpperCase(),
  flag_emoji: z.string().max(10).optional().or(z.literal("")),
  logo_url: z.string().max(500).optional().or(z.literal("")),
  affiliated_since: z.string().min(1),
  website_url: z.string().max(500).optional().or(z.literal("")),
  instagram_url: z.string().max(500).optional().or(z.literal("")),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function AcademyFormModal({ open, row, onClose }: { open: boolean; row: AcademyRow | null; onClose: () => void }) {
  const upsert = useUpsertAcademy();
  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: row?.name ?? "",
      slug: row?.slug ?? "",
      professor: row?.professor ?? "",
      belt: row?.belt ?? "black",
      belt_degree: row?.belt_degree ?? 0,
      city: row?.city ?? "",
      state: row?.state ?? "",
      country: row?.country ?? "",
      country_code: row?.country_code ?? "",
      flag_emoji: row?.flag_emoji ?? "",
      logo_url: row?.logo_url ?? "",
      affiliated_since: row?.affiliated_since ?? new Date().toISOString().slice(0, 10),
      website_url: row?.website_url ?? "",
      instagram_url: row?.instagram_url ?? "",
      is_active: row?.is_active ?? true,
    },
  });
  const logo = watch("logo_url");
  const isActive = watch("is_active");

  function onSubmit(v: FormValues) {
    upsert.mutate(
      { id: row?.id, values: {
        ...v,
        state: v.state || null,
        flag_emoji: v.flag_emoji || null,
        logo_url: v.logo_url || null,
        website_url: v.website_url || null,
        instagram_url: v.instagram_url || null,
      } },
      { onSuccess: () => { toast.success("Salvo!"); reset(); onClose(); }, onError: (e) => toast.error((e as Error).message) },
    );
  }

  return (
    <AdminModal open={open} onClose={onClose} title={row ? "Editar Academia" : "Nova Academia"} maxWidth={720}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="admin-label">Nome</label>
            <input className="admin-input w-full" {...register("name")} onBlur={(e) => { if (!watch("slug")) setValue("slug", slugify(e.target.value)); }} />
          </div>
          <div>
            <label className="admin-label">Slug</label>
            <input className="admin-input w-full" {...register("slug")} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1"><label className="admin-label">Professor</label><input className="admin-input w-full" {...register("professor")} /></div>
          <div><label className="admin-label">Faixa</label>
            <select className="admin-input w-full" {...register("belt")}>{BELTS.map((b) => <option key={b} value={b}>{b}</option>)}</select>
          </div>
          <div><label className="admin-label">Grau</label>
            <select className="admin-input w-full" {...register("belt_degree")}>
              {Array.from({ length: 10 }, (_, i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div><label className="admin-label">Cidade</label><input className="admin-input w-full" {...register("city")} /></div>
          <div><label className="admin-label">Estado</label><input className="admin-input w-full" {...register("state")} /></div>
          <div><label className="admin-label">País</label><input className="admin-input w-full" {...register("country")} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="admin-label">Cód.</label><input maxLength={2} className="admin-input w-full uppercase" {...register("country_code")} /></div>
            <div><label className="admin-label">🏳️</label><input className="admin-input w-full" {...register("flag_emoji")} /></div>
          </div>
        </div>
        <div>
          <label className="admin-label">URL do logo</label>
          <input className="admin-input w-full" {...register("logo_url")} />
          {logo && <img src={logo} alt="" className="mt-2 h-16 w-16 rounded-full object-cover border" style={{ borderColor: "#E5E5E5" }} />}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="admin-label">Afiliada desde</label><input type="date" className="admin-input w-full" {...register("affiliated_since")} /></div>
          <div><label className="admin-label">Site</label><input className="admin-input w-full" {...register("website_url")} /></div>
          <div><label className="admin-label">Instagram</label><input className="admin-input w-full" {...register("instagram_url")} /></div>
        </div>
        <AdminToggle checked={isActive} onChange={(v) => setValue("is_active", v)} label="Ativa" />
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
          <AdminButton variant="outline" onClick={onClose}>Cancelar</AdminButton>
          <AdminButton type="submit" disabled={upsert.isPending}>{upsert.isPending && <Loader2 size={14} className="animate-spin" />} Salvar</AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}
