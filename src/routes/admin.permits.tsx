import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Eye, Loader2, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ADMIN_PAGE_SIZE, Pagination, useDebounced } from "@/components/admin/Pagination";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/permits")({
  head: () => ({
    meta: [
      { title: "Alvarás — BJJLF Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPermitsPage,
});

type AdditionalProf = { name: string; belt: string; degree: number; years: string };

type Permit = {
  id: string;
  academy_name: string;
  academy_logo_url: string | null;
  responsible_name: string;
  email: string;
  city: string;
  state: string | null;
  country: string;
  country_code: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  status: string;
  permit_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  created_at: string;
  athlete_id: string | null;
  additional_professors: AdditionalProf[] | null;
  notes: string | null;
};

const STATUS_OPTIONS = [
  { v: "all", l: "Todos" },
  { v: "pending", l: "Pendentes" },
  { v: "active", l: "Aprovados" },
  { v: "rejected", l: "Rejeitados" },
  { v: "revoked", l: "Revogados" },
  { v: "expired", l: "Vencidos" },
  { v: "pending_payment", l: "Pgto. pendente" },
];

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return { label: "Aprovado", cls: "bg-green-50 text-green-700 border-green-200" };
    case "pending":
      return { label: "Pendente", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    case "pending_payment":
      return { label: "Pgto. pendente", cls: "bg-orange-50 text-orange-700 border-orange-200" };
    case "rejected":
      return { label: "Rejeitado", cls: "bg-red-50 text-red-700 border-red-200" };
    case "revoked":
      return { label: "Revogado", cls: "bg-red-50 text-red-700 border-red-200" };
    case "expired":
      return { label: "Vencido", cls: "bg-gray-100 text-gray-700 border-gray-200" };
    default:
      return { label: status, cls: "bg-gray-50 text-gray-700 border-gray-200" };
  }
}

function AdminPermitsPage() {
  const { t } = useI18n();
  const [rows, setRows] = useState<Permit[]>([]);
  const [athleteNames, setAthleteNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 300);
  const [page, setPage] = useState(1);
  const [detailRow, setDetailRow] = useState<Permit | null>(null);
  useEffect(() => { setPage(1); }, [debouncedQuery, statusFilter]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("academy_permits")
      .select(
        "id, academy_name, academy_logo_url, responsible_name, email, city, state, country, country_code, phone, website, instagram, status, permit_number, issued_at, expires_at, created_at, athlete_id, additional_professors, notes",
      )
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) {
      toast.error("Erro ao carregar alvarás");
      setLoading(false);
      return;
    }
    const list = (data ?? []) as unknown as Permit[];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.athlete_id).filter((x): x is string => !!x)));
    if (ids.length > 0) {
      const { data: profs } = await supabase
        .from("athlete_profiles")
        .select("id, full_name")
        .in("id", ids);
      const map: Record<string, string> = {};
      for (const p of profs ?? []) map[p.id] = p.full_name;
      setAthleteNames(map);
    }
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (
        q &&
        !r.academy_name.toLowerCase().includes(q) &&
        !(r.email ?? "").toLowerCase().includes(q) &&
        !(r.permit_number?.toLowerCase().includes(q) ?? false) &&
        !(r.responsible_name?.toLowerCase().includes(q) ?? false)
      )
        return false;
      return true;
    });
  }, [rows, statusFilter, debouncedQuery]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [filtered, page],
  );

  async function approve(r: Permit) {
    if (!confirm(t("admin.permits.confirm.approve").replace("{academy}", r.academy_name))) return;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("academy_permits")
      .update({ status: "active", issued_at: today, paid_at: new Date().toISOString() })
      .eq("id", r.id);
    if (error) { toast.error("Erro ao aprovar"); return; }
    toast.success(t("admin.permits.toast.approved"));
    void load();
  }

  async function reject(r: Permit) {
    if (!confirm(t("admin.permits.confirm.reject").replace("{academy}", r.academy_name))) return;
    const { error } = await supabase
      .from("academy_permits")
      .update({ status: "rejected" })
      .eq("id", r.id);
    if (error) { toast.error("Erro ao rejeitar"); return; }
    toast.success(t("admin.permits.toast.rejected"));
    void load();
  }

  async function revoke(r: Permit) {
    if (!confirm(t("admin.permits.confirm.revoke").replace("{academy}", r.academy_name))) return;
    const { error } = await supabase
      .from("academy_permits")
      .update({ status: "revoked" })
      .eq("id", r.id);
    if (error) { toast.error("Erro ao revogar"); return; }
    toast.success(t("admin.permits.toast.revoked"));
    void load();
  }

  function exportCsv() {
    const headers = ["Numero","Academia","Professor","Email","Cidade","Pais","Status","Solicitado","Aprovado","Expira"];
    const lines = filtered.map((r) =>
      [r.permit_number ?? "", r.academy_name, r.responsible_name, r.email, r.city, r.country, r.status, r.created_at, r.issued_at ?? "", r.expires_at ?? ""]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `alvaras-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const totalPending = rows.filter((r) => r.status === "pending").length;
  const totalActive = rows.filter((r) => r.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Metric label={t("admin.permits.metric.pending")} value={String(totalPending)} accent={totalPending > 0} />
        <Metric label={t("admin.permits.metric.approved")} value={String(totalActive)} />
        <Metric label="Total" value={String(rows.length)} />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-[#666666] mb-1">Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] text-sm rounded px-3 py-2 min-w-[180px]">
            {STATUS_OPTIONS.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] uppercase tracking-widest text-[#666666] mb-1">Buscar</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Academia, professor, email"
              className="w-full bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] text-sm rounded pl-9 pr-9 py-2" />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#1A1A1A]">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <button onClick={exportCsv}
          className="inline-flex items-center gap-2 bg-[#C8A84B] hover:bg-[#9a7d0a] text-[#1A1A1A] text-sm uppercase tracking-widest rounded px-4 py-2"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
          <Download className="h-4 w-4" /> CSV ({filtered.length})
        </button>
      </div>

      <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
        {loading ? (
          <div className="grid place-items-center py-16"><Loader2 className="h-6 w-6 animate-spin text-[#999999]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#999999]">Nenhum alvará encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-[#666666] bg-[#F8F8F8]">
                  <th className="px-3 py-3">Logo</th>
                  <th className="px-3 py-3">Academia</th>
                  <th className="px-3 py-3">Professor</th>
                  <th className="px-3 py-3">Local</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Solicitado</th>
                  <th className="px-3 py-3">Aprovado</th>
                  <th className="px-3 py-3">Expira</th>
                  <th className="px-3 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((r) => {
                  const s = statusBadge(r.status);
                  const profName = r.athlete_id ? athleteNames[r.athlete_id] ?? r.responsible_name : r.responsible_name;
                  return (
                    <tr key={r.id} className="border-t border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F5F5F5]">
                      <td className="px-3 py-3">
                        {r.academy_logo_url ? (
                          <img src={r.academy_logo_url} alt="" className="h-8 w-8 rounded object-cover border border-gray-200" />
                        ) : (
                          <div className="h-8 w-8 rounded bg-gray-100 border border-gray-200" />
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-medium">{r.academy_name}</div>
                        {r.permit_number && <div className="text-[11px] text-gray-500">{r.permit_number}</div>}
                      </td>
                      <td className="px-3 py-3 text-[#444]">{profName}</td>
                      <td className="px-3 py-3 text-[#666]">{r.city} — {r.country}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-block px-2 py-0.5 text-[11px] uppercase tracking-wider border rounded-full ${s.cls}`}>{s.label}</span>
                      </td>
                      <td className="px-3 py-3 text-[#666] whitespace-nowrap">{fmt(r.created_at)}</td>
                      <td className="px-3 py-3 text-[#666] whitespace-nowrap">{fmt(r.issued_at)}</td>
                      <td className="px-3 py-3 text-[#666] whitespace-nowrap">{fmt(r.expires_at)}</td>
                      <td className="px-3 py-3 space-x-2 whitespace-nowrap">
                        <button onClick={() => setDetailRow(r)} className="inline-flex items-center gap-1 text-[#666] hover:text-[#1A1A1A] text-xs uppercase tracking-wider">
                          <Eye className="h-3 w-3" /> {t("admin.permits.action.details")}
                        </button>
                        {(r.status === "pending" || r.status === "pending_payment") && (
                          <>
                            <button onClick={() => void approve(r)} className="text-green-600 hover:text-green-800 text-xs uppercase tracking-wider">
                              {t("admin.permits.action.approve")}
                            </button>
                            <button onClick={() => void reject(r)} className="text-red-600 hover:text-red-800 text-xs uppercase tracking-wider">
                              {t("admin.permits.action.reject")}
                            </button>
                          </>
                        )}
                        {r.status === "active" && (
                          <button onClick={() => void revoke(r)} className="text-red-600 hover:text-red-800 text-xs uppercase tracking-wider">
                            {t("admin.permits.action.revoke")}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} perPage={ADMIN_PAGE_SIZE} total={filtered.length} onPageChange={setPage} itemLabel="alvarás" />
      </div>

      {detailRow && <DetailModal row={detailRow} onClose={() => setDetailRow(null)} t={t} />}
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`bg-white border rounded-lg p-5 ${accent ? "border-yellow-400" : "border-[#E5E5E5]"}`}>
      <div className="text-[11px] uppercase tracking-widest text-[#666]">{label}</div>
      <div className={`text-2xl mt-1 ${accent ? "text-yellow-600" : "text-[#1A1A1A]"}`}
        style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}>
        {value}
      </div>
    </div>
  );
}

function DetailModal({ row, onClose, t }: { row: Permit; onClose: () => void; t: (k: string) => string }) {
  const profs = Array.isArray(row.additional_professors) ? row.additional_professors : [];
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl text-gray-900 uppercase" style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}>
            {row.academy_name}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5 space-y-4 text-sm text-gray-800">
          {row.academy_logo_url && <img src={row.academy_logo_url} alt="" className="h-20 w-20 rounded-lg object-cover border" />}
          <Row label="Professor responsável" value={row.responsible_name} />
          <Row label="Email" value={row.email} />
          <Row label="Local" value={[row.city, row.state, row.country].filter(Boolean).join(", ")} />
          {row.phone && <Row label="Telefone" value={row.phone} />}
          {row.website && <Row label="Site" value={row.website} />}
          {row.instagram && <Row label="Instagram" value={row.instagram} />}
          {row.permit_number && <Row label="Nº alvará" value={row.permit_number} />}
          <Row label="Status" value={statusBadge(row.status).label} />
          <Row label="Solicitado em" value={fmt(row.created_at)} />
          {row.issued_at && <Row label="Aprovado em" value={fmt(row.issued_at)} />}
          {row.expires_at && <Row label="Expira em" value={fmt(row.expires_at)} />}
          {profs.length > 0 && (
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[#C8211A] mb-2 mt-4">{t("academyPermit.s3.title")}</div>
              <ul className="space-y-1.5">
                {profs.map((p, i) => (
                  <li key={i} className="border border-gray-200 rounded p-2.5 bg-gray-50">
                    <div className="font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-700">{p.belt} · {p.degree}º · {p.years || "—"} anos</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {row.notes && <Row label="Observações" value={row.notes} />}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-1.5">
      <dt className="text-gray-600">{label}</dt>
      <dd className="text-gray-900 text-right font-medium">{value}</dd>
    </div>
  );
}
