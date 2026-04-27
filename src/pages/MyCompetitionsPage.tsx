import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ClipboardList, Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useRequireActiveAthlete } from "@/hooks/useRequireActiveAthlete";
import { EVENTS } from "@/data/events";

type Competition = {
  id: string;
  event_name: string;
  event_date: string;
  location: string | null;
  category: string | null;
  weight_class: string | null;
  result: string | null;
  medal: string | null;
};

type Registration = {
  id: string;
  event_id: string;
  category: string;
  weight_class: string;
  modality: string;
  status: string;
  amount_cents: number;
  registration_number: string | null;
  created_at: string;
};

const medalStyles: Record<string, string> = {
  gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
  silver: "bg-gray-50 text-gray-600 border-gray-200",
  bronze: "bg-orange-50 text-orange-700 border-orange-200",
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: "Aguardando Pagamento", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  confirmed: { label: "Confirmada ✓", cls: "bg-green-50 text-green-700 border-green-200" },
  cancelled: { label: "Cancelada", cls: "bg-red-50 text-red-700 border-red-200" },
  refunded: { label: "Reembolsada", cls: "bg-gray-50 text-gray-600 border-gray-200" },
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function eventNameById(id: string) {
  return EVENTS.find((e) => e.id === id)?.name ?? id;
}

function eventDateById(id: string) {
  const ev = EVENTS.find((e) => e.id === id);
  if (!ev) return "";
  return new Date(ev.date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function MyCompetitionsPage() {
  const { user, profile, isLoading: authLoading } = useRequireActiveAthlete();
  const [items, setItems] = useState<Competition[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile || !user) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const [{ data: comps }, { data: regs }] = await Promise.all([
        supabase
          .from("competition_history")
          .select("id, event_name, event_date, location, category, weight_class, result, medal")
          .eq("athlete_id", profile.id)
          .order("event_date", { ascending: false }),
        supabase
          .from("event_registrations")
          .select("id, event_id, category, weight_class, modality, status, amount_cents, registration_number, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);
      if (!cancelled) {
        setItems((comps ?? []) as Competition[]);
        setRegistrations((regs ?? []) as Registration[]);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  if (authLoading || !profile) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          {[0, 1].map((k) => (
            <section key={k}>
              <div className="h-8 w-56 bg-gray-200 rounded animate-pulse" />
              <div className="h-1 w-12 bg-gray-200 rounded mt-3" />
              <ul className="mt-6 space-y-3">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="h-5 w-2/3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse mt-2" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse mt-2" />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6 space-y-12">
        {/* MINHAS INSCRIÇÕES */}
        <section>
          <header className="mb-6">
            <h2 className="text-3xl text-gray-900 uppercase font-heading font-bold tracking-wide">
              Minhas Inscrições
            </h2>
            <div className="h-1 w-12 bg-[#C8211A] rounded mt-3" />
          </header>

          {loading ? (
            <div className="grid place-items-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : registrations.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl py-14 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p
                className="text-base text-gray-500 mb-3"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                Nenhuma inscrição ainda
              </p>
              <Link
                to="/events"
                search={((prev: unknown) => prev) as never}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest no-underline"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                Ver eventos
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {registrations.map((r) => {
                const status = STATUS_LABELS[r.status] ?? STATUS_LABELS.pending_payment;
                return (
                  <li
                    key={r.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <h3
                        className="text-lg text-gray-900"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                      >
                        {eventNameById(r.event_id)}
                      </h3>
                      <p
                        className="text-sm text-gray-500 mt-0.5"
                        style={{ fontFamily: "Barlow" }}
                      >
                        {eventDateById(r.event_id)}
                      </p>
                      <p
                        className="text-xs text-gray-500 mt-1"
                        style={{ fontFamily: "Barlow" }}
                      >
                        {[r.category, r.weight_class, r.modality].join(" · ")}
                      </p>
                      {r.registration_number && (
                        <p
                          className="text-xs text-gray-700 mt-1"
                          style={{ fontFamily: "Barlow", fontWeight: 600 }}
                        >
                          Nº {r.registration_number}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col sm:items-end gap-1.5">
                      <span
                        className={cn(
                          "inline-block px-3 py-1.5 text-xs uppercase tracking-wider border rounded-full whitespace-nowrap",
                          status.cls,
                        )}
                        style={{ fontFamily: "Barlow", fontWeight: 600 }}
                      >
                        {status.label}
                      </span>
                      {r.status === "pending_payment" && (
                        <span className="text-[11px] text-yellow-700 sm:text-right max-w-[220px]" style={{ fontFamily: "Barlow" }}>
                          Entre em contato com a federação para confirmar o pagamento.
                        </span>
                      )}
                      <span
                        className="text-sm text-gray-900"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                      >
                        {formatBRL(r.amount_cents)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* HISTÓRICO */}
        <section>
          <header className="mb-6">
            <h2 className="text-3xl text-gray-900 uppercase font-heading font-bold tracking-wide">
              Minhas Competições
            </h2>
            <div className="h-1 w-12 bg-[#C8211A] rounded mt-3" />
          </header>

          {loading ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
              <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p
                className="text-base text-gray-400 mb-1"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                Nenhuma competição registrada
              </p>
              <p
                className="text-sm text-gray-500 max-w-md mx-auto"
                style={{ fontFamily: "Barlow" }}
              >
                Seu histórico de competições aparecerá aqui após participar de eventos oficiais BJJLF.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((c) => {
                const badgeCls =
                  c.medal && medalStyles[c.medal]
                    ? medalStyles[c.medal]
                    : "bg-blue-50 text-blue-700 border-blue-200";
                const dateFmt = new Date(c.event_date).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                });
                return (
                  <li
                    key={c.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <h3
                        className="text-lg text-gray-900"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                      >
                        {c.event_name}
                      </h3>
                      <p
                        className="text-sm text-gray-500 mt-0.5"
                        style={{ fontFamily: "Barlow" }}
                      >
                        {dateFmt}
                        {c.location ? ` · ${c.location}` : ""}
                      </p>
                      {(c.category || c.weight_class) && (
                        <p
                          className="text-xs text-gray-500 mt-1"
                          style={{ fontFamily: "Barlow" }}
                        >
                          {[c.category, c.weight_class].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>
                    {c.result && (
                      <span
                        className={cn(
                          "inline-block px-3 py-1.5 text-xs uppercase tracking-wider border rounded-full whitespace-nowrap",
                          badgeCls,
                        )}
                        style={{ fontFamily: "Barlow", fontWeight: 600 }}
                      >
                        {c.result}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
