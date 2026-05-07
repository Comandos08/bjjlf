import { useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, formatDateShort } from "@/lib/i18n";
import { SafeImage } from "@/components/SafeImage";
import { EventBadge } from "@/components/EventBadge";
import {
  type Event,
  type EventTypeBadge,
} from "@/data/events";

/** Sport-style filter chip — design system: only #C8211A. 13px, rounded-[4px]. */
const chipBase =
  "inline-flex items-center rounded-[4px] px-4 py-1.5 uppercase tracking-widest transition-base focus-ring";
const chipInactive =
  "bg-[#F5F5F5] border border-[#C8211A] text-[#C8211A] hover:bg-[#C8211A]/10";
const chipActive =
  "bg-[#C8211A] border border-[#C8211A] text-white";
const chipFontStyle = { fontFamily: "Barlow Condensed", fontSize: "13px" } as const;
import { sortEvents, DEFAULT_EVENT_SORT, type EventSort } from "@/lib/event-sort";
import {
  buildPageList,
  clampPage,
  DEFAULT_PER_PAGE,
  pageCount,
} from "@/lib/pagination";

/**
 * Reusable event list with badge filters.
 *
 * Light theme. Cards: bg-white, border-gray-200, rounded-xl, shadow-sm
 * hover:shadow-md. CTA button is full-width red.
 */

export type EventListProps = {
  events?: ReadonlyArray<Event>;
  selectedBadges: ReadonlyArray<EventTypeBadge>;
  onChange: (next: ReadonlyArray<EventTypeBadge>) => void;
  availableBadges?: ReadonlyArray<EventTypeBadge>;
  gridClassName?: string;
  hideFilters?: boolean;
  sort?: EventSort;
  query?: string;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
  className?: string;
};

const ALL_BADGES: ReadonlyArray<EventTypeBadge> = [
  "GI",
  "NO-GI",
  "GI & NO-GI",
  "KIDS",
  "MASTER",
  "SEMINÁRIO",
  "CURSO",
];

export function EventList({
  events = [],
  selectedBadges,
  onChange,
  availableBadges,
  gridClassName,
  hideFilters = false,
  sort = DEFAULT_EVENT_SORT,
  query = "",
  page,
  perPage = DEFAULT_PER_PAGE,
  onPageChange,
  className,
}: EventListProps) {
  const { t, lang } = useI18n();

  const paginationEnabled = typeof page === "number" && !!onPageChange;

  const chips = useMemo<ReadonlyArray<EventTypeBadge>>(() => {
    if (availableBadges) return availableBadges;
    const present = new Set(events.map((e) => e.badge));
    return ALL_BADGES.filter((b) => present.has(b));
  }, [events, availableBadges]);

  const filtered = useMemo(() => {
    let base =
      selectedBadges.length === 0
        ? events
        : events.filter((e) => new Set(selectedBadges).has(e.badge));

    const q = query.trim().toLocaleLowerCase();
    if (q.length > 0) {
      base = base.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(q) ||
          e.location.toLocaleLowerCase().includes(q),
      );
    }

    return sortEvents(base, sort);
  }, [events, selectedBadges, sort, query]);

  const total = filtered.length;
  const totalPages = pageCount(total, perPage);
  const safePage = clampPage(page ?? 1, total, perPage);
  const visible = paginationEnabled
    ? filtered.slice((safePage - 1) * perPage, safePage * perPage)
    : filtered;

  useEffect(() => {
    if (!paginationEnabled) return;
    if (safePage !== page) onPageChange?.(safePage);
  }, [paginationEnabled, safePage, page, total, onPageChange]);

  const toggle = (badge: EventTypeBadge) => {
    const set = new Set(selectedBadges);
    if (set.has(badge)) set.delete(badge);
    else set.add(badge);
    onChange(ALL_BADGES.filter((b) => set.has(b)));
  };

  const clear = () => onChange([]);

  const countLabel =
    filtered.length === 1
      ? t("events.count.one").replace("{n}", "1")
      : t("events.count.many").replace("{n}", String(filtered.length));

  return (
    <div className={cn("space-y-6", className)} data-testid="event-list">
      {!hideFilters ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="mr-2 shrink-0 text-xs uppercase tracking-widest text-gray-500"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              {t("events.filter.label")}:
            </span>

            <FilterChip
              label={t("events.filter.all")}
              active={selectedBadges.length === 0}
              onClick={clear}
            />

            {chips.map((badge) => {
              const active = selectedBadges.includes(badge);
              return (
                <button
                  key={badge}
                  type="button"
                  onClick={() => toggle(badge)}
                  aria-pressed={active}
                  data-testid="event-filter-chip"
                  data-badge={badge}
                  data-active={active}
                  className={cn(chipBase, active ? chipActive : chipInactive, "font-bold")}
                  style={chipFontStyle}
                >
                  {badge}
                </button>
              );
            })}
          </div>

          <span
            className="shrink-0 text-xs uppercase tracking-widest text-gray-500"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            {countLabel}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <span
            className="text-xs uppercase tracking-widest text-gray-500"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            {countLabel}
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div
          className="bg-white rounded-xl py-16 px-6 text-center flex flex-col items-center justify-center"
          data-testid="event-list-empty"
        >
          <Calendar
            className="text-[#C8211A]"
            style={{ width: 64, height: 64 }}
            aria-hidden
          />
          <h3
            className="mt-5 text-[#1A1A1A]"
            style={{ fontFamily: "Bebas Neue, Barlow Condensed, sans-serif", fontSize: "24px", letterSpacing: "0.04em" }}
          >
            {t("events.empty.title")}
          </h3>
          <p
            className="mt-2 max-w-md mx-auto text-[#666666]"
            style={{ fontFamily: "Barlow", fontSize: "14px", fontWeight: 400, lineHeight: 1.6 }}
          >
            {t("events.empty.body")}
          </p>
          {selectedBadges.length > 0 ? (
            <button
              type="button"
              onClick={clear}
              className="mt-6 inline-flex items-center gap-2 rounded-[4px] bg-[#C8211A] hover:bg-[#8B1612] text-white px-6 py-2.5 uppercase tracking-widest transition-base"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700, fontSize: "13px" }}
            >
              <X className="h-3.5 w-3.5" /> {t("events.empty.clear")}
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6",
            gridClassName ?? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {visible.map((e) => (
            <article
              key={e.id}
              data-testid="event-list-card"
              data-badge={e.badge}
              className="group flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-base overflow-hidden"
            >
              <Link
                to="/events/$eventId"
                params={{ eventId: e.id }}
                search={((prev: unknown) => prev) as never}
                className="block no-underline"
                aria-label={e.name}
              >
                <div className="relative aspect-video">
                  <SafeImage
                    src={e.image}
                    alt={`${e.name} — Brazilian Jiu-Jitsu event`}
                    fallbackLabel={e.name}
                    source="event"
                    wrapperClassName="absolute inset-0 bg-gray-50"
                    className="object-cover w-full h-full"
                  />
                  <EventBadge badge={e.badge} />
                </div>
              </Link>
              <div className="p-5 flex-1 flex flex-col gap-3">
                <Link
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  search={((prev: unknown) => prev) as never}
                  className="no-underline"
                >
                  <h3
                    className="text-xl uppercase text-gray-900 leading-tight hover:text-[#C8211A] transition-base"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    {e.name}
                  </h3>
                </Link>
                <div
                  className="flex items-center gap-1.5 text-sm text-gray-500"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  <Calendar className="h-3.5 w-3.5" /> {formatDateShort(e.date, lang)}
                </div>
                <div
                  className="flex items-center gap-1.5 text-sm text-gray-500"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  <MapPin className="h-3.5 w-3.5" /> {e.location}
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: e.id }}
                    search={((prev: unknown) => prev) as never}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white text-sm uppercase tracking-widest py-3 transition-base no-underline"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    {t("home.events.details")}
                  </Link>
                  <Link
                    to="/register/event/$eventId"
                    params={{ eventId: e.id }}
                    className="w-full inline-flex items-center justify-center rounded-lg border border-[#C8211A] text-[#C8211A] hover:bg-[#C8211A] hover:text-white text-xs uppercase tracking-widest py-2 transition no-underline"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    Inscrever-se
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {paginationEnabled && totalPages > 1 ? (
        <Paginator
          page={safePage}
          totalPages={totalPages}
          onChange={(p) => onPageChange?.(p)}
          labels={{
            prev: t("events.page.prev"),
            next: t("events.page.next"),
            goto: t("events.page.goto"),
            current: t("events.page.current")
              .replace("{n}", String(safePage))
              .replace("{total}", String(totalPages)),
          }}
        />
      ) : null}
    </div>
  );
}

function Paginator({
  page,
  totalPages,
  onChange,
  labels,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  labels: { prev: string; next: string; goto: string; current: string };
}) {
  const items = useMemo(() => buildPageList(page, totalPages, 1), [page, totalPages]);
  const goto = (p: number) => {
    if (p < 1 || p > totalPages || p === page) return;
    onChange(p);
  };

  const baseBtn =
    "inline-flex items-center justify-center h-9 min-w-9 px-3 rounded-md border text-sm transition-base";

  return (
    <nav
      aria-label={labels.current}
      className="flex flex-wrap items-center justify-center gap-1.5 pt-2"
      data-testid="event-pagination"
    >
      <button
        type="button"
        onClick={() => goto(page - 1)}
        disabled={page <= 1}
        aria-label={labels.prev}
        data-testid="event-pagination-prev"
        className={cn(
          baseBtn,
          "gap-1 border-gray-200 bg-white text-gray-700 hover:border-[#C8211A] hover:text-[#C8211A] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700",
        )}
        style={{ fontFamily: "Barlow", fontWeight: 600 }}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{labels.prev}</span>
      </button>

      {items.map((it, i) =>
        it === "…" ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className="inline-flex items-center justify-center h-9 w-9 text-gray-400"
          >
            …
          </span>
        ) : (
          <button
            key={it}
            type="button"
            onClick={() => goto(it)}
            aria-current={it === page ? "page" : undefined}
            aria-label={labels.goto.replace("{n}", String(it))}
            data-testid="event-pagination-page"
            data-page={it}
            data-active={it === page}
            className={cn(
              baseBtn,
              it === page
                ? "bg-[#C8211A] text-white border-[#C8211A]"
                : "border-gray-200 bg-white text-gray-700 hover:border-[#C8211A] hover:text-[#C8211A]",
            )}
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            {it}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => goto(page + 1)}
        disabled={page >= totalPages}
        aria-label={labels.next}
        data-testid="event-pagination-next"
        className={cn(
          baseBtn,
          "gap-1 border-gray-200 bg-white text-gray-700 hover:border-[#C8211A] hover:text-[#C8211A] disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-700",
        )}
        style={{ fontFamily: "Barlow", fontWeight: 600 }}
      >
        <span className="hidden sm:inline">{labels.next}</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      data-testid="event-filter-chip"
      data-badge="ALL"
      data-active={active}
      className={cn(chipBase, active ? chipActive : chipInactive, "font-bold")}
      style={chipFontStyle}
    >
      {label}
    </button>
  );
}

/** Re-export so consumers don't have to import from data/events directly. */
export { ALL_BADGES };
