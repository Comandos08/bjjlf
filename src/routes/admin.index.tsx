/**
 * Admin dashboard — 4 metric cards + 2 recent panels (events / news).
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { Calendar, FileText, Building2, Award, Pencil, Loader2 } from "lucide-react";
import { useDashboardCounts, useRecentEvents, useRecentNews } from "@/lib/admin-queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: counts, isLoading } = useDashboardCounts();
  const { data: events = [] } = useRecentEvents(5);
  const { data: news = [] } = useRecentNews(5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard icon={Calendar} color="#C8211A" label="Eventos" value={counts?.events} loading={isLoading} />
        <MetricCard icon={FileText} color="#C8A84B" label="Notícias Publicadas" value={counts?.news} loading={isLoading} />
        <MetricCard icon={Building2} color="#C8211A" label="Academias Afiliadas" value={counts?.academies} loading={isLoading} />
        <MetricCard icon={Award} color="#C8A84B" label="Faixas Pretas" value={counts?.blackBelts} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Últimos Eventos">
          <table className="w-full text-sm" style={{ fontFamily: "DM Sans" }}>
            <thead>
              <tr className="text-left text-[12px] uppercase text-[#999999]" style={{ background: "#F8F8F8" }}>
                <th className="px-4 py-2.5 font-medium">Nome</th>
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t hover:bg-[#F5F5F5]" style={{ borderColor: "#F0F0F0" }}>
                  <td className="px-4 py-3 text-[#1A1A1A]">{e.name_pt}</td>
                  <td className="px-4 py-3 text-[#666666]">{e.event_date}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin" className="inline-flex"><Pencil size={16} style={{ color: "#C8211A" }} /></Link>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-[#999999]">Nenhum evento.</td></tr>
              )}
            </tbody>
          </table>
        </Panel>

        <Panel title="Últimas Notícias">
          <table className="w-full text-sm" style={{ fontFamily: "DM Sans" }}>
            <thead>
              <tr className="text-left text-[12px] uppercase text-[#999999]" style={{ background: "#F8F8F8" }}>
                <th className="px-4 py-2.5 font-medium">Título</th>
                <th className="px-4 py-2.5 font-medium">Categoria</th>
                <th className="px-4 py-2.5 font-medium">Pub.</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {news.map((n) => (
                <tr key={n.id} className="border-t" style={{ borderColor: "#FFFFFF" }}>
                  <td className="px-4 py-3 text-[#1A1A1A] truncate max-w-[260px]">{n.title_pt}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 text-[10px] uppercase" style={{ background: "#FFFFFF", color: "#C8A84B" }}>{n.category}</span></td>
                  <td className="px-4 py-3"><span className={cn("px-2 py-0.5 text-[10px] uppercase", n.is_published ? "text-[#1A1A1A]" : "text-[#666666]")} style={{ background: n.is_published ? "#166534" : "#E5E5E5" }}>{n.is_published ? "Sim" : "Não"}</span></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin" className="inline-flex"><Pencil size={16} style={{ color: "#C8A84B" }} /></Link>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-[#D1D1D1]">Nenhuma notícia.</td></tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, color, label, value, loading }: { icon: typeof Calendar; color: string; label: string; value: number | undefined; loading: boolean }) {
  return (
    <div className="border p-5" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
      <Icon size={24} style={{ color }} />
      <div className="mt-3 text-[12px] uppercase tracking-wider text-[#666666]">{label}</div>
      <div className="mt-1 text-[36px] font-bold leading-none text-[#1A1A1A]" style={{ fontFamily: "Barlow Condensed" }}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : (value ?? 0).toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#E5E5E5" }}>
        <h2 className="text-[#1A1A1A] text-[14px] font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    upcoming: { bg: "#E0EDFB", fg: "#1E40AF", label: "Próximo" },
    ongoing: { bg: "#FDEBD7", fg: "#9A3412", label: "Em Andamento" },
    completed: { bg: "#F5F5F5", fg: "#666666", label: "Concluído" },
    cancelled: { bg: "#FFF0EF", fg: "#C8211A", label: "Cancelado" },
  };
  const m = map[status] ?? { bg: "#F5F5F5", fg: "#666666", label: status };
  return <span className="px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider" style={{ background: m.bg, color: m.fg }}>{m.label}</span>;
}
