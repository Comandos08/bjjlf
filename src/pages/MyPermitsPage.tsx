import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Building2, ExternalLink, FileText, Loader2, RotateCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";
import { useNavigate } from "@tanstack/react-router";

type Permit = {
  id: string;
  academy_name: string;
  status: string;
  permit_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  created_at: string;
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: "Aguardando Pagamento", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  active: { label: "Ativo ✓", cls: "bg-green-50 text-green-700 border-green-200" },
  expired: { label: "Vencido", cls: "bg-red-50 text-red-700 border-red-200" },
  suspended: { label: "Suspenso", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  cancelled: { label: "Cancelado", cls: "bg-gray-50 text-gray-600 border-gray-200" },
};

function fmt(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function daysUntil(d: string | null): number | null {
  if (!d) return null;
  const ms = new Date(d).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function MyPermitsPage() {
  const { user, isLoading: authLoading } = useAthleteAuth();
  const navigate = useNavigate();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void navigate({ to: "/athlete/login" });
      return;
    }
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("academy_permits")
        .select("id, academy_name, status, permit_number, issued_at, expires_at, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!cancelled) {
        setPermits((data ?? []) as Permit[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="bg-gray-50 min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-6">
          <h1
            className="text-3xl text-gray-900 uppercase tracking-wide"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            Meus Alvarás
          </h1>
          <div className="h-1 w-12 bg-[#C8211A] rounded mt-3" />
          <p
            className="mt-3 text-gray-500 text-sm"
            style={{ fontFamily: "Barlow", fontWeight: 400 }}
          >
            Acompanhe seus alvarás de academia.
          </p>
        </header>

        {permits.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-14 text-center">
            <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p
              className="text-base text-gray-500 mb-3"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              Nenhum alvará ainda
            </p>
            <Link
              to="/academy/permit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              Solicitar Alvará
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {permits.map((p) => {
              const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.pending_payment;
              const days = daysUntil(p.expires_at);
              const renewable =
                p.status === "expired" || (p.status === "active" && days !== null && days <= 30);
              return (
                <li
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div>
                    <h3
                      className="text-lg text-gray-900"
                      style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                    >
                      {p.academy_name}
                    </h3>
                    <p
                      className="text-xs text-gray-500 mt-1"
                      style={{ fontFamily: "Barlow" }}
                    >
                      {p.permit_number ? `Nº ${p.permit_number}` : "—"} ·
                      {" "}
                      Validade: {fmt(p.expires_at)}
                    </p>
                    {days !== null && days <= 30 && days > 0 && (
                      <p
                        className="text-xs text-yellow-700 mt-1"
                        style={{ fontFamily: "Barlow", fontWeight: 600 }}
                      >
                        ⚠ Vence em {days} dia{days === 1 ? "" : "s"}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:items-end gap-2">
                    <span
                      className={`inline-block px-3 py-1.5 text-xs uppercase tracking-wider border rounded-full whitespace-nowrap ${status.cls}`}
                      style={{ fontFamily: "Barlow", fontWeight: 600 }}
                    >
                      {status.label}
                    </span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {p.permit_number && p.status === "active" && (
                        <>
                          <Link
                            to="/my-permit/$permitNumber"
                            params={{ permitNumber: p.permit_number }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-widest text-gray-700 hover:border-gray-900"
                            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                          >
                            <FileText className="h-3.5 w-3.5" /> Ver Alvará
                          </Link>
                          <Link
                            to="/verify/academy/$permitNumber"
                            params={{ permitNumber: p.permit_number }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs uppercase tracking-widest text-gray-700 hover:border-gray-900"
                            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Verificação
                          </Link>
                        </>
                      )}
                      {renewable && (
                        <Link
                          to="/academy/permit"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#C8A84B] hover:bg-[#9c8438] text-white px-3 py-1.5 text-xs uppercase tracking-widest"
                          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                        >
                          <RotateCw className="h-3.5 w-3.5" /> Renovar
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
