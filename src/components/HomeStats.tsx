import { useEffect, useState } from "react";
import { Users, Building2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type Stats = {
  athletes: number;
  academies: number;
  events: number;
};

/**
 * Prova social com counts reais do Supabase.
 * - Atletas: athlete_profiles WHERE status='active'
 * - Academias: affiliated_academies(is_active) + academy_permits(active)
 * - Eventos: total da tabela events
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
      setStats({
        athletes: athletesRes.count ?? 0,
        academies: (academiesRes.count ?? 0) + (permitsRes.count ?? 0),
        events: eventsRes.count ?? 0,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const items: Array<{ icon: typeof Users; value: number; label: string }> = [
    {
      icon: Users,
      value: stats?.athletes ?? 0,
      label: lang === "pt" ? "Atletas Ativos" : "Active Athletes",
    },
    {
      icon: Building2,
      value: stats?.academies ?? 0,
      label: lang === "pt" ? "Academias Afiliadas" : "Affiliated Academies",
    },
    {
      icon: Trophy,
      value: stats?.events ?? 0,
      label: lang === "pt" ? "Eventos Realizados" : "Events Hosted",
    },
  ];

  return (
    <section className="bg-[#0F0F0F] border-y border-black py-14">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div
              key={it.label}
              className="text-center bg-black/40 border border-white/5 rounded-xl py-8 px-4"
            >
              <Icon className="h-8 w-8 mx-auto mb-3 text-[#C8A84B]" />
              <div
                className="text-5xl md:text-6xl text-[#C8211A] leading-none"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
              >
                {stats === null ? "—" : it.value.toLocaleString(lang === "pt" ? "pt-BR" : "en-US")}
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
