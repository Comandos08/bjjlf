import { useMemo, useState } from "react";
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
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import {
  ACADEMY_BR_STATES,
  ACADEMY_COUNTRIES,
  type Academy,
} from "@/data/academies";
import { useAcademies } from "@/lib/queries";

/**
 * /academies — Academias Afiliadas listing page.
 *
 * Layout:
 *   1. Dark hero (PageHero) + 3-stat strip
 *   2. Sticky white search/filter/sort bar (sticks under the navbar)
 *   3. Responsive 1/2/3-col grid of academy cards
 *   4. Empty state w/ "clear filters" reset
 *   5. Dark CTA strip linking to /register/academy
 *
 * All filtering is client-side over the hardcoded ACADEMIES seed. The state
 * dropdown is automatically disabled when the country filter is anything
 * other than "Brasil" (the only country with subdivisions in our data).
 */

type SortKey = "recent" | "az" | "byCountry" | "byState";

const ALL = "__ALL__"; // Sentinel value for "no filter selected" in <select>.

export function AcademiesPage() {
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string>(ALL);
  const [state, setState] = useState<string>(ALL);
  const [sort, setSort] = useState<SortKey>("recent");

  // When the country switches AWAY from Brasil, force-reset the state filter.
  // Otherwise a stale "SP" selection would silently zero the result list.
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

  const { data: academies = [] } = useAcademies();

  const filtered = useMemo<Academy[]>(() => {
    const q = query.trim().toLocaleLowerCase();

    let list = academies.filter((a) => {
      // Text search — name OR city, case-insensitive partial match.
      if (q) {
        const haystack = `${a.name} ${a.city}`.toLocaleLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Country exact match.
      if (country !== ALL && a.country !== country) return false;
      // State exact match (only when Brasil + an actual state is selected).
      if (stateEnabled && state !== ALL && a.state !== state) return false;
      return true;
    });

    // Sorting — sort a fresh copy so we don't mutate the source array.
    list = [...list];
    switch (sort) {
      case "recent":
        list.sort((a, b) => b.sinceTimestamp - a.sinceTimestamp);
        break;
      case "az":
        list.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
        break;
      case "byCountry":
        // Group by country alphabetically, name as secondary key.
        list.sort(
          (a, b) =>
            a.country.localeCompare(b.country, "pt-BR") ||
            a.name.localeCompare(b.name, "pt-BR"),
        );
        break;
      case "byState":
        // State first (em-dash sentinels group at the end naturally), then name.
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
    <div className="bg-[#F7F9FC] min-h-screen">
      <PageHero
        kicker={t("academies.kicker")}
        title={t("academies.title")}
        desc={t("academies.subtitle")}
        breadcrumb={[
          { label: t("academies.breadcrumb.parent") },
          { label: t("academies.breadcrumb.current") },
        ]}
      />

      {/* Stats strip — sits immediately below the hero, dark, separator dividers */}
      <section
        className="bg-navbar"
        style={{ borderTop: "1px solid #1F1F1F", borderBottom: "1px solid #1F1F1F" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {[
            { n: "500+", l: t("academies.stats.certified") },
            { n: "28", l: t("academies.stats.countries") },
            { n: "15.000+", l: t("academies.stats.athletes") },
          ].map((s, i) => (
            <div key={s.l} className="flex items-center gap-3">
              {i > 0 && (
                <span aria-hidden className="hidden sm:inline-block h-10 w-px bg-[#2A2A2A]" />
              )}
              <div className="flex flex-col items-center">
                <span
                  className="text-primary"
                  style={{
                    fontFamily: "Barlow Condensed",
                    fontWeight: 700,
                    fontSize: "32px",
                    lineHeight: 1,
                  }}
                >
                  {s.n}
                </span>
                <span className="text-[#888] text-[12px] uppercase tracking-[0.06em] mt-1">
                  {s.l}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky filter bar — sits under the 64px navbar */}
      <div
        className="sticky z-40 bg-white"
        style={{ top: "64px", borderBottom: "1px solid #E5E5E5" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-4 flex flex-col lg:flex-row gap-3 lg:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("academies.search.placeholder")}
              aria-label={t("academies.search.placeholder")}
              className="w-full h-10 pl-10 pr-3 text-[14px] text-[#111] bg-white border border-[#E5E5E5] focus:outline-none focus:border-primary transition-base rounded-none"
            />
          </div>

          {/* Country */}
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

          {/* State (BR only) */}
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

          {/* Sort */}
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

          {/* Result count */}
          <span className="text-[13px] text-[#666] lg:ml-auto lg:pl-3 whitespace-nowrap">
            {resultsLabel}
          </span>
        </div>
      </div>

      {/* Grid */}
      <section className="py-10">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          {filtered.length === 0 ? (
            <div className="bg-white border border-dashed border-[#E5E5E5] p-12 text-center">
              <p className={cn(typo.body.md, "text-[#374151] mb-4")}>
                {t("academies.empty.title")}
              </p>
              <button
                type="button"
                onClick={clearAll}
                className="inline-block px-5 py-2.5 bg-primary text-white text-[12px] uppercase tracking-[0.06em] font-bold hover:bg-primary-dark transition-base rounded-none"
                style={{ fontFamily: "Barlow Condensed" }}
              >
                {t("academies.empty.clear")}
              </button>
            </div>
          ) : (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <AcademyCard key={a.slug} academy={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#1A1A1A", padding: "60px 0" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 text-center">
          <Building2
            className="mx-auto mb-4"
            style={{ width: 48, height: 48, color: "#B8960C" }}
            aria-hidden
          />
          <h2
            className="text-white"
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: "32px",
              lineHeight: 1.1,
            }}
          >
            {t("academies.cta.title")}
          </h2>
          <p
            className="mx-auto mt-2 max-w-2xl"
            style={{ color: "#888", fontFamily: "DM Sans", fontSize: "15px" }}
          >
            {t("academies.cta.subtitle")}
          </p>
          <Link
            to="/register/academy"
            className="inline-block mt-6 px-8 py-3.5 bg-primary text-white hover:bg-primary-dark transition-base rounded-none"
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: "16px",
              letterSpacing: "0.06em",
            }}
          >
            {t("academies.cta.btn")}
          </Link>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* Subcomponents                                                             */
/* ------------------------------------------------------------------------- */

/**
 * Native <select> wrapped to match the site's square-corner / red-focus style
 * without pulling in the heavier shadcn Select (overkill for a simple form
 * filter and adds a portal + keyboard concerns we don't need here).
 */
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
          "h-10 pl-3 pr-9 text-[13px] bg-white border border-[#E5E5E5] rounded-none appearance-none transition-base",
          "focus:outline-none focus:border-primary",
          disabled
            ? "text-[#9CA3AF] cursor-not-allowed bg-[#F9FAFB]"
            : "text-[#111] cursor-pointer hover:border-[#C0C0C0]",
        )}
      >
        {children}
      </select>
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666] pointer-events-none"
        aria-hidden
      />
    </div>
  );
}

function AcademyCard({ academy: a }: { academy: Academy }) {
  const { t } = useI18n();

  return (
    <article
      className="group bg-white border border-[#E5E5E5] overflow-hidden flex flex-col"
      style={{ transition: "all 0.18s ease" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#C41E3A";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(196,30,58,0.12)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#E5E5E5";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Top accent strip */}
      <div style={{ height: 8, background: "#C41E3A" }} aria-hidden />

      <div className="p-5 flex flex-col flex-1">
        {/* Top row: avatar + verified pill */}
        <div className="flex items-center justify-between gap-3">
          <div
            className="grid place-items-center text-white shrink-0"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "#1A1A1A",
              border: "2px solid #B8960C",
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: "0.04em",
            }}
            aria-hidden
          >
            {a.initials}
          </div>
          <span
            className="inline-block uppercase"
            style={{
              background: "#F0FDF4",
              color: "#166534",
              border: "1px solid #BBF7D0",
              padding: "4px 8px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.06em",
            }}
          >
            {t("academies.card.certified")}
          </span>
        </div>

        {/* Name + professor */}
        <h3
          className="mt-3 text-[#111827]"
          style={{
            fontFamily: "Barlow Condensed",
            fontWeight: 700,
            fontSize: "20px",
            lineHeight: 1.1,
          }}
        >
          {a.name}
        </h3>
        <p className="mt-0.5 text-[#6B7280]" style={{ fontFamily: "DM Sans", fontSize: "13px" }}>
          {t("academies.card.professor")} {a.professor}
        </p>

        {/* Divider */}
        <div className="my-3.5" style={{ borderTop: "1px solid #F3F4F6" }} />

        {/* Info rows */}
        <ul className="space-y-2 text-[13px] text-[#374151]">
          <li className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
            <span>
              {a.city}
              {a.state && a.state !== "—" ? `, ${a.state}` : ""} — {a.country} {a.flag}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Award className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
            <span>
              {t("academies.card.belt")} {a.belt} · {a.degree}° {t("academies.card.degree")}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
            <span>
              {t("academies.card.since")} {a.since}
            </span>
          </li>
        </ul>

        {/* Divider */}
        <div className="my-3.5" style={{ borderTop: "1px solid #F3F4F6" }} />

        {/* CTA — full-width */}
        <div className="mt-auto pt-1">
          {/*
           * Detail page (/academies/$slug) doesn't exist yet. The spec says
           * this can be a placeholder for now — we render an <a> with the
           * destination so the URL is correct, but type-safe Link can't be
           * used because the route file isn't registered.
           */}
          <a
            href={`/academies/${a.slug}`}
            onClick={(e) => e.preventDefault()}
            aria-disabled
            className="block w-full text-center bg-primary text-white hover:bg-primary-dark transition-base rounded-none uppercase"
            style={{
              padding: "10px 0",
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.06em",
            }}
          >
            {t("academies.card.viewBtn")}
          </a>
        </div>
      </div>
    </article>
  );
}
