import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

type AthleteRow = {
  id: string;
  full_name: string;
  belt: string;
  photo_url: string | null;
  registration_number: string | null;
  academy: string | null;
  country: string | null;
  country_flag: string | null;
  status: string;
};

type SortKey = "name_asc" | "belt_degree";

const BELT_VALUES = ["branca", "azul", "roxa", "marrom", "preta"] as const;
type BeltKey = (typeof BELT_VALUES)[number];

const BELT_LABEL_PT: Record<BeltKey, string> = {
  branca: "Branca",
  azul: "Azul",
  roxa: "Roxa",
  marrom: "Marrom",
  preta: "Preta",
};
const BELT_LABEL_EN: Record<BeltKey, string> = {
  branca: "White",
  azul: "Blue",
  roxa: "Purple",
  marrom: "Brown",
  preta: "Black",
};

const BELT_RANK: Record<BeltKey, number> = {
  branca: 1,
  azul: 2,
  roxa: 3,
  marrom: 4,
  preta: 5,
};

const BELT_STYLE: Record<BeltKey, { bg: string; color: string; border?: string }> = {
  branca: { bg: "#FFFFFF", color: "#111111", border: "#D1D5DB" },
  azul: { bg: "#1D4ED8", color: "#FFFFFF" },
  roxa: { bg: "#7C3AED", color: "#FFFFFF" },
  marrom: { bg: "#92400E", color: "#FFFFFF" },
  preta: { bg: "#111111", color: "#FFFFFF" },
};

function normalizeBelt(b: string): BeltKey | null {
  const v = (b ?? "").toLowerCase().trim();
  if (v === "branca" || v === "branco" || v === "white") return "branca";
  if (v === "azul" || v === "blue") return "azul";
  if (v === "roxa" || v === "roxo" || v === "purple") return "roxa";
  if (v === "marrom" || v === "brown") return "marrom";
  if (v === "preta" || v === "preto" || v === "black") return "preta";
  return null;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function AthletesPage() {
  const { t, lang } = useI18n();
  const [rows, setRows] = useState<AthleteRow[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBelt, setFilterBelt] = useState("");
  const [filterCountry, setFilterCountry] = useState("");
  const [sort, setSort] = useState<SortKey>("name_asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("athlete_profiles")
        .select(
          "id, full_name, belt, photo_url, registration_number, academy, country, country_flag, status",
        )
        .eq("status", "active");
      if (cancelled) return;
      if (error) {
        console.error("[Athletes]", error);
        setError(true);
        return;
      }
      setRows((data ?? []) as AthleteRow[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search, filterBelt, filterCountry, sort, pageSize]);

  const countries = useMemo(() => {
    if (!rows) return [];
    const map = new Map<string, string | null>();
    rows.forEach((r) => {
      if (r.country && !map.has(r.country)) map.set(r.country, r.country_flag);
    });
    return Array.from(map.entries())
      .map(([name, flag]) => ({ name, flag }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (filterBelt && normalizeBelt(r.belt) !== filterBelt) return false;
      if (filterCountry && r.country !== filterCountry) return false;
      if (
        q &&
        !r.full_name.toLowerCase().includes(q) &&
        !(r.academy ?? "").toLowerCase().includes(q) &&
        !(r.registration_number ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
    out.sort((a, b) => {
      if (sort === "belt_degree") {
        const ra = BELT_RANK[normalizeBelt(a.belt) ?? "branca"] ?? 0;
        const rb = BELT_RANK[normalizeBelt(b.belt) ?? "branca"] ?? 0;
        if (rb !== ra) return rb - ra;
      }
      return a.full_name.localeCompare(b.full_name, "pt-BR");
    });
    return out;
  }, [rows, search, filterBelt, filterCountry, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const from = filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, filtered.length);
  const showingText = t("athletes.showing")
    .replace("{from}", String(from))
    .replace("{to}", String(to))
    .replace("{total}", String(filtered.length));

  const beltLabel = (b: string) => {
    const k = normalizeBelt(b);
    if (!k) return b;
    return lang === "en" ? BELT_LABEL_EN[k] : BELT_LABEL_PT[k];
  };

  const hasFilters = !!(search || filterBelt || filterCountry);
  const clearFilters = () => {
    setSearch("");
    setFilterBelt("");
    setFilterCountry("");
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-8 text-center">
          <h1
            className="text-5xl md:text-6xl uppercase text-gray-900"
            style={{ fontFamily: "Bebas Neue", letterSpacing: "0.04em" }}
          >
            {t("athletes.title")}
          </h1>
          <div className="h-1 w-16 bg-[#C8211A] mx-auto mt-3" />
          <p
            className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "Barlow" }}
          >
            {t("athletes.subtitle")}
          </p>
        </header>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("athletes.search.placeholder")}
            className="w-full h-11 pl-9 pr-3 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#C8211A]"
            style={{ fontFamily: "Barlow", borderRadius: 0 }}
          />
        </div>

        {/* Filter row */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={filterBelt}
            onChange={(e) => setFilterBelt(e.target.value)}
            className="h-10 px-3 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#C8211A] flex-1"
            style={{ fontFamily: "Barlow", borderRadius: 0 }}
          >
            <option value="">{t("athletes.filters.allBelts")}</option>
            {BELT_VALUES.map((b) => (
              <option key={b} value={b}>
                {lang === "en" ? BELT_LABEL_EN[b] : BELT_LABEL_PT[b]}
              </option>
            ))}
          </select>
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="h-10 px-3 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#C8211A] flex-1"
            style={{ fontFamily: "Barlow", borderRadius: 0 }}
          >
            <option value="">{t("athletes.filters.allCountries")}</option>
            {countries.map((c) => (
              <option key={c.name} value={c.name}>
                {c.flag ? `${c.flag} ` : ""}
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 px-3 border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#C8211A] flex-1"
            style={{ fontFamily: "Barlow", borderRadius: 0 }}
          >
            <option value="name_asc">{t("athletes.sort.nameAsc")}</option>
            <option value="belt_degree">{t("athletes.sort.beltDegree")}</option>
          </select>
        </div>

        {/* Count + per-page */}
        {rows !== null && !error && filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600" style={{ fontFamily: "Barlow" }}>
                {showingText}
              </p>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="h-8 px-2 border border-gray-300 bg-white text-[13px] focus:outline-none focus:border-[#C8211A]"
                style={{ fontFamily: "Barlow", borderRadius: 0 }}
                aria-label={t("athletes.perPage")}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n} {t("athletes.perPage")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Content */}
        {rows === null && !error ? (
          <ul className="bg-white border border-gray-200">
            {Array.from({ length: 8 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center gap-4 px-4 border-b border-gray-200 last:border-b-0"
                style={{ height: 64 }}
              >
                <div className="w-12 h-12 bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 bg-gray-200 animate-pulse" />
                  <div className="h-2 w-1/4 bg-gray-100 animate-pulse" />
                </div>
                <div className="w-16 h-5 bg-gray-200 animate-pulse" />
                <div className="w-32 h-3 bg-gray-100 animate-pulse" />
                <div className="w-20 h-3 bg-gray-100 animate-pulse" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="bg-white border border-gray-200 py-16 text-center">
            <Loader2 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500" style={{ fontFamily: "Barlow" }}>
              {t("athletes.error")}
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 py-16 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p
              className="text-xl text-gray-700 uppercase"
              style={{ fontFamily: "Bebas Neue", letterSpacing: "0.03em" }}
            >
              {hasFilters ? t("athletes.emptyFiltered") : t("athletes.empty")}
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-3 text-sm text-[#C8211A] hover:underline"
                style={{ fontFamily: "Barlow", fontWeight: 700 }}
              >
                {t("athletes.clearFilters")}
              </button>
            )}
          </div>
        ) : (
          <>
            <ul className="bg-white border border-gray-200">
              {paged.map((a) => {
                const beltKey = normalizeBelt(a.belt);
                const beltStyle = beltKey
                  ? BELT_STYLE[beltKey]
                  : { bg: "#E5E7EB", color: "#111111", border: "#D1D5DB" };
                return (
                  <li
                    key={a.id}
                    className="group flex items-center gap-4 px-4 py-3 border-b border-gray-200 last:border-b-0 border-l-[3px] border-l-transparent hover:bg-[#FAFAFA] hover:border-l-[#C8211A] transition-colors"
                    style={{ minHeight: 64 }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-12 h-12 flex-shrink-0 overflow-hidden grid place-items-center"
                      style={{ background: "#0F0F0F" }}
                    >
                      {a.photo_url ? (
                        <img
                          src={a.photo_url}
                          alt={a.full_name}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span
                          className="text-[#C8A84B] text-base"
                          style={{ fontFamily: "Bebas Neue", letterSpacing: "0.05em" }}
                        >
                          {initials(a.full_name)}
                        </span>
                      )}
                    </div>

                    {/* Name + reg # */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-gray-900 uppercase leading-tight truncate"
                        style={{ fontFamily: "Bebas Neue", fontSize: 18, letterSpacing: "0.02em" }}
                      >
                        {a.full_name}
                      </p>
                      {a.registration_number && (
                        <p
                          className="text-gray-400 mt-0.5"
                          style={{
                            fontFamily: "Barlow",
                            fontSize: 10,
                            letterSpacing: "0.15em",
                          }}
                        >
                          {a.registration_number}
                        </p>
                      )}
                    </div>

                    {/* Belt pill */}
                    <div className="flex-shrink-0 hidden sm:block">
                      <span
                        className="inline-flex items-center px-2 py-1 uppercase"
                        style={{
                          background: beltStyle.bg,
                          color: beltStyle.color,
                          border: beltStyle.border ? `1px solid ${beltStyle.border}` : "none",
                          borderRadius: 0,
                          fontFamily: "Barlow",
                          fontWeight: 700,
                          fontSize: 10,
                          letterSpacing: "0.1em",
                        }}
                      >
                        {beltLabel(a.belt)}
                      </span>
                    </div>

                    {/* Academy */}
                    <div className="flex-shrink-0 hidden md:block w-48">
                      <p
                        className="text-gray-600 text-sm truncate"
                        style={{ fontFamily: "Barlow" }}
                        title={a.academy ?? ""}
                      >
                        {a.academy ?? "—"}
                      </p>
                    </div>

                    {/* Country */}
                    <div className="flex-shrink-0 hidden lg:block w-36">
                      <p
                        className="text-gray-500 text-sm truncate"
                        style={{ fontFamily: "Barlow" }}
                      >
                        {a.country_flag ? `${a.country_flag} ` : ""}
                        {a.country ?? "—"}
                      </p>
                    </div>

                    {/* Action */}
                    <div className="flex-shrink-0 ml-auto">
                      {a.registration_number ? (
                        <Link
                          to="/verify/$athleteId"
                          params={{ athleteId: a.registration_number }}
                          className="text-[#C8211A] uppercase hover:underline"
                          style={{
                            fontFamily: "Barlow",
                            fontWeight: 700,
                            fontSize: 12,
                            letterSpacing: "0.15em",
                          }}
                        >
                          {t("athletes.card.viewCard")}
                        </Link>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-2 flex-wrap"
                aria-label="Paginação"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 h-10 px-3 border border-gray-300 text-sm bg-white hover:border-[#C8211A] hover:text-[#C8211A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-inherit transition"
                  style={{ fontFamily: "Barlow", fontWeight: 600, borderRadius: 0 }}
                >
                  <ChevronLeft className="h-4 w-4" /> {t("athletes.prev")}
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  const show =
                    n === 1 ||
                    n === totalPages ||
                    (n >= safePage - 1 && n <= safePage + 1);
                  if (!show) {
                    if (n === safePage - 2 || n === safePage + 2) {
                      return (
                        <span key={n} className="px-2 text-gray-400">
                          …
                        </span>
                      );
                    }
                    return null;
                  }
                  const active = n === safePage;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-10 min-w-10 px-3 text-sm border transition ${
                        active
                          ? "bg-[#C8211A] border-[#C8211A] text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:border-[#C8211A] hover:text-[#C8211A]"
                      }`}
                      style={{
                        fontFamily: "Barlow",
                        fontWeight: active ? 700 : 500,
                        borderRadius: 0,
                      }}
                      aria-current={active ? "page" : undefined}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 h-10 px-3 border border-gray-300 text-sm bg-white hover:border-[#C8211A] hover:text-[#C8211A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-inherit transition"
                  style={{ fontFamily: "Barlow", fontWeight: 600, borderRadius: 0 }}
                >
                  {t("athletes.next")} <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
