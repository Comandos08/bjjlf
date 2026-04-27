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
        <MetricCard icon={Calendar} color="#C41E3A" label="Eventos" value={counts?.events} loading={isLoading} />
        <MetricCard icon={FileText} color="#B8960C" label="Notícias Publicadas" value={counts?.news} loading={isLoading} />
        <MetricCard icon={Building2} color="#C41E3A" label="Academias Afiliadas" value={counts?.academies} loading={isLoading} />
        <MetricCard icon={Award} color="#B8960C" label="Faixas Pretas" value={counts?.blackBelts} loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Últimos Eventos">
          <table className="w-full text-sm" style={{ fontFamily: "DM Sans" }}>
            <thead>
              <tr className="text-left text-[12px] uppercase text-[#666]" style={{ background: "#0A0A0A" }}>
                <th className="px-4 py-2.5 font-medium">Nome</th>
                <th className="px-4 py-2.5 font-medium">Data</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-t" style={{ borderColor: "#1A1A1A" }}>
                  <td className="px-4 py-3 text-white">{e.name_pt}</td>
                  <td className="px-4 py-3 text-[#999]">{e.event_date}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin" className="inline-flex"><Pencil size={16} style={{ color: "#B8960C" }} /></Link>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-[#555]">Nenhum evento.</td></tr>
              )}
            </tbody>
          </table>
        </Panel>

        <Panel title="Últimas Notícias">
          <table className="w-full text-sm" style={{ fontFamily: "DM Sans" }}>
            <thead>
              <tr className="text-left text-[12px] uppercase text-[#666]" style={{ background: "#0A0A0A" }}>
                <th className="px-4 py-2.5 font-medium">Título</th>
                <th className="px-4 py-2.5 font-medium">Categoria</th>
                <th className="px-4 py-2.5 font-medium">Pub.</th>
                <th className="px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {news.map((n) => (
                <tr key={n.id} className="border-t" style={{ borderColor: "#1A1A1A" }}>
                  <td className="px-4 py-3 text-white truncate max-w-[260px]">{n.title_pt}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 text-[10px] uppercase" style={{ background: "#1A1A1A", color: "#B8960C" }}>{n.category}</span></td>
                  <td className="px-4 py-3"><span className={cn("px-2 py-0.5 text-[10px] uppercase", n.is_published ? "text-white" : "text-[#888]")} style={{ background: n.is_published ? "#166534" : "#333" }}>{n.is_published ? "Sim" : "Não"}</span></td>
                  <td className="px-4 py-3 text-right">
                    <Link to="/admin" className="inline-flex"><Pencil size={16} style={{ color: "#B8960C" }} /></Link>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-6 text-center text-[#555]">Nenhuma notícia.</td></tr>
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
    <div className="border p-5" style={{ background: "#111111", borderColor: "#222" }}>
      <Icon size={24} style={{ color }} />
      <div className="mt-3 text-[12px] uppercase tracking-wider text-[#888]">{label}</div>
      <div className="mt-1 text-[36px] font-bold leading-none text-white" style={{ fontFamily: "Barlow Condensed" }}>
        {loading ? <Loader2 className="h-6 w-6 animate-spin inline" /> : (value ?? 0).toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border" style={{ background: "#111111", borderColor: "#222" }}>
      <div className="px-5 py-3 border-b" style={{ borderColor: "#222" }}>
        <h2 className="text-white text-[14px] font-bold uppercase tracking-wider" style={{ fontFamily: "Barlow Condensed" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    upcoming: { bg: "#1E3A5F", label: "Próximo" },
    ongoing: { bg: "#5C3A0E", label: "Em Andamento" },
    completed: { bg: "#333", label: "Concluído" },
    cancelled: { bg: "#5C0E1E", label: "Cancelado" },
  };
  const m = map[status] ?? { bg: "#333", label: status };
  return <span className="px-2 py-0.5 text-[10px] uppercase text-white" style={{ background: m.bg }}>{m.label}</span>;
}
