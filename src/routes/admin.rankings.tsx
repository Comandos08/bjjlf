/**
 * /admin/rankings — filterable list + form. Writes locked to super_admin.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Loader2, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useAdminAuth, canWrite } from "@/lib/admin-auth";
import {
  useAdminRankings, useUpsertRanking, useDeleteRanking,
  useToggleRankingField, useRecalcRankings, type RankingRow,
} from "@/lib/admin-queries";
import {
  AdminButton, AdminToggle, AdminModal, AdminConfirm,
  AdminSection, AdminTableShell, AdminTH, AdminTD, EmptyState,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/rankings")({
  head: () => ({ meta: [{ title: "Rankings — BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: RankingsAdminPage,
});

const BELTS = [
  { value: "Branca",            label: "Branca" },
  { value: "Azul",              label: "Azul" },
  { value: "Roxa",              label: "Roxa" },
  { value: "Marrom",            label: "Marrom" },
  { value: "Preta",             label: "Preta" },
  { value: "Vermelha e Preta",  label: "Vermelha e Preta" },
  { value: "Vermelha e Branca", label: "Vermelha e Branca" },
  { value: "Vermelha",          label: "Vermelha" },
];
const GENDERS = ["male", "female"];
const MODALITIES = ["gi", "no_gi"];
const CATEGORIES = ["adult", "master", "kids", "juvenile"];

function uniq<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

function RankingsAdminPage() {
  const { role } = useAdminAuth();
  const writable = canWrite(role, "rankings");
  const { data: rows = [], isLoading } = useAdminRankings();
  const toggleField = useToggleRankingField();
  const del = useDeleteRanking();
  const recalc = useRecalcRankings();

  const [filters, setFilters] = useState({ season: "", modality: "", gender: "", belt: "", category: "" });
  const [editing, setEditing] = useState<RankingRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<RankingRow | null>(null);

  const seasons = useMemo(() => uniq(rows.map((r) => r.season)), [rows]);

  const filtered = useMemo(() => rows.filter((r) =>
    (!filters.season || r.season === filters.season) &&
    (!filters.modality || r.modality === filters.modality) &&
    (!filters.gender || r.gender === filters.gender) &&
    (!filters.belt || r.belt === filters.belt) &&
    (!filters.category || r.category === filters.category),
  ), [rows, filters]);

  return (
    <AdminSection
      title="Rankings"
      actions={
        <div className="flex gap-2">
          {writable && (
            <AdminButton variant="outline" onClick={() => recalc.mutate(filters, {
              onSuccess: () => toast.success("Posições recalculadas."),
              onError: (e) => toast.error((e as Error).message),
            })} disabled={recalc.isPending}>
              <RefreshCcw size={14} /> Recalcular Posições
            </AdminButton>
          )}
          {writable && <AdminButton onClick={() => setCreating(true)}><Plus size={16} /> Novo</AdminButton>}
        </div>
      }
    >
      <div className="grid grid-cols-5 gap-2">
        <select className="admin-input" value={filters.season} onChange={(e) => setFilters({ ...filters, season: e.target.value })}>
          <option value="">Todas as temporadas</option>
          {seasons.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="admin-input" value={filters.modality} onChange={(e) => setFilters({ ...filters, modality: e.target.value })}>
          <option value="">Todas as modalidades</option>
          {MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="admin-input" value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
          <option value="">Todos os gêneros</option>
          {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="admin-input" value={filters.belt} onChange={(e) => setFilters({ ...filters, belt: e.target.value })}>
          <option value="">Todas as faixas</option>
          {BELTS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
        </select>
        <select className="admin-input" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          <option value="">Todas as categorias</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="grid place-items-center py-16"><Loader2 className="animate-spin text-[#666666]" /></div>
      ) : filtered.length === 0 ? (
        <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}><EmptyState message="Nenhum ranking." /></div>
      ) : (
        <AdminTableShell>
          <thead>
            <tr>
              <AdminTH className="w-[50px]">Pos</AdminTH>
              <AdminTH>Atleta</AdminTH>
              <AdminTH>Academia</AdminTH>
              <AdminTH>País</AdminTH>
              <AdminTH>Pontos</AdminTH>
              <AdminTH>Faixa</AdminTH>
              <AdminTH>Modalidade</AdminTH>
              <AdminTH>Ativo</AdminTH>
              <AdminTH className="text-right">Ações</AdminTH>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-[#F5F5F5]">
                <AdminTD className="text-[#1A1A1A]">{r.position ?? "—"}</AdminTD>
                <AdminTD className="text-[#1A1A1A] font-medium">{r.athlete_name}</AdminTD>
                <AdminTD>{r.academy ?? "—"}</AdminTD>
                <AdminTD>{r.flag_emoji} {r.country_code}</AdminTD>
                <AdminTD>{r.points}</AdminTD>
                <AdminTD>{r.belt}</AdminTD>
                <AdminTD>{r.modality}</AdminTD>
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

      <RankingFormModal open={creating || !!editing} row={editing} onClose={() => { setCreating(false); setEditing(null); }} />
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
  country_code: z.string().trim().length(2).toUpperCase(),
  flag_emoji: z.string().max(10).optional().or(z.literal("")),
  belt: z.string().min(1),
  gender: z.string().min(1),
  category: z.string().min(1),
  modality: z.string().min(1),
  points: z.coerce.number().int().min(0),
  position: z.coerce.number().int().min(1).optional().or(z.literal("")),
  season: z.string().trim().min(1).max(40),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

function RankingFormModal({ open, row, onClose }: { open: boolean; row: RankingRow | null; onClose: () => void }) {
  const upsert = useUpsertRanking();
  const { register, handleSubmit, watch, setValue, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      athlete_name: row?.athlete_name ?? "",
      academy: row?.academy ?? "",
      country_code: row?.country_code ?? "",
      flag_emoji: row?.flag_emoji ?? "",
      belt: row?.belt ?? "Preta",
      gender: row?.gender ?? "male",
      category: row?.category ?? "adult",
      modality: row?.modality ?? "gi",
      points: row?.points ?? 0,
      position: (row?.position ?? "") as never,
      season: row?.season ?? new Date().getFullYear().toString(),
      is_active: row?.is_active ?? true,
    },
  });
  const isActive = watch("is_active");

  function onSubmit(v: FormValues) {
    upsert.mutate(
      { id: row?.id, values: {
        ...v,
        academy: v.academy || null,
        flag_emoji: v.flag_emoji || null,
        position: typeof v.position === "number" ? v.position : null,
      } },
      { onSuccess: () => { toast.success("Salvo!"); reset(); onClose(); }, onError: (e) => toast.error((e as Error).message) },
    );
  }

  return (
    <AdminModal open={open} onClose={onClose} title={row ? "Editar Ranking" : "Novo Ranking"}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div><label className="admin-label">Nome do atleta</label><input className="admin-input w-full" {...register("athlete_name")} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="admin-label">Academia</label><input className="admin-input w-full" {...register("academy")} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="admin-label">Cód. País</label><input maxLength={2} className="admin-input w-full uppercase" {...register("country_code")} /></div>
            <div><label className="admin-label">Bandeira</label><input className="admin-input w-full" {...register("flag_emoji")} /></div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div><label className="admin-label">Faixa</label><select className="admin-input w-full" {...register("belt")}>{BELTS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}</select></div>
          <div><label className="admin-label">Gênero</label><select className="admin-input w-full" {...register("gender")}>{GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}</select></div>
          <div><label className="admin-label">Categoria</label><select className="admin-input w-full" {...register("category")}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div><label className="admin-label">Modalidade</label><select className="admin-input w-full" {...register("modality")}>{MODALITIES.map((m) => <option key={m} value={m}>{m}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="admin-label">Pontos</label><input type="number" className="admin-input w-full" {...register("points")} /></div>
          <div><label className="admin-label">Posição</label><input type="number" className="admin-input w-full" {...register("position")} /></div>
          <div><label className="admin-label">Temporada</label><input className="admin-input w-full" {...register("season")} /></div>
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
