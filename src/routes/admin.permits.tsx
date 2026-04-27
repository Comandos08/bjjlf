import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ExternalLink, FileText, Loader2, Search, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/permits")({
  head: () => ({
    meta: [
      { title: "Alvarás — BJJLF Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPermitsPage,
});

type Permit = {
  id: string;
  academy_name: string;
  responsible_name: string;
  email: string;
  city: string;
  country: string;
  status: string;
  permit_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  amount_cents: number;
  created_at: string;
};

const STATUS_OPTIONS = [
  { v: "all", l: "Todos" },
  { v: "active", l: "Ativos" },
  { v: "expiring", l: "Vencendo (30d)" },
  { v: "expired", l: "Vencidos" },
  { v: "pending_payment", l: "Pendentes" },
  { v: "suspended", l: "Suspensos" },
];

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

function statusBadge(status: string) {
  switch (status) {
    case "active":
      return { label: "Ativo", cls: "bg-green-50 text-green-700 border-green-200" };
    case "expired":
      return { label: "Vencido", cls: "bg-red-50 text-red-700 border-red-200" };
    case "pending_payment":
      return { label: "Pendente", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    case "suspended":
      return { label: "Suspenso", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    case "cancelled":
      return { label: "Cancelado", cls: "bg-gray-50 text-gray-700 border-gray-200" };
    default:
      return { label: status, cls: "bg-gray-50 text-gray-700 border-gray-200" };
  }
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  const ms = new Date(d).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

function AdminPermitsPage() {
  const [rows, setRows] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("academy_permits")
      .select(
        "id, academy_name, responsible_name, email, city, country, status, permit_number, issued_at, expires_at, amount_cents, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) toast.error("Erro ao carregar alvarás");
    else setRows((data ?? []) as Permit[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const expiringSoon = useMemo(
    () =>
      rows.filter((r) => {
        if (r.status !== "active") return false;
        const d = daysUntil(r.expires_at);
        return d !== null && d > 0 && d <= 30;
      }),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter === "expiring") {
        if (r.status !== "active") return false;
        const d = daysUntil(r.expires_at);
        if (d === null || d <= 0 || d > 30) return false;
      } else if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (
        q &&
        !r.academy_name.toLowerCase().includes(q) &&
        !r.email.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, statusFilter, query]);

  const totalActive = rows.filter((r) => r.status === "active").length;
  const totalPending = rows.filter((r) => r.status === "pending_payment").length;
  const totalRevenue = rows
    .filter((r) => r.status === "active")
    .reduce((s, r) => s + r.amount_cents, 0);

  async function activate(id: string) {
    if (!confirm("Ativar este alvará? Será gerado o número e a validade.")) return;
    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase
      .from("academy_permits")
      .update({
        status: "active",
        issued_at: today,
        paid_at: new Date().toISOString(),
      })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao ativar");
      return;
    }
    toast.success("Alvará ativado");
    void load();
  }

  async function setStatus(id: string, status: "suspended" | "active" | "cancelled") {
    const { error } = await supabase
      .from("academy_permits")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }
    toast.success("Status atualizado");
    void load();
  }

  function exportCsv() {
    const headers = [
      "Numero",
      "Academia",
      "Responsavel",
      "Email",
      "Cidade",
      "Pais",
      "Status",
      "Emissao",
      "Validade",
      "Valor (R$)",
      "Data",
    ];
    const lines = filtered.map((r) =>
      [
        r.permit_number ?? "",
        r.academy_name,
        r.responsible_name,
        r.email,
        r.city,
        r.country,
        r.status,
        r.issued_at ?? "",
        r.expires_at ?? "",
        (r.amount_cents / 100).toFixed(2),
        new Date(r.created_at).toISOString(),
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alvaras-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Ativos" value={String(totalActive)} />
        <Metric
          label="Vencendo em 30 dias"
          value={String(expiringSoon.length)}
          accent={expiringSoon.length > 0}
        />
        <Metric label="Receita (ativos)" value={formatBRL(totalRevenue)} />
        <Metric label="Pendentes" value={String(totalPending)} />
      </div>

      {/* Expiring banner */}
      {expiringSoon.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-lg px-4 py-3 text-sm text-yellow-200">
          ⚠ {expiringSoon.length} alvará{expiringSoon.length === 1 ? "" : "s"} vence{expiringSoon.length === 1 ? "" : "m"} nos próximos 30 dias
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-[#666666] mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] text-sm rounded px-3 py-2 min-w-[180px]"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] uppercase tracking-widest text-[#666666] mb-1">
            Buscar
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Academia ou email"
              className="w-full bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] text-sm rounded pl-9 pr-9 py-2"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#999999] hover:text-[#1A1A1A]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 bg-[#C8A84B] hover:bg-[#9a7d0a] text-[#1A1A1A] text-sm uppercase tracking-widest rounded px-4 py-2"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          <Download className="h-4 w-4" /> Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg overflow-hidden">
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#999999]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#999999]">Nenhum alvará encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-[#666666] bg-[#F8F8F8]">
                  <th className="px-4 py-3">Nº</th>
                  <th className="px-4 py-3">Academia</th>
                  <th className="px-4 py-3">Responsável</th>
                  <th className="px-4 py-3">Cidade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Emissão</th>
                  <th className="px-4 py-3">Validade</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const s = statusBadge(r.status);
                  return (
                    <tr key={r.id} className="border-t border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F5F5F5]">
                      <td className="px-4 py-3 text-[#666666]">{r.permit_number ?? "—"}</td>
                      <td className="px-4 py-3">{r.academy_name}</td>
                      <td className="px-4 py-3 text-[#666666]">{r.responsible_name}</td>
                      <td className="px-4 py-3 text-[#666666]">
                        {r.city} — {r.country}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] uppercase tracking-wider border rounded-full ${s.cls}`}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#666666] whitespace-nowrap">{fmt(r.issued_at)}</td>
                      <td className="px-4 py-3 text-[#666666] whitespace-nowrap">{fmt(r.expires_at)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{formatBRL(r.amount_cents)}</td>
                      <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                        {r.status === "pending_payment" && (
                          <button
                            onClick={() => void activate(r.id)}
                            className="text-green-400 hover:text-green-200 text-xs uppercase tracking-wider"
                          >
                            Ativar
                          </button>
                        )}
                        {r.status === "active" && (
                          <button
                            onClick={() => void setStatus(r.id, "suspended")}
                            className="text-yellow-400 hover:text-yellow-200 text-xs uppercase tracking-wider"
                          >
                            Suspender
                          </button>
                        )}
                        {r.status === "suspended" && (
                          <button
                            onClick={() => void setStatus(r.id, "active")}
                            className="text-green-400 hover:text-green-200 text-xs uppercase tracking-wider"
                          >
                            Reativar
                          </button>
                        )}
                        {r.permit_number && (
                          <>
                            <Link
                              to="/my-permit/$permitNumber"
                              params={{ permitNumber: r.permit_number }}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[#C8A84B] hover:text-[#1A1A1A] text-xs uppercase tracking-wider"
                            >
                              <FileText className="h-3 w-3" /> Doc
                            </Link>
                            <Link
                              to="/verify/academy/$permitNumber"
                              params={{ permitNumber: r.permit_number }}
                              target="_blank"
                              className="inline-flex items-center gap-1 text-[#C8211A] hover:text-[#1A1A1A] text-xs uppercase tracking-wider"
                            >
                              <ExternalLink className="h-3 w-3" /> Ver
                            </Link>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`bg-[#FFFFFF] border rounded-lg p-5 ${
        accent ? "border-yellow-500/60" : "border-[#E5E5E5]"
      }`}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#666666]">{label}</div>
      <div
        className={`text-2xl mt-1 ${accent ? "text-yellow-400" : "text-[#1A1A1A]"}`}
        style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
      >
        {value}
      </div>
    </div>
  );
}
