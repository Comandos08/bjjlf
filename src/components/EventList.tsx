import { useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/typography";
import { useI18n, formatDateShort } from "@/lib/i18n";
import { SafeImage } from "@/components/SafeImage";
import { EventBadge } from "@/components/EventBadge";
import {
  EVENTS as DEFAULT_EVENTS,
  type Event,
  type EventTypeBadge,
} from "@/data/events";
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
 * Surfaces:
 *   - /events page (default — shows full catalog with filters)
 *   - Any future "events by venue/season" page can drop this in by passing
 *     its own pre-filtered `events` prop and `availableBadges`.
 *
 * The badge filter chips and per-card badges share the EXACT same color
 * palette via the shared <EventBadge variant="inline" /> — that is the whole
 * point of this component: one source of truth for GI / NO-GI / GI & NO-GI /
 * KIDS / MASTER styling, used in both the filter row AND the cards.
 *
 * Filter state is controlled (via `selectedBadges` + `onChange`) so callers
 * can persist it however they like — local state, URL search params, etc.
 * The /events route wires it to URL search params; embedded usages (e.g. a
 * homepage "Upcoming Events" widget) can use plain useState.
 */

export type EventListProps = {
  /** Events to render. Defaults to the full catalog. */
  events?: ReadonlyArray<Event>;
  /** Which badge filters are currently active. Empty array = show all. */
  selectedBadges: ReadonlyArray<EventTypeBadge>;
  /** Called when the user toggles a filter chip or clears all. */
  onChange: (next: ReadonlyArray<EventTypeBadge>) => void;
  /**
   * Which badge categories to show as filter chips. Defaults to the union
   * of badges actually present in `events` (so we never show an empty
   * category like "KIDS" if no kids events exist).
   */
  availableBadges?: ReadonlyArray<EventTypeBadge>;
  /** Optional grid override. Defaults to 1 / 2 / 3 columns. */
  gridClassName?: string;
  /**
   * Hide the inline filter row. Use when filters are rendered elsewhere
   * (e.g. a sidebar or off-canvas drawer) — the count label still shows.
   */
  hideFilters?: boolean;
  /**
   * Sort order. Defaults to "soonest" (chronological). Callers wiring this
   * to URL search params should pass the parsed value here.
   */
  sort?: EventSort;
  /**
   * Free-text filter applied case-insensitively to event name AND location.
   * Empty/whitespace = no filtering. Callers wiring this to URL search
   * params should pass the parsed value here.
   */
  query?: string;
  /**
   * 1-indexed current page. When omitted, pagination is disabled and ALL
   * filtered results render. Callers wiring this to URL search params should
   * pass `page` + `onPageChange` together.
   */
  page?: number;
  /** Items per page. Defaults to DEFAULT_PER_PAGE. */
  perPage?: number;
  /** Called when the user clicks a paginator button. */
  onPageChange?: (page: number) => void;
  className?: string;
};

const ALL_BADGES: ReadonlyArray<EventTypeBadge> = [
  "GI",
  "NO-GI",
  "GI & NO-GI",
  "KIDS",
  "MASTER",
];

export function EventList({
  events = DEFAULT_EVENTS,
  selectedBadges,
  onChange,
  availableBadges,
  gridClassName,
  hideFilters = false,
  sort = DEFAULT_EVENT_SORT,
  query = "",
  className,
}: EventListProps) {
  const { t, lang } = useI18n();

  // Compute which chips to show. Preserves the canonical ALL_BADGES order
  // so the filter row never reshuffles when the dataset changes.
  const chips = useMemo<ReadonlyArray<EventTypeBadge>>(() => {
    if (availableBadges) return availableBadges;
    const present = new Set(events.map((e) => e.badge));
    return ALL_BADGES.filter((b) => present.has(b));
  }, [events, availableBadges]);

  const filtered = useMemo(() => {
    // 1) Badge filter
    let base =
      selectedBadges.length === 0
        ? events
        : events.filter((e) => new Set(selectedBadges).has(e.badge));

    // 2) Text search — case-insensitive substring on name OR location.
    //    Locale-lowercased so "São" matches "são" for our PT users.
    const q = query.trim().toLocaleLowerCase();
    if (q.length > 0) {
      base = base.filter(
        (e) =>
          e.name.toLocaleLowerCase().includes(q) ||
          e.location.toLocaleLowerCase().includes(q),
      );
    }

    // 3) Sort
    return sortEvents(base, sort);
  }, [events, selectedBadges, sort, query]);

  const toggle = (badge: EventTypeBadge) => {
    const set = new Set(selectedBadges);
    if (set.has(badge)) set.delete(badge);
    else set.add(badge);
    // Preserve canonical order when serializing back out.
    onChange(ALL_BADGES.filter((b) => set.has(b)));
  };

  const clear = () => onChange([]);

  const countLabel =
    filtered.length === 1
      ? t("events.count.one").replace("{n}", "1")
      : t("events.count.many").replace("{n}", String(filtered.length));

  return (
    <div className={cn("space-y-6", className)} data-testid="event-list">
      {/* Filter row (inline). Hidden when caller renders filters elsewhere. */}
      {!hideFilters ? (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn(typo.label.md, "mr-2 shrink-0")}>
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
                  className={cn(
                    "transition-base focus-ring rounded-none",
                    active ? "ring-2 ring-offset-2 ring-offset-background ring-primary" : "opacity-70 hover:opacity-100",
                  )}
                >
                  {/* Reuse the exact same inline badge as the cards — single
                      source of truth for GI/NO-GI/GI&NO-GI/KIDS/MASTER colors. */}
                  <EventBadge badge={badge} variant="inline" />
                </button>
              );
            })}
          </div>

          <span className={cn(typo.label.sm, "shrink-0")}>{countLabel}</span>
        </div>
      ) : (
        <div className="flex items-center justify-end">
          <span className={cn(typo.label.sm)}>{countLabel}</span>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div
          className="border border-dashed border-border bg-card p-10 text-center space-y-3"
          data-testid="event-list-empty"
        >
          <h3 className={typo.heading.sm}>{t("events.empty.title")}</h3>
          <p className={cn(typo.body.sm, "max-w-md mx-auto")}>{t("events.empty.body")}</p>
          <button
            type="button"
            onClick={clear}
            className={cn(
              typo.button.sm,
              "inline-flex items-center gap-1.5 text-primary hover:text-primary-dark",
            )}
          >
            <X className="h-3.5 w-3.5" /> {t("events.empty.clear")}
          </button>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-3.5",
            gridClassName ?? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {filtered.map((e) => (
            <Link
              key={e.id}
              to="/events/$eventId"
              params={{ eventId: e.id }}
              data-testid="event-list-card"
              data-badge={e.badge}
              className="rounded-none bg-white border border-[#E5E5E5] flex flex-col group cursor-pointer hover:border-primary hover:shadow-[0_8px_24px_rgba(196,30,58,0.15)] hover:-translate-y-[3px] no-underline"
              style={{ transition: "all 0.18s ease" }}
            >
              <article className="flex flex-col h-full">
                <div className="relative">
                  <SafeImage
                    src={e.image}
                    alt={`${e.name} — Brazilian Jiu-Jitsu event`}
                    fallbackLabel={e.name}
                    source="event"
                    wrapperClassName="h-40 bg-[#F7F9FC]"
                  />
                  <EventBadge badge={e.badge} />
                </div>
                <div className="p-4 space-y-2.5 flex-1 flex flex-col">
                  <h3
                    className={cn(
                      typo.heading.sm,
                      "text-[#0F0F0F] text-sm leading-tight",
                    )}
                  >
                    {e.name}
                  </h3>
                  <div
                    className={cn(
                      typo.body.xs,
                      "flex items-center gap-1.5 text-[#6B7280]",
                    )}
                  >
                    <Calendar className="h-3.5 w-3.5" /> {formatDateShort(e.date, lang)}
                  </div>
                  <div
                    className={cn(
                      typo.body.xs,
                      "flex items-center gap-1.5 text-[#6B7280]",
                    )}
                  >
                    <MapPin className="h-3.5 w-3.5" /> {e.location}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
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
      className={cn(
        "transition-base focus-ring rounded-none inline-flex items-center",
        active
          ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
          : "opacity-70 hover:opacity-100",
      )}
      style={{
        background: "#2C2C2C",
        color: "#FFFFFF",
        padding: "8px 12px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        fontFamily: "Barlow Condensed",
        lineHeight: 1,
      }}
    >
      {label}
    </button>
  );
}

/** Re-export so consumers don't have to import from data/events directly. */
export { ALL_BADGES };
