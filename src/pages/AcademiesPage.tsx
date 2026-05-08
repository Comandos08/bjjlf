import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  MapPin,
  Award,
  Calendar,
  Building2,
  ChevronDown,
} from "lucide-react";
import { PageHero } from "@/components/Stepper";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  ACADEMY_BR_STATES,
  ACADEMY_COUNTRIES,
  type Academy,
} from "@/data/academies";
import { useAcademies } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";

type SortKey = "recent" | "az" | "byCountry" | "byState";

const ALL = "__ALL__";

export function AcademiesPage() {
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>(ALL);
  const [state, setState] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("recent");

  const handleCountryChange = (next: string) => {
    setCountry(next);
    if (next !== "Brasil") setState(ALL);
  };

  const stateEnabled = country === "Brasil";

  const clearAll = () => {
    setQuery("");
    setCountry(ALL);
    setState(ALL);
    setSort("recent");
  };

  const { data: academies = [], isLoading } = useAcademies();

  const [stats, setStats] = useState<{ academies: number; countries: number; athletes: number } | null>(null);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [aRes, cRes, athRes] = await Promise.all([
        supabase.from("affiliated_academies_view").select("*", { count: "exact", head: true }),
        supabase.from("affiliated_academies_view").select("country"),
        supabase.from("athlete_profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
      ]);
      if (cancelled) return;
      const countries = new Set((cRes.data ?? []).map((r: { country: string | null }) => r.country).filter(Boolean));
      setStats({
        academies: aRes.count ?? 0,
        countries: countries.size,
        athletes: athRes.count ?? 0,
      });
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo<Academy[]>(() => {
    const q = query.trim().toLocaleLowerCase();

    let list = academies.filter((a) => {
      if (q) {
        const haystack = `${a.name} ${a.city}`.toLocaleLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (country !== ALL && a.country !== country) return false;
      if (stateEnabled && state !== ALL && a.state !== state) return false;
      return true;
    });

    list = [...list];
    switch (sort) {
      case "recent":
        list.sort((a, b) => b.sinceTimestamp - a.sinceTimestamp);
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        break;
      case "byCountry":
        list.sort(
          (a, b) =>
            a.country.localeCompare(b.country, "pt-BR") ||
            a.name.localeCompare(b.name, "pt-BR"),
        );
        break;
      case "byState":
        list.sort(
          (a, b) =>
            a.state.localeCompare(b.state, "pt-BR") ||
            a.name.localeCompare(b.name, "pt-BR"),
        );
        break;
    }

    return list;
  }, [academies, query, country, state, stateEnabled, sort]);

  const resultsLabel =
    filtered.length === 1
      ? t("academies.results.one").replace("{n}", "1")
      : t("academies.results.many").replace("{n}", String(filtered.length));

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        kicker={t("academies.kicker")}
        title={t("academies.title")}
        desc={t("academies.subtitle")}
        breadcrumb={[
          { label: t("academies.breadcrumb.parent") },
          { label: t("academies.breadcrumb.current") },
        ]}
      />

      {/* Stats strip — light variant */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {[
            { n: String(stats?.academies ?? 0), l: t("academies.stats.certified") },
            { n: String(stats?.countries ?? 0), l: t("academies.stats.countries") },
            { n: String(stats?.athletes ?? 0), l: t("academies.stats.athletes") },
          ].map((s, i) => (
            <div key={s.l} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden className="hidden sm:inline-block h-10 w-px bg-gray-200" />
              )}
              <div className="flex flex-col items-center">
                <span
                  className="text-[#C8211A]"
                  style={{
                    fontFamily: "Barlow Condensed",
                    fontWeight: 700,
                    fontSize: "32px",
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </span>
                <span
                  className="text-gray-500 text-xs uppercase tracking-widest mt-1"
                  style={{ fontFamily: "Barlow", fontWeight: 600 }}
                >
                  {s.l}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky white filter bar */}
      <div
        className="sticky z-40 bg-white border-b border-gray-200"
        style={{ top: "64px" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col lg:flex-row gap-3 lg:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0 lg:max-w-lg">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("academies.search.placeholder")}
              aria-label={t("academies.search.placeholder")}
              className="w-full h-11 pl-10 pr-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-[#C8211A] focus:ring-2 focus:ring-[#C8211A]/20 transition-base"
              style={{ fontFamily: "Barlow", fontWeight: 400 }}
            />
          </div>

          <SelectField
            value={country}
            onChange={(v) => handleCountryChange(v)}
            ariaLabel={t("academies.filter.allCountries")}
          >
            <option value={ALL}>{t("academies.filter.allCountries")}</option>
            {ACADEMY_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>

          <SelectField
            value={stateEnabled ? state : ALL}
            onChange={(v) => setState(v)}
            disabled={!stateEnabled}
            ariaLabel={t("academies.filter.allStates")}
          >
            <option value={ALL}>
              {stateEnabled ? t("academies.filter.allStates") : t("academies.filter.stateNA")}
            </option>
            {stateEnabled &&
              ACADEMY_BR_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
          </SelectField>

          <SelectField
            value={sort}
            onChange={(v) => setSort(v as SortKey)}
            ariaLabel={t("academies.sort.label")}
          >
            <option value="recent">{t("academies.sort.recent")}</option>
            <option value="az">{t("academies.sort.az")}</option>
            <option value="byCountry">{t("academies.sort.byCountry")}</option>
            <option value="byState">{t("academies.sort.byState")}</option>
          </SelectField>

          <span
            className="text-sm text-gray-500 lg:ml-auto lg:pl-3 whitespace-nowrap"
            style={{ fontFamily: "Barlow", fontWeight: 500 }}
          >
            {resultsLabel}
          </span>
        </div>
      </div>

      {/* Grid */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* CTA destaque — Afilie sua Academia */}
          <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2a2a2a] border border-[#C8A84B]/30 rounded-xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div className="flex-1 min-w-0">
              <span
                className="inline-block bg-[#C8A84B] text-black text-xs uppercase px-2 py-0.5 rounded-full mb-2"
                style={{ fontFamily: "Barlow", fontWeight: 700 }}
              >
                Novo
              </span>
              <h3
                className="text-white text-2xl uppercase leading-tight"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
              >
                Afilie sua Academia
              </h3>
              <p
                className="text-gray-400 text-sm mt-1 leading-relaxed"
                style={{ fontFamily: "Barlow", fontWeight: 400 }}
              >
                Obtenha o Alvará Oficial BJJLF e apareça no diretório da federação
              </p>
              <p
                className="text-[#C8A84B] text-lg mt-2"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                R$ 300,00 / ano
              </p>
            </div>
            <Link
              to="/academy/permit"
              className="bg-[#C8211A] hover:bg-[#8B1612] text-white text-sm uppercase tracking-widest px-6 py-3 rounded-lg transition-base shrink-0"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              Solicitar Alvará →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <AcademyCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
              <Search className="mx-auto h-16 w-16 text-gray-200" aria-hidden />
              <h3
                className="mt-4 text-2xl uppercase tracking-wide text-gray-400"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {t("academies.empty.title")}
              </h3>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 inline-flex items-center gap-1.5 text-sm tracking-wide text-[#C8211A] hover:text-[#8B1612] transition-base"
                style={{ fontFamily: "Barlow", fontWeight: 600 }}
              >
                {t("academies.empty.clear")}
              </button>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <AcademyCard key={a.slug} academy={a} />
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Subcomponents                                                             */
/* ------------------------------------------------------------------------- */

function SelectField({
  value,
  onChange,
  children,
  disabled,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={ariaLabel}
        className={cn(
          "h-11 pl-3 pr-9 text-sm bg-white border border-gray-300 rounded-lg appearance-none transition-base",
          "focus:outline-none focus:border-[#C8211A] focus:ring-2 focus:ring-[#C8211A]/20",
          disabled
            ? "text-gray-400 cursor-not-allowed bg-gray-50"
            : "text-gray-900 cursor-pointer hover:border-gray-400",
        )}
        style={{ fontFamily: "Barlow", fontWeight: 400 }}
      >
        {children}
      </select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none"
        aria-hidden
      />
    </div>
  );
}

function AcademyCard({ academy: a }: { academy: Academy }) {
  const { t } = useI18n();

  const beltColor =
    a.belt?.toLowerCase().includes("preta") || a.belt?.toLowerCase().includes("black")
      ? { bg: "#1a1a1a", color: "#FFFFFF" }
      : a.belt?.toLowerCase().includes("vermelha")
        ? { bg: "#C8211A", color: "#FFFFFF" }
        : { bg: "#F3F4F6", color: "#111827" };

  return (
    <article className="group bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-base overflow-hidden flex flex-col">
      {/* Top accent strip */}
      <div className="h-1.5 bg-[#C8211A]" aria-hidden />

      <div className="p-6 flex flex-col flex-1">
        {/* Top row: avatar + verified pill */}
        <div className="flex items-center justify-between gap-3">
          {a.logoUrl ? (
            <img
              src={a.logoUrl}
              alt={a.name}
              className="shrink-0 rounded-full object-cover bg-white"
              style={{ width: 64, height: 64, border: "2px solid #C8A84B" }}
              loading="lazy"
            />
          ) : (
            <div
              className="grid place-items-center text-white shrink-0 rounded-full"
              style={{
                width: 64,
                height: 64,
                background: "#1A1A1A",
                border: "2px solid #C8A84B",
                fontFamily: "Barlow Condensed",
                fontWeight: 700,
                fontSize: 20,
                letterSpacing: "0.04em",
              }}
              aria-hidden
            >
              {a.initials}
            </div>
          )}
          <span
            className="inline-block uppercase rounded-full bg-green-50 text-green-700 border border-green-200 px-3 py-1 text-[10px] tracking-widest"
            style={{ fontFamily: "Barlow", fontWeight: 700 }}
          >
            {t("academies.card.certified")}
          </span>
        </div>

        {/* Name + professor */}
        <h3
          className="mt-4 text-xl uppercase text-gray-900 leading-tight"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          {a.name}
        </h3>
        <p
          className="mt-1 text-sm text-gray-600"
          style={{ fontFamily: "Barlow", fontWeight: 500 }}
        >
          {t("academies.card.professor")} {a.professor}
        </p>

        {/* Divider */}
        <div className="border-t border-gray-100 mt-4 pt-4" />

        {/* Info rows */}
        <ul className="space-y-2.5 text-sm text-gray-500" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#C8211A] shrink-0" aria-hidden />
            <span>
              {a.city}
              {a.state && a.state !== "—" ? `, ${a.state}` : ""} — {a.country} {a.flag}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-[#C8211A] shrink-0" aria-hidden />
            <span className="flex items-center gap-2">
              {t("academies.card.belt")}{" "}
              <span
                className="inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest"
                style={{
                  background: beltColor.bg,
                  color: beltColor.color,
                  fontFamily: "Barlow",
                  fontWeight: 700,
                }}
              >
                {a.belt}
              </span>
              · {a.degree}° {t("academies.card.degree")}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-[#C8211A] shrink-0" aria-hidden />
            <span>
              {t("academies.card.since")} {a.since}
            </span>
          </li>
        </ul>

        {/* CTA — full-width */}
        <div className="mt-6">
          <a
            href={`/academies/${a.slug}`}
            onClick={(e) => e.preventDefault()}
            aria-disabled
            className="block w-full text-center rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white py-3 text-sm uppercase tracking-widest transition-base"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            {t("academies.card.viewBtn")}
          </a>
        </div>
      </div>
    </article>
  );
}

function AcademyCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      <div className="h-1.5 bg-[#E5E5E5]" />
      <div className="p-6 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between">
          <div className="h-16 w-16 rounded-full bg-[#E5E5E5] animate-pulse" />
          <div className="h-5 w-20 bg-[#E5E5E5] rounded-full animate-pulse" />
        </div>
        <div className="h-6 w-3/4 bg-[#E5E5E5] rounded animate-pulse mt-2" />
        <div className="h-4 w-1/2 bg-[#E5E5E5] rounded animate-pulse" />
        <div className="border-t border-gray-100 my-2" />
        <div className="h-4 w-full bg-[#E5E5E5] rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-[#E5E5E5] rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-[#E5E5E5] rounded animate-pulse" />
        <div className="mt-4 h-11 w-full bg-[#E5E5E5] rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
