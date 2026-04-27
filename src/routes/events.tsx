import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { EventList } from "@/components/EventList";
import { EventFilterPanel } from "@/components/EventFilterPanel";
import { EventBadge } from "@/components/EventBadge";
import { Button } from "@/components/ui/button";
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

const VALID_BADGES: ReadonlyArray<EventTypeBadge> = [
  "GI",
  "NO-GI",
  "GI & NO-GI",
  "KIDS",
  "MASTER",
];

/**
 * Coerce an unknown URL value into a clean EventTypeBadge[].
 * Accepts: undefined, "GI", "GI,NO-GI", or ["GI","MASTER"].
 * Drops any value that isn't a known badge — no crashes on hand-edited URLs.
 */
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

type EventsSearch = { badges: EventTypeBadge[] };

export const Route = createFileRoute("/events")({
  validateSearch: (search: Record<string, unknown>): EventsSearch => ({
    badges: parseBadges(search.badges),
  }),
  head: () => ({
    meta: [
      { title: "Event Calendar — BJJLF" },
      {
        name: "description",
        content:
          "Browse the official BJJLF event calendar. Filter by GI, NO-GI, GI & NO-GI, KIDS, or MASTER divisions.",
      },
      { property: "og:title", content: "Event Calendar — BJJLF" },
      {
        property: "og:description",
        content:
          "Browse the official BJJLF event calendar. Filter by GI, NO-GI, GI & NO-GI, KIDS, or MASTER divisions.",
      },
    ],
  }),
  component: EventsListPage,
});

function EventsListPage() {
  const { t } = useI18n();
  const search = Route.useSearch();
  const badges: EventTypeBadge[] = search.badges;
  const navigate = useNavigate({ from: "/events" });
  const [sheetOpen, setSheetOpen] = useState(false);

  // Restore filters from localStorage on first visit and persist on change.
  // URL is the source of truth during a session; storage seeds the next visit.
  usePersistedEventFilters();

  // Only show chips for badges that actually exist in the data.
  const available = useMemo<ReadonlyArray<EventTypeBadge>>(() => {
    const present = new Set(EVENTS.map((e) => e.badge));
    return VALID_BADGES.filter((b) => present.has(b));
  }, []);

  const setBadges = (next: ReadonlyArray<EventTypeBadge>) =>
    navigate({
      search: () => ({ badges: [...next] }),
      replace: true,
    });

  const toggle = (badge: EventTypeBadge) => {
    const set = new Set(badges);
    if (set.has(badge)) set.delete(badge);
    else set.add(badge);
    setBadges(VALID_BADGES.filter((b) => set.has(b)));
  };

  const clear = () => setBadges([]);

  return (
    <div className="bg-[#F7F9FC] min-h-screen">
      <section className="bg-navbar border-b border-border">
        <div className="container mx-auto px-4 lg:px-6 py-12">
          <p className={cn(typo.heading.kicker, "mb-2")}>BJJLF</p>
          <h1 className={cn(typo.heading.xl, "text-white")}>{t("events.page.title")}</h1>
          <p className={cn(typo.body.lg, "mt-2 text-white/70")}>
            {t("events.page.subtitle")}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 lg:px-6 py-10">
        {/* Two-column layout: persistent sidebar on lg+, sheet trigger below lg. */}
        <div className="grid gap-6 lg:grid-cols-[16rem,1fr] lg:gap-10">
          {/* Desktop sidebar */}
          <aside
            className="hidden lg:block"
            aria-label={t("events.filter.label")}
          >
            <div className="sticky top-24 bg-card border border-border p-5">
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
            {/* Mobile filter trigger + active-filter strip (always visible) */}
            <div className="lg:hidden flex items-center justify-between gap-3">
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outlineRed"
                    size="sm"
                    className="gap-2"
                    data-testid="event-filter-sheet-trigger"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("events.filter.open")}
                    {badges.length > 0 ? (
                      <span
                        className="ml-1 inline-flex h-5 min-w-5 items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold px-1.5"
                        aria-label={`${badges.length} ${t("events.filter.applied")}`}
                      >
                        {badges.length}
                      </span>
                    ) : null}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[85vw] max-w-sm flex flex-col"
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

                  <SheetFooter className="flex-row gap-2 sm:gap-2 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={clear}
                      className="flex-1"
                      disabled={badges.length === 0}
                    >
                      {t("events.empty.clear")}
                    </Button>
                    <Button
                      variant="primary"
                      size="default"
                      onClick={() => setSheetOpen(false)}
                      className="flex-1"
                    >
                      {t("events.filter.done")}
                    </Button>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active-filters strip — visible on every viewport when filters set */}
            {badges.length > 0 ? (
              <div
                className="flex flex-wrap items-center gap-2"
                aria-label={t("events.filter.applied")}
                data-testid="event-active-filters"
              >
                <span className={cn(typo.label.sm, "mr-1")}>
                  {t("events.filter.applied")}:
                </span>
                {badges.map((b: EventTypeBadge) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggle(b)}
                    aria-label={`Remove ${b} filter`}
                    className="transition-base hover:opacity-80 focus-ring rounded-none"
                  >
                    <EventBadge badge={b} variant="inline" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clear}
                  className={cn(
                    typo.button.sm,
                    "ml-1 text-primary hover:text-primary-dark",
                  )}
                >
                  {t("events.empty.clear")}
                </button>
              </div>
            ) : null}

            <EventList
              selectedBadges={badges}
              onChange={setBadges}
              hideFilters
            />
          </div>
        </div>
      </section>
    </div>
  );
}

