import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { EventList } from "@/components/EventList";
import { type EventTypeBadge } from "@/data/events";

const VALID_BADGES: ReadonlyArray<EventTypeBadge> = [
  "GI",
  "NO-GI",
  "GI & NO-GI",
  "KIDS",
  "MASTER",
];

/**
 * Coerce an unknown URL value into a clean EventTypeBadge[].
 * Accepts:
 *   - undefined            → []
 *   - "GI"                 → ["GI"]
 *   - "GI,NO-GI"           → ["GI", "NO-GI"]
 *   - ["GI", "MASTER"]     → ["GI", "MASTER"]
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

  // Preserve canonical order + dedupe.
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
  const { badges } = Route.useSearch();
  const navigate = useNavigate({ from: "/events" });

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
        <EventList
          selectedBadges={badges}
          onChange={(next) =>
            navigate({
              search: () => ({ badges: [...next] }),
              replace: true,
            })
          }
        />
      </section>
    </div>
  );
}
