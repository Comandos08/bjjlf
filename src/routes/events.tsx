import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { EventList } from "@/components/EventList";
import { EventFilterPanel } from "@/components/EventFilterPanel";
import { EventBadge } from "@/components/EventBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EVENTS, type EventTypeBadge } from "@/data/events";
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
  const [sheetOpen, setSheetOpen] = useState(false);

  const [queryInput, setQueryInput] = useState(urlQuery);
  useEffect(() => {
    setQueryInput(urlQuery);
  }, [urlQuery]);

  usePersistedEventFilters();

  const available = useMemo<ReadonlyArray<EventTypeBadge>>(() => {
    const present = new Set(EVENTS.map((e) => e.badge));
    return VALID_BADGES.filter((b) => present.has(b));
  }, []);

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

  const toggle = (badge: EventTypeBadge) => {
    const set = new Set(badges);
    if (set.has(badge)) set.delete(badge);
    else set.add(badge);
    setBadges(VALID_BADGES.filter((b) => set.has(b)));
  };

  const clear = () => setBadges([]);

  const clearQuery = () => {
    setQueryInput("");
    setQuery("");
  };

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

      {/* Sticky white toolbar */}
      <div
        className="sticky z-40 bg-white border-b border-gray-200"
        style={{ top: "64px" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search */}
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

          {/* Mobile filter trigger */}
          <div className="lg:hidden">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outlineRed"
                  size="sm"
                  className="gap-2 rounded-lg"
                  data-testid="event-filter-sheet-trigger"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {t("events.filter.open")}
                  {badges.length > 0 ? (
                    <span
                      className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded bg-[#C8211A] text-white text-[10px] font-bold px-1.5"
                      aria-label={`${badges.length} ${t("events.filter.applied")}`}
                    >
                      {badges.length}
                    </span>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[85vw] max-w-sm flex flex-col bg-white"
              >
                <SheetHeader className="text-left">
                  <SheetTitle>{t("events.filter.label")}</SheetTitle>
                  <SheetDescription>{t("events.page.subtitle")}</SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-6">
                  <EventFilterPanel
                    available={available}
                    selected={badges}
                    onToggle={toggle}
                    onClear={clear}
                    orientation="vertical"
                  />
                </div>

                <SheetFooter className="flex-row gap-2 sm:gap-2 border-t border-gray-200 pt-4">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={clear}
                    className="flex-1 rounded-lg"
                    disabled={badges.length === 0}
                  >
                    {t("events.empty.clear")}
                  </Button>
                  <Button
                    variant="primary"
                    size="default"
                    onClick={() => setSheetOpen(false)}
                    className="flex-1 rounded-lg"
                  >
                    {t("events.filter.done")}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>

          {/* Sort */}
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
      </div>

      {/* Grid section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid gap-6 lg:grid-cols-[16rem,1fr] lg:gap-10">
            {/* Desktop sidebar */}
            <aside
              className="hidden lg:block"
              aria-label={t("events.filter.label")}
            >
              <div className="sticky top-32 bg-white border border-gray-200 rounded-xl shadow-sm p-5">
                <EventFilterPanel
                  available={available}
                  selected={badges}
                  onToggle={toggle}
                  onClear={clear}
                  orientation="vertical"
                />
              </div>
            </aside>

            {/* Main column */}
            <div className="space-y-4 min-w-0">
              {/* Active filters strip */}
              {badges.length > 0 ? (
                <div
                  className="flex flex-wrap items-center gap-2"
                  aria-label={t("events.filter.applied")}
                  data-testid="event-active-filters"
                >
                  <span
                    className="mr-1 text-xs uppercase tracking-widest text-gray-500"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    {t("events.filter.applied")}:
                  </span>
                  {badges.map((b: EventTypeBadge) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => toggle(b)}
                      aria-label={`Remove ${b} filter`}
                      className={cn(
                        "transition-base hover:opacity-80 focus-ring rounded",
                      )}
                    >
                      <EventBadge badge={b} variant="inline" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clear}
                    className="ml-1 inline-flex items-center gap-1 text-sm tracking-wide text-[#C8211A] hover:text-[#8B1612] transition-base"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    {t("events.empty.clear")}
                  </button>
                </div>
              ) : null}

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
          </div>
        </div>
      </section>
    </div>
  );
}
