import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/Stepper";

type AthleteRow = {
  id: string;
  full_name: string;
  belt: string;
  degree: number;
  academy: string | null;
  country: string | null;
  country_flag: string | null;
  photo_url: string | null;
  registration_number: string | null;
};

const ALL = "all";
const BELTS = ["white", "blue", "purple", "brown", "black"] as const;
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

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function AthletesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [belt, setBelt] = useState<string>(ALL);
  const [country, setCountry] = useState<string>(ALL);
  const deferredSearch = useDeferredValue(search);

  const { data: allRows = [], isLoading } = useQuery<AthleteRow[]>({
    queryKey: ["athletes", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_profiles")
        .select(
          "id,full_name,belt,degree,academy,country,country_flag,photo_url,registration_number",
        )
        .eq("status", "active")
        .order("full_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as AthleteRow[];
    },
  });

  const countries = useMemo(
    () =>
      Array.from(
        new Set(allRows.map((r) => r.country).filter((c): c is string => !!c)),
      ).sort(),
    [allRows],
  );

  const rows = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return allRows.filter(
      (r) =>
        (q === "" || r.full_name.toLowerCase().includes(q)) &&
        (belt === ALL || normalizeBelt(r.belt) === belt) &&
        (country === ALL || r.country === country),
    );
  }, [allRows, deferredSearch, belt, country]);

  return (
    <>
      <PageHero
        kicker="BJJLF"
        title={t("athletes.title")}
        desc={t("athletes.subtitle")}
      />

      <section className="bg-background py-10 lg:py-14">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6 pb-6 border-b border-white/10">
            <label className="flex flex-col gap-1.5 w-full md:w-[400px]">
              <span
                className="text-xs uppercase tracking-widest text-gray-400"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {t("athletes.search.placeholder")}
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("athletes.search.placeholder")}
                className="bg-dark-2 border border-white/15 text-white px-3 py-2.5 text-sm focus:outline-none focus:border-gold transition-colors"
                style={{ borderRadius: 0, fontFamily: "Barlow", fontWeight: 500 }}
              />
            </label>
            <FilterSelect
              label={t("athletes.filters.belt")}
              value={belt}
              onChange={setBelt}
              options={[
                { value: ALL, label: t("rankings.filters.all") },
                ...BELTS.map((b) => ({ value: b, label: t(`rankings.belt.${b}`) })),
              ]}
            />
            <FilterSelect
              label={t("athletes.filters.country")}
              value={country}
              onChange={setCountry}
              options={[
                { value: ALL, label: t("rankings.filters.all") },
                ...countries.map((c) => ({ value: c, label: c })),
              ]}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-white/10 bg-dark-2 aspect-[4/5] animate-pulse"
                />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div
              className="py-20 text-center text-muted-foreground border border-white/10"
              style={{ fontFamily: "Barlow", fontWeight: 500 }}
            >
              {t("athletes.empty")}
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rows.map((r) => (
                <li
                  key={r.id}
                  className="border border-white/10 bg-dark-2 flex flex-col"
                >
                  <div className="aspect-square bg-black/40 overflow-hidden flex items-center justify-center">
                    {r.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.photo_url}
                        alt={r.full_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span
                        className="text-gold text-5xl"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 900 }}
                      >
                        {initials(r.full_name)}
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-2 flex-1">
                    <h3
                      className="text-white text-lg leading-tight"
                      style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
                    >
                      {r.full_name}
                    </h3>
                    <div>
                      <BeltPill belt={r.belt} degree={r.degree} />
                    </div>
                    {r.academy && (
                      <p
                        className="text-sm text-gray-400 truncate"
                        style={{ fontFamily: "Barlow" }}
                        title={r.academy}
                      >
                        {r.academy}
                      </p>
                    )}
                    {r.country && (
                      <p
                        className="text-sm text-gray-400"
                        style={{ fontFamily: "Barlow" }}
                      >
                        <span className="mr-1.5">{r.country_flag ?? ""}</span>
                        {r.country}
                      </p>
                    )}
                    {r.registration_number && (
                      <p
                        className="text-xs text-gray-500 mt-auto pt-1"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 600, letterSpacing: "0.05em" }}
                      >
                        {r.registration_number}
                      </p>
                    )}
                    {r.registration_number && (
                      <Link
                        to="/verify/$athleteId"
                        params={{ athleteId: r.registration_number }}
                        className="mt-2 block text-center border border-gold text-gold py-2 text-xs uppercase tracking-widest hover:bg-gold hover:text-black transition-colors"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                      >
                        {t("athletes.card.viewProfile")}
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
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
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BeltPill({ belt, degree }: { belt: string; degree?: number }) {
  const { t } = useI18n();
  const key = normalizeBelt(belt);
  const baseStyle = {
    borderRadius: 0,
    fontFamily: "Barlow Condensed",
    fontWeight: 700,
  } as const;
  if (!key) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-wider border border-white/20 text-gray-300"
        style={baseStyle}
      >
        {belt}
        {degree && degree > 0 ? <DegreeDots count={degree} color="#9CA3AF" /> : null}
      </span>
    );
  }
  const s = BELT_STYLE[key];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-wider"
      style={{
        ...baseStyle,
        background: s.bg,
        color: s.color,
        border: s.border ? `1px solid ${s.border}` : "none",
      }}
    >
      {t(`rankings.belt.${key}`)}
      {degree && degree > 0 ? <DegreeDots count={degree} color={s.color} /> : null}
    </span>
  );
}

function DegreeDots({ count, color }: { count: number; color: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
        <span
          key={i}
          className="inline-block w-1 h-1"
          style={{ background: color }}
        />
      ))}
    </span>
  );
}
