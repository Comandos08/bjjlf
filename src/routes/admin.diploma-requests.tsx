/**
 * /admin/diploma-requests — diploma request leads from the public form.
 *
 * Reads from the Supabase `diploma_leads` table (authoritative source).
 * Each form submission also appends a row to Google Sheets, but the panel
 * uses Supabase so it stays consistent with admin RLS.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  AdminButton,
  AdminBadge,
  AdminSection,
  AdminTableShell,
  AdminTH,
  AdminTD,
  EmptyState,
} from "@/components/admin/AdminUI";

export const Route = createFileRoute("/admin/diploma-requests")({
  head: () => ({
    meta: [
      { title: "Leads — BJJLF Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DiplomaLeadsPage,
});

type Lead = {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  whatsapp: string | null;
  affiliate_code: string;
  affiliate_source: string;
  belt: string;
  martial_art: string;
  language: string;
  currency: string;
  price: number;
};

const CURRENCY_SYMBOL: Record<string, string> = {
  BRL: "R$",
  EUR: "€",
  USD: "$",
};

function fmtMoney(value: number, currency: string) {
  const sym = CURRENCY_SYMBOL[currency] ?? "";
  return `${sym} ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DiplomaLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPartner, setFilterPartner] = useState("__ALL__");
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("diploma_leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error("load diploma_leads", error);
    setLeads((data as Lead[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const partners = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.affiliate_code).filter(Boolean)),
      ).sort(),
    [leads],
  );

  const filtered = useMemo(
    () =>
      leads.filter((l) => {
        if (filterPartner !== "__ALL__" && l.affiliate_code !== filterPartner)
          return false;
        if (search) {
          const q = search.toLowerCase();
          const hay = `${l.first_name} ${l.last_name} ${l.email} ${l.affiliate_code}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      }),
    [leads, filterPartner, search],
  );

  const exportCSV = () => {
    const headers = [
      "Data",
      "Nome",
      "Email",
      "WhatsApp",
      "Parceiro",
      "Fonte",
      "Faixa",
      "Moeda",
      "Valor",
      "Idioma",
    ];
    const rows = filtered.map((l) => [
      fmtDate(l.created_at),
      `${l.first_name} ${l.last_name}`,
      l.email,
      l.whatsapp ?? "",
      l.affiliate_code,
      l.affiliate_source,
      l.belt,
      l.currency,
      String(l.price ?? 0),
      l.language,
    ]);
    const csv = [headers, ...rows]
      .map((r) =>
        r
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-bjjlf-${
      filterPartner === "__ALL__" ? "todos" : filterPartner
    }-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const ranking = useMemo(
    () =>
      partners
        .map((p) => {
          const pLeads = leads.filter((l) => l.affiliate_code === p);
          const revenue = pLeads.reduce(
            (s, l) => s + (Number(l.price) || 0),
            0,
          );
          // Use first lead's currency as display reference
          const currency = pLeads[0]?.currency ?? "BRL";
          return { partner: p, count: pLeads.length, revenue, currency };
        })
        .sort((a, b) => b.count - a.count),
    [partners, leads],
  );

  const totalLeads = leads.length;
  const partnerCount = partners.length;

  return (
    <div className="space-y-8">
      <AdminSection
        title="Leads / Diploma Requests"
        actions={
          <div className="flex gap-2">
            <AdminButton variant="outline" onClick={() => void load()}>
              <RefreshCw size={14} /> Atualizar
            </AdminButton>
            <AdminButton onClick={exportCSV} disabled={!filtered.length}>
              <Download size={14} /> CSV
            </AdminButton>
          </div>
        }
      >
        {/* Summary */}
        <div className="flex flex-wrap gap-3 mb-4">
          <AdminBadge color="red">Total: {totalLeads}</AdminBadge>
          <AdminBadge color="gold">
            Parceiros únicos: {partnerCount}
          </AdminBadge>
          <AdminBadge color="gray">Filtrados: {filtered.length}</AdminBadge>
        </div>

        {/* Filters */}
        <div
          className="border p-4 mb-4 flex flex-wrap gap-3 items-end"
          style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}
        >
          <div className="flex flex-col">
            <label className="admin-label">Filtrar por parceiro</label>
            <select
              className="admin-input"
              value={filterPartner}
              onChange={(e) => setFilterPartner(e.target.value)}
            >
              <option value="__ALL__">Todos</option>
              {partners.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col flex-1 min-w-[220px]">
            <label className="admin-label">Buscar</label>
            <input
              className="admin-input"
              placeholder="Nome, email, parceiro…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="animate-spin text-[#666666]" />
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="border"
            style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}
          >
            <EmptyState message="Nenhum lead encontrado." />
          </div>
        ) : (
          <AdminTableShell>
            <thead>
              <tr>
                <AdminTH>Data</AdminTH>
                <AdminTH>Nome</AdminTH>
                <AdminTH>Contato</AdminTH>
                <AdminTH>Parceiro</AdminTH>
                <AdminTH>Faixa</AdminTH>
                <AdminTH>Idioma</AdminTH>
                <AdminTH className="text-right">Valor</AdminTH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#F5F5F5]">
                  <AdminTD>{fmtDate(l.created_at)}</AdminTD>
                  <AdminTD className="text-[#1A1A1A] font-medium">
                    {l.first_name} {l.last_name}
                  </AdminTD>
                  <AdminTD>
                    <div className="flex flex-col">
                      <span>{l.email}</span>
                      {l.whatsapp && (
                        <span className="text-xs text-[#999999]">
                          {l.whatsapp}
                        </span>
                      )}
                    </div>
                  </AdminTD>
                  <AdminTD>
                    <div className="flex items-center gap-2">
                      <AdminBadge color="gold">{l.affiliate_code}</AdminBadge>
                      <AdminBadge
                        color={l.affiliate_source === "url" ? "red" : "gray"}
                      >
                        {l.affiliate_source}
                      </AdminBadge>
                    </div>
                  </AdminTD>
                  <AdminTD>{l.belt}</AdminTD>
                  <AdminTD className="uppercase text-xs">{l.language}</AdminTD>
                  <AdminTD className="text-right font-medium text-[#1A1A1A]">
                    {fmtMoney(l.price, l.currency)}
                  </AdminTD>
                </tr>
              ))}
            </tbody>
          </AdminTableShell>
        )}
      </AdminSection>

      {/* Partner ranking */}
      <AdminSection title="Ranking de Parceiros">
        {ranking.length === 0 ? (
          <div
            className="border"
            style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}
          >
            <EmptyState message="Nenhum parceiro registrado ainda." />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ranking.map((r, i) => (
              <div
                key={r.partner}
                className="border p-5"
                style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <span
                    className="text-xs uppercase tracking-widest text-[#999999]"
                    style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                  >
                    #{i + 1}
                  </span>
                  <AdminBadge color="gold">{r.partner}</AdminBadge>
                </div>
                <div
                  className="text-2xl uppercase mb-2 text-[#1A1A1A]"
                  style={{
                    fontFamily: "Barlow Condensed, sans-serif",
                    fontWeight: 900,
                    letterSpacing: "0.02em",
                  }}
                >
                  {r.partner}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-[#999999]">
                      Leads
                    </div>
                    <div
                      className="text-3xl text-[#C8211A]"
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 900,
                      }}
                    >
                      {r.count}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-[#999999]">
                      Receita estimada
                    </div>
                    <div
                      className="text-xl"
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 700,
                        color: "#B8960C",
                      }}
                    >
                      {fmtMoney(r.revenue, r.currency)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminSection>
    </div>
  );
}
