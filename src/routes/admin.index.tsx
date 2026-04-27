/**
 * Admin dashboard — métricas operacionais + alertas de ação.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, UserCheck, UserX, Building2, AlertTriangle, ClipboardList,
  Calendar, DollarSign, Loader2, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  useDashboardCounts, usePendingAthletes, useExpiringPermits, useApproveAthlete,
} from "@/lib/admin-queries";

export const Route = createFileRoute("/admin/")({
  component: DashboardPage,
});

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function DashboardPage() {
  const { data: c, isLoading } = useDashboardCounts();
  const { data: pending = [] } = usePendingAthletes(5);
  const { data: expiring = [] } = useExpiringPermits(5);
  const approve = useApproveAthlete();

  return (
    <div className="space-y-6">
      {/* Atletas */}
      <SectionTitle>Atletas</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={UserCheck} color="#3B6D11" label="Ativos" value={c?.athletesActive} loading={isLoading} />
        <MetricCard icon={Users} color="#C8A84B" label="Pendentes" value={c?.athletesPending} loading={isLoading} />
        <MetricCard icon={UserX} color="#C8211A" label="Suspensos" value={c?.athletesSuspended} loading={isLoading} />
      </div>

      {/* Alvarás */}
      <SectionTitle>Alvarás de Academia</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard icon={Building2} color="#3B6D11" label="Ativos" value={c?.permitsActive} loading={isLoading} />
        <MetricCard icon={AlertTriangle} color="#C8A84B" label="Vencendo (< 30d)" value={c?.permitsExpiring} loading={isLoading} />
        <MetricCard icon={UserX} color="#C8211A" label="Expirados" value={c?.permitsExpired} loading={isLoading} />
      </div>

      {/* Inscrições do mês + Eventos + Receita */}
      <SectionTitle>Este mês</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={ClipboardList} color="#C8A84B" label="Insc. Pendentes" value={c?.regsPending} loading={isLoading} />
        <MetricCard icon={CheckCircle2} color="#3B6D11" label="Insc. Confirmadas" value={c?.regsConfirmed} loading={isLoading} />
        <MetricCard icon={Calendar} color="#1E40AF" label="Eventos próximos 30d" value={c?.eventsNext30} loading={isLoading} />
        <MetricCard icon={DollarSign} color="#C8211A" label="Receita" valueText={formatBRL(c?.monthRevenue ?? 0)} loading={isLoading} />
      </div>

      {/* Alertas de ação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title={`Atletas aguardando aprovação (${pending.length})`}>
          {pending.length === 0 ? (
            <p className="px-4 py-6 text-center text-[#999999] text-sm">Nenhum pendente. 🎉</p>
          ) : (
            <ul>
              {pending.map((a) => (
                <li key={a.id} className="px-4 py-3 border-t flex items-center justify-between gap-3" style={{ borderColor: "#F0F0F0" }}>
                  <div className="min-w-0">
                    <div className="text-[#1A1A1A] font-medium truncate">{a.full_name}</div>
                    <div className="text-xs text-[#666666]">
                      {a.belt}{a.degree ? ` · ${a.degree}º grau` : ""}{a.academy ? ` · ${a.academy}` : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      approve.mutate(a.id, {
                        onSuccess: () => toast.success(`${a.full_name} aprovado.`),
                        onError: (e) => toast.error(e instanceof Error ? e.message : "Erro"),
                      });
                    }}
                    disabled={approve.isPending}
                    className="text-xs px-3 py-1.5 bg-[#C8211A] text-white uppercase tracking-wider disabled:opacity-60 whitespace-nowrap"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    Aprovar
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t px-4 py-2.5 text-right" style={{ borderColor: "#F0F0F0" }}>
            <Link to="/admin/athletes" className="text-xs uppercase tracking-wider text-[#C8211A] hover:underline" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
              Ver todos →
            </Link>
          </div>
        </Panel>

        <Panel title={`Alvarás vencendo em 30 dias (${expiring.length})`}>
          {expiring.length === 0 ? (
            <p className="px-4 py-6 text-center text-[#999999] text-sm">Nenhum alvará vencendo.</p>
          ) : (
            <ul>
              {expiring.map((p) => (
                <li key={p.id} className="px-4 py-3 border-t flex items-center justify-between gap-3" style={{ borderColor: "#F0F0F0" }}>
                  <div className="min-w-0">
                    <div className="text-[#1A1A1A] font-medium truncate">{p.academy_name}</div>
                    <div className="text-xs text-[#666666]">
                      Vence em {new Date(p.expires_at!).toLocaleDateString("pt-BR")}
                      {p.permit_number ? ` · ${p.permit_number}` : ""}
                    </div>
                  </div>
                  <Link
                    to="/admin/permits"
                    className="text-xs px-3 py-1.5 border border-[#C8211A] text-[#C8211A] uppercase tracking-wider hover:bg-[#FFF0EF]"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    Ver
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t px-4 py-2.5 text-right" style={{ borderColor: "#F0F0F0" }}>
            <Link to="/admin/permits" className="text-xs uppercase tracking-wider text-[#C8211A] hover:underline" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
              Ver todos →
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[12px] uppercase tracking-[2px] text-[#666666]" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
      {children}
    </h2>
  );
}

function MetricCard({
  icon: Icon, color, label, value, valueText, loading,
}: {
  icon: typeof Users; color: string; label: string;
  value?: number; valueText?: string; loading: boolean;
}) {
  return (
    <div className="border p-5" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
      <Icon size={22} style={{ color }} />
      <div className="mt-3 text-[12px] uppercase tracking-wider text-[#666666]">{label}</div>
      <div className="mt-1 text-[30px] font-bold leading-none text-[#1A1A1A]" style={{ fontFamily: "Barlow Condensed" }}>
        {loading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : (valueText ?? (value ?? 0).toLocaleString("pt-BR"))}
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
