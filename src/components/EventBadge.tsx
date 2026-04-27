import { cn } from "@/lib/utils";
import { EVENT_BADGE_STYLES, type EventTypeBadge } from "@/data/events";

/**
 * Shared event-type badge (GI / NO-GI / GI & NO-GI / KIDS / MASTER).
 *
 * Single source of truth for badge visuals used across:
 *  - Home page event grid
 *  - Future event list components
 *  - Future event detail pages
 *
 * Variants:
 *  - "overlay" (default): absolute-positioned chip designed to sit on top
 *    of an event card image (top-left corner).
 *  - "inline": flows in normal layout — for headers, detail pages,
 *    breadcrumbs, table cells, etc.
 */
export type EventBadgeProps = {
  badge: EventTypeBadge;
  variant?: "overlay" | "inline";
  className?: string;
};

export function EventBadge({ badge, variant = "overlay", className }: EventBadgeProps) {
  const style = EVENT_BADGE_STYLES[badge];

  return (
    <span
      data-testid="event-badge"
      data-badge={badge}
      className={cn(
        variant === "overlay" && "absolute top-0 left-0",
        "inline-flex items-center",
        className,
      )}
      style={{
        background: style.bg,
        color: style.color,
        padding: "8px 12px",
        fontSize: "10px",
        fontWeight: 700,
        letterSpacing: "0.08em",
        fontFamily: "Barlow Condensed",
        lineHeight: 1,
      }}
    >
      {badge}
    </span>
  );
}
