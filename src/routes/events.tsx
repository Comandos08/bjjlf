import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { EventList } from "@/components/EventList";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type EventTypeBadge } from "@/data/events";
import { useEvents } from "@/lib/queries";
import { usePersistedEventFilters } from "@/lib/event-filters-storage";
import {
  EVENT_SORTS,
  parseEventSort,
  type EventSort,
} from "@/lib/event-sort";
import {
  parsePage,
  parsePerPage,
} from "@/lib/pagination";

const VALID_BADGES: ReadonlyArray<EventTypeBadge> = [
  "GI",
  "NO-GI",
  "GI & NO-GI",
  "KIDS",
  "MASTER",
  "SEMINÁRIO",
  "CURSO",
];

function parseBadges(input: unknown): EventTypeBadge[] {
  const raw: string[] = Array.isArray(input)
    ? input.flatMap((v) => (typeof v === "string" ? v.split(",") : []))
    : typeof input === "string"
      ? input.split(",")
      : [];

  const cleaned = raw
    .map((v) => v.trim().toUpperCase())
    .map((v) => (v === "GI & NO-GI" || v === "GI&NO-GI" ? "GI & NO-GI" : v));

  const set = new Set(cleaned);
  return VALID_BADGES.filter((b) => set.has(b));
}

type EventsSearch = {
  badges: EventTypeBadge[];
  sort: EventSort;
  q: string;
  page: number;
  perPage: number;
};

function parseQuery(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/\s+/g, " ").trim().slice(0, 100);
}

export const Route = createFileRoute("/events")({
  validateSearch: (search: Record<string, unknown>): EventsSearch => ({
    badges: parseBadges(search.badges),
    sort: parseEventSort(search.sort),
    q: parseQuery(search.q),
    page: parsePage(search.page),
    perPage: parsePerPage(search.perPage),
  }),
  head: () => ({
    meta: [
      { title: "Calendário de Eventos — BJJLF" },
      {
        name: "description",
        content:
          "Calendário oficial de eventos BJJLF. Filtre por GI, NO-GI, GI & NO-GI, KIDS ou MASTER.",
      },
      { property: "og:title", content: "Calendário de Eventos — BJJLF" },
      {
        property: "og:description",
        content:
          "Calendário oficial de eventos BJJLF. Filtre por GI, NO-GI, GI & NO-GI, KIDS ou MASTER.",
      },
    ],
  }),
  component: EventsListPage,
});

function EventsListPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const badges: EventTypeBadge[] = search.badges;
  const sort: EventSort = search.sort;
  const urlQuery: string = search.q;
  const page: number = search.page;
  const perPage: number = search.perPage;
  const navigate = useNavigate({ from: "/events" });

  const [queryInput, setQueryInput] = useState(urlQuery);
  useEffect(() => {
    setQueryInput(urlQuery);
  }, [urlQuery]);

  usePersistedEventFilters();

  const { data: dbEvents = [] } = useEvents();
  const EVENTS = dbEvents;

  // Categories shown as chips (in order). Filter out unused.
  const CHIP_BADGES: ReadonlyArray<EventTypeBadge> = useMemo(() => {
    const present = new Set(EVENTS.map((e) => e.badge));
    return (["GI", "NO-GI", "GI & NO-GI", "KIDS", "MASTER"] as EventTypeBadge[])
      .filter((b) => present.has(b));
  }, [EVENTS]);

  // Counters reflect the total per category across the full dataset (after
  // text-search), independent of the currently-active chip selection.
  const counts = useMemo(() => {
    const q = urlQuery.trim().toLocaleLowerCase();
    const base = q.length === 0
      ? EVENTS
      : EVENTS.filter(
          (e) =>
            e.name.toLocaleLowerCase().includes(q) ||
            e.location.toLocaleLowerCase().includes(q),
        );
    const map = new Map<EventTypeBadge | "ALL", number>();
    map.set("ALL", base.length);
    for (const b of CHIP_BADGES) map.set(b, 0);
    for (const e of base) {
      map.set(e.badge, (map.get(e.badge) ?? 0) + 1);
    }
    return map;
  }, [urlQuery, CHIP_BADGES, EVENTS]);

  // Total of currently filtered events (for the results counter).
  const filteredTotal = useMemo(() => {
    const q = urlQuery.trim().toLocaleLowerCase();
    let base = badges.length === 0
      ? EVENTS
      : EVENTS.filter((e) => new Set(badges).has(e.badge));
    if (q.length > 0) {
      base = base.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(q) ||
          e.location.toLocaleLowerCase().includes(q),
      );
    }
    return base.length;
  }, [badges, urlQuery, EVENTS]);

  const setBadges = (next: ReadonlyArray<EventTypeBadge>) =>
    navigate({
      search: (prev: EventsSearch) => ({ ...prev, badges: [...next], page: 1 }),
      replace: true,
    });

  const setSort = (next: EventSort) =>
    navigate({
      search: (prev: EventsSearch) => ({ ...prev, sort: next, page: 1 }),
      replace: true,
    });

  const setQuery = (next: string) =>
    navigate({
      search: (prev: EventsSearch) => ({ ...prev, q: next, page: 1 }),
      replace: true,
    });

  const setPage = (next: number) =>
    navigate({
      search: (prev: EventsSearch) => ({ ...prev, page: next }),
      replace: false,
    }).then(() => {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

  useEffect(() => {
    const next = queryInput.trim();
    if (next === urlQuery) return;
    const id = window.setTimeout(() => setQuery(next), 200);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput, urlQuery]);

  // Single-select: clicking a chip activates only that filter.
  const selectChip = (badge: EventTypeBadge | null) => {
    setBadges(badge ? [badge] : []);
  };

  const clearQuery = () => {
    setQueryInput("");
    setQuery("");
  };

  const activeChip: EventTypeBadge | null = badges.length === 1 ? badges[0] : null;
  const allActive = badges.length === 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Hero — dark banner */}
      <section className="relative bg-gray-900 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #C8211A 0px, transparent 1px), radial-gradient(circle at 80% 70%, #C8A84B 0px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <nav
            className="flex items-center gap-2 mb-4 text-sm text-gray-500"
            style={{ fontFamily: "Barlow", fontWeight: 400 }}
          >
            <Link to="/" className="hover:text-white transition-base">
              {t("nav.home")}
            </Link>
            <span className="text-gray-700">/</span>
            <span className="text-gray-300">{t("events.page.title")}</span>
          </nav>
          <h1
            className="text-5xl md:text-6xl uppercase tracking-wide text-white leading-[0.95]"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            {t("events.page.title")}
          </h1>
          <p
            className="mt-4 max-w-2xl text-base md:text-lg text-gray-400 leading-[1.7]"
            style={{ fontFamily: "Barlow", fontWeight: 400 }}
          >
            {t("events.page.subtitle")}
          </p>
        </div>
      </section>

      {/* Filters card + grid */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6 space-y-6">
          {/* Unified filter card */}
          <div className="bg-white border border-[#E0E0E0] rounded-xl shadow-sm p-4 md:p-5">
            {/* Row 1: search + sort */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1 lg:max-w-md">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
                <Input
                  type="search"
                  inputMode="search"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder={t("events.search.placeholder")}
                  aria-label={t("events.search.label")}
                  className="pl-9 pr-9 rounded-lg border-gray-300 focus:border-[#C8211A] focus:ring-[#C8211A]/20"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                  data-testid="event-search-input"
                />
                {queryInput.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearQuery}
                    aria-label={t("events.search.clear")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center text-gray-400 hover:text-gray-700 focus-ring rounded"
                    data-testid="event-search-clear"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="flex items-center justify-end gap-2">
                <label
                  htmlFor="event-sort-select"
                  className="shrink-0 text-xs uppercase tracking-widest text-gray-500"
                  style={{ fontFamily: "Barlow", fontWeight: 600 }}
                >
                  {t("events.sort.label")}:
                </label>
                <Select
                  value={sort}
                  onValueChange={(v) => setSort(v as EventSort)}
                >
                  <SelectTrigger
                    id="event-sort-select"
                    className="w-[180px] rounded-lg border-gray-300"
                    data-testid="event-sort-trigger"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_SORTS.map((s) => (
                      <SelectItem
                        key={s}
                        value={s}
                        data-testid={`event-sort-option-${s}`}
                      >
                        {t(`events.sort.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2: chip filters */}
            <div
              className="mt-4 flex flex-wrap"
              style={{ gap: "6px" }}
              role="group"
              aria-label={t("events.filter.label")}
              data-testid="event-filter-chips"
            >
              <Chip
                label={t("events.filter.all")}
                count={counts.get("ALL") ?? 0}
                active={allActive}
                onClick={() => selectChip(null)}
                badge="ALL"
              />
              {CHIP_BADGES.map((b) => (
                <Chip
                  key={b}
                  label={b}
                  count={counts.get(b) ?? 0}
                  active={activeChip === b}
                  onClick={() => selectChip(b)}
                  badge={b}
                />
              ))}
            </div>

            {/* Row 3: results counter */}
            <div
              className="mt-4 pt-3 flex items-center justify-between"
              style={{ borderTop: "1px solid #F0F0F0" }}
            >
              <span style={{ fontFamily: "Barlow", fontSize: "12px", color: "#888888" }}>
                <strong style={{ color: "#1A1A1A", fontWeight: 700 }}>{filteredTotal}</strong>{" "}
                {filteredTotal === 1 ? "evento encontrado" : "eventos encontrados"}
              </span>
              <span style={{ fontFamily: "Barlow", fontSize: "11px", color: "#BBBBBB" }}>
                BJJLF · 2025–2026
              </span>
            </div>
          </div>

          {/* Grid */}
          <EventList
            selectedBadges={badges}
            onChange={setBadges}
            sort={sort}
            query={urlQuery}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            hideFilters
          />
        </div>
      </section>
    </div>
  );
}

function Chip({
  label,
  count,
  active,
  onClick,
  badge,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  badge: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-testid="event-filter-chip"
      data-badge={badge}
      data-active={active}
      className={cn(
        "inline-flex items-center gap-1.5 transition-base focus-ring",
        active
          ? "bg-[#C8211A] text-white border-[#C8211A]"
          : "bg-[#F5F5F5] text-[#555555] border-[#E0E0E0] hover:bg-[#FFF8F8] hover:border-[#C8211A] hover:text-[#C8211A]",
      )}
      style={{
        fontFamily: "Barlow",
        fontWeight: 700,
        fontSize: "12px",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        padding: "6px 14px",
        borderRadius: "20px",
        borderWidth: "1.5px",
        borderStyle: "solid",
        transitionDuration: "150ms",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          background: active ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.10)",
          borderRadius: "10px",
          padding: "1px 6px",
          fontSize: "10px",
          fontWeight: 500,
          letterSpacing: "0",
        }}
      >
        {count}
      </span>
    </button>
  );
}
