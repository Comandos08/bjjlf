import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Search, Download, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EVENTS } from "@/data/events";
import { toast } from "sonner";
import { ADMIN_PAGE_SIZE, Pagination, useDebounced } from "@/components/admin/Pagination";

export const Route = createFileRoute("/admin/registrations")({
  head: () => ({
    meta: [
      { title: "Inscrições — BJJLF Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRegistrationsPage,
});

type Registration = {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  belt: string;
  degree: number;
  academy: string | null;
  category: string;
  weight_class: string;
  modality: string;
  status: string;
  amount_cents: number;
  registration_number: string | null;
  created_at: string;
};

const STATUS_OPTIONS = [
  { v: "all", l: "Todos" },
  { v: "confirmed", l: "Confirmadas" },
  { v: "pending_payment", l: "Pendentes" },
  { v: "cancelled", l: "Canceladas" },
];

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function eventName(id: string) {
  return EVENTS.find((e) => e.id === id)?.name ?? id;
}

function statusBadge(status: string) {
  switch (status) {
    case "confirmed":
      return { label: "Confirmada", cls: "bg-green-50 text-green-700 border-green-200" };
    case "pending_payment":
      return { label: "Pendente", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" };
    case "cancelled":
      return { label: "Cancelada", cls: "bg-red-50 text-red-700 border-red-200" };
    case "refunded":
      return { label: "Reembolsada", cls: "bg-gray-50 text-gray-700 border-gray-200" };
    default:
      return { label: status, cls: "bg-gray-50 text-gray-700 border-gray-200" };
  }
}

function AdminRegistrationsPage() {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 300);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [debouncedQuery, eventFilter, statusFilter]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("event_registrations")
      .select(
        "id, event_id, full_name, email, phone, belt, degree, academy, category, weight_class, modality, status, amount_cents, registration_number, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) {
      toast.error("Erro ao carregar inscrições");
    } else {
      setRows((data ?? []) as Registration[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return rows.filter((r) => {
      if (eventFilter !== "all" && r.event_id !== eventFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (q) {
        const evName = eventName(r.event_id).toLowerCase();
        if (
          !r.full_name.toLowerCase().includes(q) &&
          !r.email.toLowerCase().includes(q) &&
          !evName.includes(q)
        )
          return false;
      }
      return true;
    });
  }, [rows, eventFilter, statusFilter, debouncedQuery]);

  const paged = useMemo(
    () => filtered.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE),
    [filtered, page],
  );

  const totalConfirmed = filtered.filter((r) => r.status === "confirmed").length;
  const totalRevenue = filtered
    .filter((r) => r.status === "confirmed")
    .reduce((sum, r) => sum + r.amount_cents, 0);

  async function cancelRegistration(id: string) {
    if (!confirm("Cancelar esta inscrição?")) return;
    const { error } = await supabase
      .from("event_registrations")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast.error("Erro ao cancelar");
      return;
    }
    toast.success("Inscrição cancelada");
    void load();
  }

  function exportCsv() {
    const headers = [
      "Numero",
      "Nome",
      "Email",
      "Telefone",
      "Faixa",
      "Grau",
      "Academia",
      "Evento",
      "Categoria",
      "Peso",
      "Modalidade",
      "Status",
      "Valor (R$)",
      "Data",
    ];
    const lines = filtered.map((r) =>
      [
        r.registration_number ?? "",
        r.full_name,
        r.email,
        r.phone ?? "",
        r.belt,
        r.degree,
        r.academy ?? "",
        eventName(r.event_id),
        r.category,
        r.weight_class,
        r.modality,
        r.status,
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
    a.download = `inscricoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-[#666666] mb-1">
            Evento
          </label>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] text-sm rounded px-3 py-2 min-w-[200px]"
          >
            <option value="all">Todos</option>
            {EVENTS.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-[#666666] mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FFFFFF] border border-[#E5E5E5] text-[#1A1A1A] text-sm rounded px-3 py-2"
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
              placeholder="Nome ou email"
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
          <Download className="h-4 w-4" /> Exportar CSV ({filtered.length})
        </button>
      </div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Metric label="Inscritos confirmados" value={String(totalConfirmed)} />
        <Metric label="Receita total" value={formatBRL(totalRevenue)} />
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg overflow-hidden">
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#999999]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-[#999999]">Nenhuma inscrição encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-widest text-[#666666] bg-[#F8F8F8]">
                  <th className="px-4 py-3">Nº</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Faixa</th>
                  <th className="px-4 py-3">Academia</th>
                  <th className="px-4 py-3">Evento</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Peso</th>
                  <th className="px-4 py-3">Modalidade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const s = statusBadge(r.status);
                  return (
                    <tr key={r.id} className="border-t border-[#E5E5E5] text-[#1A1A1A] hover:bg-[#F5F5F5]">
                      <td className="px-4 py-3 text-[#666666]">{r.registration_number ?? "—"}</td>
                      <td className="px-4 py-3">{r.full_name}</td>
                      <td className="px-4 py-3 text-[#666666]">{r.email}</td>
                      <td className="px-4 py-3 text-[#666666]">
                        {r.belt} {r.degree > 0 ? `${r.degree}°` : ""}
                      </td>
                      <td className="px-4 py-3 text-[#666666]">{r.academy ?? "—"}</td>
                      <td className="px-4 py-3 text-[#666666]">{eventName(r.event_id)}</td>
                      <td className="px-4 py-3 text-[#666666]">{r.category}</td>
                      <td className="px-4 py-3 text-[#666666]">{r.weight_class}</td>
                      <td className="px-4 py-3 text-[#666666]">{r.modality}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 text-[11px] uppercase tracking-wider border rounded-full ${s.cls}`}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">{formatBRL(r.amount_cents)}</td>
                      <td className="px-4 py-3 text-[#666666] whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        {r.status !== "cancelled" && (
                          <button
                            onClick={() => void cancelRegistration(r.id)}
                            className="text-[#C8211A] hover:text-[#1A1A1A] text-xs uppercase tracking-wider"
                          >
                            Cancelar
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
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5">
      <div className="text-[11px] uppercase tracking-widest text-[#666666]">{label}</div>
      <div
        className="text-2xl text-[#1A1A1A] mt-1"
        style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
      >
        {value}
      </div>
    </div>
  );
}
