import { useEffect, useState } from "react";
import { Loader2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useRequireActiveAthlete } from "@/hooks/useRequireActiveAthlete";

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

const medalStyles: Record<string, string> = {
  gold: "bg-yellow-50 text-yellow-700 border-yellow-200",
  silver: "bg-gray-50 text-gray-600 border-gray-200",
  bronze: "bg-orange-50 text-orange-700 border-orange-200",
};

export function MyCompetitionsPage() {
  const { profile, isLoading: authLoading } = useRequireActiveAthlete();
  const [items, setItems] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("competition_history")
        .select("id, event_name, event_date, location, category, weight_class, result, medal")
        .eq("athlete_id", profile.id)
        .order("event_date", { ascending: false });
      if (!cancelled) {
        setItems((data ?? []) as Competition[]);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [profile]);

  if (authLoading || !profile) {
    return (
      <div className="bg-gray-50 min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-6">
        <header className="mb-10">
          <h1 className="text-3xl text-gray-900 uppercase font-heading font-bold tracking-wide">
            Minhas Competições
          </h1>
          <div className="h-1 w-12 bg-[#C8211A] rounded mt-3" />
        </header>

        {loading ? (
          <div className="grid place-items-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base text-gray-400 mb-1" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
              Nenhuma competição registrada
            </p>
            <p className="text-sm text-gray-500 max-w-md mx-auto" style={{ fontFamily: "Barlow" }}>
              Seu histórico de competições aparecerá aqui após participar de eventos oficiais BJJLF.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map((c) => {
              const badgeCls = c.medal && medalStyles[c.medal]
                ? medalStyles[c.medal]
                : "bg-blue-50 text-blue-700 border-blue-200";
              const dateFmt = new Date(c.event_date).toLocaleDateString("pt-BR", {
                day: "2-digit", month: "2-digit", year: "numeric",
              });
              return (
                <li key={c.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg text-gray-900" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
                      {c.event_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: "Barlow" }}>
                      {dateFmt}{c.location ? ` · ${c.location}` : ""}
                    </p>
                    {(c.category || c.weight_class) && (
                      <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: "Barlow" }}>
                        {[c.category, c.weight_class].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                  {c.result && (
                    <span className={cn("inline-block px-3 py-1.5 text-xs uppercase tracking-wider border rounded-full whitespace-nowrap", badgeCls)} style={{ fontFamily: "Barlow", fontWeight: 600 }}>
                      {c.result}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
