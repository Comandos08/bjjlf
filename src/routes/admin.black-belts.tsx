/**
 * /admin/black-belts — certified black belts CRUD.
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
  useAdminBlackBelts, useUpsertBlackBelt, useDeleteBlackBelt, useToggleBlackBeltField, type BlackBeltRow,
} from "@/lib/admin-queries";
import {
  AdminButton, AdminToggle, AdminBadge, AdminModal, AdminConfirm,
  AdminSection, AdminTableShell, AdminTH, AdminTD, EmptyState,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/black-belts")({
  head: () => ({ meta: [{ title: "Faixas Pretas — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: BlackBeltsAdminPage,
});

const BELT_TYPES = [
  { value: "preta", label: "Preta", color: "gray" as const, degrees: [1, 2, 3, 4, 5, 6], danLabel: true },
  { value: "coral", label: "Coral", color: "orange" as const, degrees: [7, 8], danLabel: true },
  { value: "vermelha_branca", label: "Vermelha e Branca", color: "red" as const, degrees: [7, 8], danLabel: true },
  { value: "vermelha", label: "Vermelha", color: "red" as const, degrees: [9, 10], danLabel: true },
];

function degreesForBeltType(type: string): number[] {
  return BELT_TYPES.find((b) => b.value === type)?.degrees ?? [0];
}

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function BlackBeltsAdminPage() {
  const { role } = useAdminAuth();
  const writable = canWrite(role, "black-belts");
  const { data: rows = [], isLoading } = useAdminBlackBelts();
  const toggleField = useToggleBlackBeltField();
  const del = useDeleteBlackBelt();
  const [editing, setEditing] = useState<BlackBeltRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<BlackBeltRow | null>(null);
  const [filterBelt, setFilterBelt] = useState("");
  const [filterCountry, setFilterCountry] = useState("");

  const countries = useMemo(() => uniq(rows.map((r) => r.country_code)), [rows]);

  const filtered = useMemo(() => rows.filter((r) =>
    (!filterBelt || r.belt_type === filterBelt) &&
    (!filterCountry || r.country_code === filterCountry),
  ), [rows, filterBelt, filterCountry]);

  return (
    <AdminSection
      title="Faixas Pretas"
      actions={writable && <AdminButton onClick={() => setCreating(true)}><Plus size={16} /> Nova Faixa Preta</AdminButton>}
    >
      <div className="grid grid-cols-2 gap-2 max-w-md">
        <select className="admin-input" value={filterBelt} onChange={(e) => setFilterBelt(e.target.value)}>
          <option value="">Todas as faixas</option>
          {BELT_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <select className="admin-input" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
          <option value="">Todos os países</option>
          {countries.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-[#666666]" /></div>
      ) : filtered.length === 0 ? (
        <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}><EmptyState message="Nenhuma faixa preta." /></div>
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTH className="w-[60px]">Foto</AdminTH>
              <AdminTH>Nome</AdminTH>
              <AdminTH>Faixa</AdminTH>
              <AdminTH>Academia</AdminTH>
              <AdminTH>Professor</AdminTH>
              <AdminTH>País</AdminTH>
              <AdminTH>Certificado</AdminTH>
              <AdminTH>Data</AdminTH>
              <AdminTH>Ativo</AdminTH>
              <AdminTH className="text-right">Ações</AdminTH>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const beltType = BELT_TYPES.find((b) => b.value === r.belt_type);
              return (
                <tr key={r.id} className="hover:bg-[#F5F5F5]">
                  <AdminTD>
                    {r.photo_url ? (
                      <img src={r.photo_url} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-[#E5E5E5] grid place-items-center text-xs font-bold text-[#1A1A1A]">{initials(r.athlete_name)}</div>
                    )}
                  </AdminTD>
                  <AdminTD className="text-[#1A1A1A] font-medium">{r.athlete_name}</AdminTD>
                  <AdminTD><AdminBadge color={beltType?.color ?? "gray"}>{beltType?.label ?? r.belt_type} {r.belt_degree > 0 ? `· ${r.belt_degree}º Dan` : ""}</AdminBadge></AdminTD>
                  <AdminTD>{r.academy ?? "—"}</AdminTD>
                  <AdminTD>{r.professor ?? "—"}</AdminTD>
                  <AdminTD>{r.flag_emoji} {r.country_code}</AdminTD>
                  <AdminTD className="font-mono text-xs">{r.certificate_number}</AdminTD>
                  <AdminTD>{new Date(r.certified_at).toLocaleDateString("pt-BR")}</AdminTD>
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
              );
            })}
          </tbody>
        </AdminTableShell>
      )}

      <BlackBeltFormModal open={creating || !!editing} row={editing} onClose={() => { setCreating(false); setEditing(null); }} />
      <AdminConfirm
        open={!!confirmDelete}
        message={`Excluir "${confirmDelete?.athlete_name}"?`}
        confirmLabel="Excluir"
        loading={del.isPending}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete && del.mutate(confirmDelete.id, { onSuccess: () => { toast.success("Excluído."); setConfirmDelete(null); } })}
      />
    </AdminSection>
  );
}

const schema = z.object({
  athlete_name: z.string().trim().min(1).max(120),
  academy: z.string().max(120).optional().or(z.literal("")),
  professor: z.string().max(120).optional().or(z.literal("")),
  belt_type: z.string().min(1),
  belt_degree: z.coerce.number().int().min(0).max(9),
  country_code: z.string().trim().length(2).toUpperCase(),
  flag_emoji: z.string().max(10).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  certificate_number: z.string().trim().min(1).max(50),
  certified_at: z.string().min(1),
  photo_url: z.string().max(500).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function suggestCertificateNumber() {
  const year = new Date().getFullYear();
  const seq = Math.floor(1000 + Math.random() * 9000);
  return `BJJLF-${year}-${seq}`;
}

function BlackBeltFormModal({ open, row, onClose }: { open: boolean; row: BlackBeltRow | null; onClose: () => void }) {
  const upsert = useUpsertBlackBelt();
  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      athlete_name: row?.athlete_name ?? "",
      academy: row?.academy ?? "",
      professor: row?.professor ?? "",
      belt_type: row?.belt_type ?? "preta",
      belt_degree: row?.belt_degree ?? 0,
      country_code: row?.country_code ?? "",
      flag_emoji: row?.flag_emoji ?? "",
      city: row?.city ?? "",
      certificate_number: row?.certificate_number ?? suggestCertificateNumber(),
      certified_at: row?.certified_at ?? new Date().toISOString().slice(0, 10),
      photo_url: row?.photo_url ?? "",
      is_active: row?.is_active ?? true,
    },
  });
  const photo = watch("photo_url");
  const isActive = watch("is_active");
  const currentBeltType = watch("belt_type");
  const allowedDegrees = degreesForBeltType(currentBeltType);

  // Auto-clamp degree when belt_type changes to one with a different range.
  function handleBeltTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newType = e.target.value;
    setValue("belt_type", newType);
    const allowed = degreesForBeltType(newType);
    setValue("belt_degree", allowed[0] ?? 0);
  }

  function onSubmit(v: FormValues) {
    upsert.mutate(
      { id: row?.id, values: {
        ...v,
        academy: v.academy || null, professor: v.professor || null,
        flag_emoji: v.flag_emoji || null, city: v.city || null,
        photo_url: v.photo_url || null,
      } },
      { onSuccess: () => { toast.success("Salvo!"); reset(); onClose(); }, onError: (e) => toast.error((e as Error).message) },
    );
  }

  return (
    <AdminModal open={open} onClose={onClose} title={row ? "Editar Faixa Preta" : "Nova Faixa Preta"} maxWidth={680}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div><label className="admin-label">Nome do atleta</label><input className="admin-input w-full" {...register("athlete_name")} /></div>
          <div><label className="admin-label">Academia</label><input className="admin-input w-full" {...register("academy")} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="admin-label">Professor</label><input className="admin-input w-full" {...register("professor")} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="admin-label">Tipo de faixa</label>
              <select className="admin-input w-full" {...register("belt_type")} onChange={handleBeltTypeChange}>
                {BELT_TYPES.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </div>
            <div><label className="admin-label">Dan</label>
              <select className="admin-input w-full" {...register("belt_degree")}>
                {allowedDegrees.map((d) => <option key={d} value={d}>{d}º Dan</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="admin-label">Cód. País</label><input maxLength={2} className="admin-input w-full uppercase" {...register("country_code")} /></div>
          <div><label className="admin-label">Bandeira</label><input className="admin-input w-full" {...register("flag_emoji")} /></div>
          <div><label className="admin-label">Cidade</label><input className="admin-input w-full" {...register("city")} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="admin-label">Nº Certificado</label><input className="admin-input w-full font-mono" {...register("certificate_number")} /></div>
          <div><label className="admin-label">Data de certificação</label><input type="date" className="admin-input w-full" {...register("certified_at")} /></div>
        </div>
        <div>
          <label className="admin-label">URL da foto</label>
          <input className="admin-input w-full" {...register("photo_url")} />
          {photo && <img src={photo} alt="" className="mt-2 h-16 w-16 rounded-full object-cover border" style={{ borderColor: "#E5E5E5" }} />}
        </div>
        <AdminToggle checked={isActive} onChange={(v) => setValue("is_active", v)} label="Ativo" />
        <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#E5E5E5" }}>
          <AdminButton variant="outline" onClick={onClose}>Cancelar</AdminButton>
          <AdminButton type="submit" disabled={upsert.isPending}>{upsert.isPending && <Loader2 size={14} className="animate-spin" />} Salvar</AdminButton>
        </div>
      </form>
    </AdminModal>
  );
}
