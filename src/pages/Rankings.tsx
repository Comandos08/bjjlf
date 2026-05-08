import { useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/Stepper";
import type { Database } from "@/integrations/supabase/types";

type RankingRow = Database["public"]["Tables"]["rankings"]["Row"];

const ALL = "all";
const BELTS = ["white", "blue", "purple", "brown", "black"] as const;
const GENDERS = ["male", "female"] as const;
const MODALITIES = ["gi", "no_gi"] as const;

type BeltKey = (typeof BELTS)[number];

const BELT_STYLE: Record<BeltKey, { bg: string; color: string; border?: string }> = {
  white: { bg: "#FFFFFF", color: "#0A0A0A", border: "#D1D5DB" },
  blue: { bg: "#1D4ED8", color: "#FFFFFF" },
  purple: { bg: "#7C3AED", color: "#FFFFFF" },
  brown: { bg: "#92400E", color: "#FFFFFF" },
  black: { bg: "#0A0A0A", color: "#FFFFFF" },
};

function normalizeBelt(b: string): BeltKey | null {
  const v = b.toLowerCase().trim();
  if (v === "white" || v === "branca" || v === "branco") return "white";
  if (v === "blue" || v === "azul") return "blue";
  if (v === "purple" || v === "roxa" || v === "roxo") return "purple";
  if (v === "brown" || v === "marrom") return "brown";
  if (v === "black" || v === "preta" || v === "preto") return "black";
  return null;
}

export function RankingsPage() {
  const { t } = useI18n();
  const [season, setSeason] = useState<string>(ALL);
  const [belt, setBelt] = useState<string>(ALL);
  const [gender, setGender] = useState<string>(ALL);
  const [modality, setModality] = useState<string>(ALL);

  const { data: allRows = [], isLoading } = useQuery<RankingRow[]>({
    queryKey: ["rankings", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rankings")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true, nullsFirst: false })
        .order("points", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const seasons = useMemo(
    () => Array.from(new Set(allRows.map((r) => r.season))).sort().reverse(),
    [allRows],
  );

  const rows = useMemo(
    () =>
      allRows.filter(
        (r) =>
          (season === ALL || r.season === season) &&
          (belt === ALL || normalizeBelt(r.belt) === belt) &&
          (gender === ALL || r.gender === gender) &&
          (modality === ALL || r.modality === modality),
      ),
    [allRows, season, belt, gender, modality],
  );

  return (
    <>
      <PageHero
        kicker="BJJLF"
        title={t("rankings.title")}
        desc={t("rankings.subtitle")}
      />

      <section className="bg-background py-10 lg:py-14">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          {/* Filter bar */}
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6 pb-6 border-b border-white/10">
            <FilterSelect
              label={t("rankings.filters.season")}
              value={season}
              onChange={setSeason}
              options={[
                { value: ALL, label: t("rankings.filters.all") },
                ...seasons.map((s) => ({ value: s, label: s })),
              ]}
            />
            <FilterSelect
              label={t("rankings.filters.belt")}
              value={belt}
              onChange={setBelt}
              options={[
                { value: ALL, label: t("rankings.filters.all") },
                ...BELTS.map((b) => ({ value: b, label: t(`rankings.belt.${b}`) })),
              ]}
            />
            <FilterSelect
              label={t("rankings.filters.gender")}
              value={gender}
              onChange={setGender}
              options={[
                { value: ALL, label: t("rankings.filters.all") },
                ...GENDERS.map((g) => ({ value: g, label: t(`rankings.gender.${g}`) })),
              ]}
            />
            <FilterSelect
              label={t("rankings.filters.modality")}
              value={modality}
              onChange={setModality}
              options={[
                { value: ALL, label: t("rankings.filters.all") },
                { value: "gi", label: t("rankings.modality.gi") },
                { value: "no_gi", label: t("rankings.modality.nogi") },
              ]}
            />
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-muted-foreground" style={{ fontFamily: "Barlow" }}>
              …
            </div>
          ) : rows.length === 0 ? (
            <div
              className="py-20 text-center text-muted-foreground border border-white/10"
              style={{ fontFamily: "Barlow", fontWeight: 500 }}
            >
              {t("rankings.empty")}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto border border-white/10">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-dark-2 text-gray-400 uppercase tracking-widest text-xs"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
                      <th className="text-left px-4 py-3 w-[80px]">{t("rankings.col.position")}</th>
                      <th className="text-left px-4 py-3">{t("rankings.col.athlete")}</th>
                      <th className="text-left px-4 py-3">{t("rankings.col.belt")}</th>
                      <th className="text-left px-4 py-3">{t("rankings.col.academy")}</th>
                      <th className="text-left px-4 py-3">{t("rankings.col.country")}</th>
                      <th className="text-right px-4 py-3 w-[100px]">{t("rankings.col.points")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr
                        key={r.id}
                        className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-4 py-3 text-gold" style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 18 }}>
                          {r.position ?? i + 1}
                        </td>
                        <td className="px-4 py-3 text-white" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
                          <span className="mr-2">{r.flag_emoji ?? ""}</span>
                          {r.athlete_name}
                        </td>
                        <td className="px-4 py-3"><BeltPill belt={r.belt} /></td>
                        <td className="px-4 py-3 text-gray-400" style={{ fontFamily: "Barlow" }}>
                          {r.academy ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-400" style={{ fontFamily: "Barlow" }}>
                          {r.country_code}
                        </td>
                        <td className="px-4 py-3 text-right text-white"
                            style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 16 }}>
                          {r.points.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <ul className="md:hidden space-y-3">
                {rows.map((r, i) => (
                  <li key={r.id} className="border border-white/10 bg-dark-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="text-gold shrink-0"
                          style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 22 }}
                        >
                          {r.position ?? i + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-white truncate" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
                            <span className="mr-1.5">{r.flag_emoji ?? ""}</span>
                            {r.athlete_name}
                          </div>
                          <div className="text-xs text-gray-400 truncate" style={{ fontFamily: "Barlow" }}>
                            {r.academy ?? "—"} · {r.country_code}
                          </div>
                        </div>
                      </div>
                      <span className="text-white shrink-0"
                            style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: 18 }}>
                        {r.points.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3"><BeltPill belt={r.belt} /></div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
      <span
        className="text-xs uppercase tracking-widest text-gray-400"
        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-dark-2 border border-white/15 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
        style={{ borderRadius: 0, fontFamily: "Barlow", fontWeight: 500 }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function BeltPill({ belt }: { belt: string }) {
  const { t } = useI18n();
  const key = normalizeBelt(belt);
  if (!key) {
    return (
      <span
        className="inline-block px-2.5 py-1 text-xs uppercase tracking-wider border border-white/20 text-gray-300"
        style={{ borderRadius: 0, fontFamily: "Barlow Condensed", fontWeight: 700 }}
      >
        {belt}
      </span>
    );
  }
  const s = BELT_STYLE[key];
  return (
    <span
      className="inline-block px-2.5 py-1 text-xs uppercase tracking-wider"
      style={{
        background: s.bg,
        color: s.color,
        border: s.border ? `1px solid ${s.border}` : "none",
        borderRadius: 0,
        fontFamily: "Barlow Condensed",
        fontWeight: 700,
      }}
    >
      {t(`rankings.belt.${key}`)}
    </span>
  );
}
