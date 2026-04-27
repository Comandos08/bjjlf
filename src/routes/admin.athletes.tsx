import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/athletes")({
  head: () => ({ meta: [{ title: "Admin — Atletas" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminAthletesPage,
});

type Row = {
  id: string;
  user_id: string;
  full_name: string;
  belt: string;
  degree: number;
  academy: string | null;
  status: "pending" | "active" | "suspended";
  created_at: string;
  registration_number: string | null;
  valid_until: string | null;
};

const BELTS = ["Branca", "Azul", "Roxa", "Marrom", "Preta", "Coral", "Vermelha"];

function AdminAthletesPage() {
  const { user } = useAdminAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Row["status"]>("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("athlete_profiles")
      .select("id, user_id, full_name, belt, degree, academy, status, created_at, registration_number, valid_until")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    return rows
      .filter((r) => filter === "all" ? true : r.status === filter)
      .filter((r) => {
        if (!q.trim()) return true;
        const needle = q.toLowerCase();
        return r.full_name.toLowerCase().includes(needle)
          || (r.academy?.toLowerCase().includes(needle) ?? false)
          || (r.registration_number?.toLowerCase().includes(needle) ?? false);
      });
  }, [rows, filter, q]);

  const pending = rows.filter((r) => r.status === "pending").length;

  async function approve(r: Row) {
    const validUntil = new Date();
    validUntil.setFullYear(validUntil.getFullYear() + 1);
    const { error } = await supabase
      .from("athlete_profiles")
      .update({
        status: "active",
        approved_at: new Date().toISOString(),
        approved_by: user?.id ?? null,
        valid_until: validUntil.toISOString().slice(0, 10),
      })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`${r.full_name} aprovado.`);
    void load();
  }

  async function suspend(r: Row) {
    const { error } = await supabase.from("athlete_profiles").update({ status: "suspended" }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`${r.full_name} suspenso.`);
    void load();
  }

  async function reactivate(r: Row) {
    const { error } = await supabase.from("athlete_profiles").update({ status: "active" }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success(`${r.full_name} reativado.`);
    void load();
  }

  return (
    <div className="text-[#1A1A1A]">
      {pending > 0 && (
        <div className="mb-5 px-4 py-3 rounded border border-yellow-700 bg-yellow-900/30 text-yellow-200 text-sm">
          {pending} {pending === 1 ? "atleta pendente de aprovação" : "atletas pendentes de aprovação"}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome, academia ou ID…"
            className="admin-input w-full pl-9"
          />
        </div>
        <div className="flex gap-1">
          {(["all", "pending", "active", "suspended"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "px-3 py-2 text-xs uppercase tracking-wider border",
                filter === s ? "bg-[#C8211A] border-[#C8211A] text-[#1A1A1A]" : "border-[#E5E5E5] text-[#666666] hover:text-[#1A1A1A]",
              )}
            >
              {s === "all" ? "Todos" : s === "pending" ? "Pendentes" : s === "active" ? "Ativos" : "Suspensos"}
            </button>
          ))}
        </div>
      </div>

      <div className="border border-[#E5E5E5] bg-[#FFFFFF] overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F8F8F8] text-[#666666] text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Faixa</th>
              <th className="text-left px-4 py-3">Academia</th>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Cadastro</th>
              <th className="text-right px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin inline-block text-[#999999]" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-[#999999]">Nenhum atleta encontrado.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="border-t border-[#E5E5E5]">
                <td className="px-4 py-3 text-[#1A1A1A]">{r.full_name}</td>
                <td className="px-4 py-3 text-[#1A1A1A]">{r.belt} {r.degree > 0 && `· ${r.degree}º`}</td>
                <td className="px-4 py-3 text-[#666666]">{r.academy ?? "—"}</td>
                <td className="px-4 py-3 text-[#666666]">{r.registration_number ?? "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-4 py-3 text-[#666666]">{new Date(r.created_at).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {r.status === "pending" && (
                      <button onClick={() => void approve(r)} className="text-xs px-2.5 py-1.5 bg-green-700 hover:bg-green-600 text-[#1A1A1A] rounded">Aprovar</button>
                    )}
                    {r.status === "active" && (
                      <button onClick={() => void suspend(r)} className="text-xs px-2.5 py-1.5 bg-[#C8211A] hover:bg-[#a01828] text-[#1A1A1A] rounded">Suspender</button>
                    )}
                    {r.status === "suspended" && (
                      <button onClick={() => void reactivate(r)} className="text-xs px-2.5 py-1.5 bg-green-700 hover:bg-green-600 text-[#1A1A1A] rounded">Reativar</button>
                    )}
                    <button onClick={() => setEditing(r)} className="text-xs px-2.5 py-1.5 border border-[#E5E5E5] text-[#1A1A1A] hover:text-[#1A1A1A] rounded">Editar</button>
                    {r.registration_number && (
                      <a href={`/verify/${r.registration_number}`} target="_blank" rel="noreferrer" className="text-xs px-2 py-1.5 text-[#666666] hover:text-[#1A1A1A]" title="Ver carteirinha">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal
          row={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); void load(); }}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Row["status"] }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    active: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
  };
  const label = { pending: "Pendente", active: "Ativo", suspended: "Suspenso" }[status];
  return (
    <span className={cn("inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider rounded", map[status])}>
      {label}
    </span>
  );
}

function EditModal({ row, onClose, onSaved }: { row: Row; onClose: () => void; onSaved: () => void }) {
  const [belt, setBelt] = useState(row.belt);
  const [degree, setDegree] = useState(row.degree);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { error } = await supabase.from("athlete_profiles").update({ belt, degree }).eq("id", row.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Faixa/grau atualizados.");
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E5E5] p-6">
        <h3 className="text-[#1A1A1A] text-lg uppercase mb-4" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
          Editar faixa/grau
        </h3>
        <p className="text-sm text-[#666666] mb-4">{row.full_name}</p>
        <label className="block mb-3">
          <span className="block text-xs uppercase tracking-wider text-[#666666] mb-1.5">Faixa</span>
          <select value={belt} onChange={(e) => setBelt(e.target.value)} className="admin-input w-full">
            {BELTS.map((b) => <option key={b}>{b}</option>)}
          </select>
        </label>
        <label className="block mb-5">
          <span className="block text-xs uppercase tracking-wider text-[#666666] mb-1.5">Grau</span>
          <select value={degree} onChange={(e) => setDegree(Number(e.target.value))} className="admin-input w-full">
            {[0, 1, 2, 3, 4].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 text-sm text-[#666666] hover:text-[#1A1A1A]">Cancelar</button>
          <button onClick={() => void save()} disabled={saving} className="px-4 py-2 bg-[#C8211A] text-[#1A1A1A] text-sm uppercase tracking-wider disabled:opacity-60">
            {saving ? "Salvando…" : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
