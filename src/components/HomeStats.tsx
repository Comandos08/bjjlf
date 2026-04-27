import { useEffect, useState } from "react";
import { Users, Building2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type Stats = {
  athletes: number | null; // null = erro/oculto
  academies: number | null;
  events: number | null;
};

/**
 * Prova social com counts reais do Supabase.
 * - Atletas: athlete_profiles WHERE status='active'
 * - Academias: affiliated_academies(is_active) + academy_permits(active)
 * - Eventos: total da tabela events
 *
 * Loading: skeletons pulsantes.
 * Error em alguma query: card daquele item é ocultado silenciosamente.
 */
export function HomeStats() {
  const { lang } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [athletesRes, academiesRes, permitsRes, eventsRes] = await Promise.all([
        supabase
          .from("athlete_profiles")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("affiliated_academies")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("academy_permits")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase.from("events").select("id", { count: "exact", head: true }),
      ]);
      if (cancelled) return;
      const academiesTotal =
        academiesRes.error && permitsRes.error
          ? null
          : (academiesRes.count ?? 0) + (permitsRes.count ?? 0);
      setStats({
        athletes: athletesRes.error ? null : (athletesRes.count ?? 0),
        academies: academiesTotal,
        events: eventsRes.error ? null : (eventsRes.count ?? 0),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items: Array<{ icon: typeof Users; value: number | null; label: string; key: string }> = [
    {
      key: "athletes",
      icon: Users,
      value: stats?.athletes ?? null,
      label: lang === "pt" ? "Atletas Ativos" : "Active Athletes",
    },
    {
      key: "academies",
      icon: Building2,
      value: stats?.academies ?? null,
      label: lang === "pt" ? "Academias Afiliadas" : "Affiliated Academies",
    },
    {
      key: "events",
      icon: Trophy,
      value: stats?.events ?? null,
      label: lang === "pt" ? "Eventos Realizados" : "Events Hosted",
    },
  ];

  // Loading: 3 skeletons
  if (stats === null) {
    return (
      <section className="bg-[#0F0F0F] border-y border-black py-14">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="text-center bg-black/40 border border-white/5 rounded-xl py-8 px-4"
            >
              <div className="h-8 w-8 mx-auto mb-3 rounded-full bg-[#E5E5E5]/20 animate-pulse" />
              <div className="h-12 w-20 mx-auto rounded bg-[#E5E5E5]/20 animate-pulse" />
              <div className="h-4 w-32 mx-auto mt-4 rounded bg-[#E5E5E5]/20 animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Filtra cards com erro (value null)
  const visible = items.filter((it) => it.value !== null);
  if (visible.length === 0) return null;

  const gridCols =
    visible.length === 1 ? "md:grid-cols-1" : visible.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";

  return (
    <section className="bg-[#0F0F0F] border-y border-black py-14">
      <div className={`max-w-7xl mx-auto px-6 grid grid-cols-1 ${gridCols} gap-6`}>
        {visible.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.key}
              className="text-center bg-black/40 border border-white/5 rounded-xl py-8 px-4 animate-in fade-in duration-200"
            >
              <Icon className="h-8 w-8 mx-auto mb-3 text-[#C8A84B]" />
              <div
                className="text-5xl md:text-6xl text-[#C8211A] leading-none"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
              >
                {(it.value as number).toLocaleString(lang === "pt" ? "pt-BR" : "en-US")}
              </div>
              <div
                className="mt-3 text-xs uppercase tracking-widest text-[#C8A84B]"
                style={{ fontFamily: "Barlow", fontWeight: 600 }}
              >
                {it.label}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
