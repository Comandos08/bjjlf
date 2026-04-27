import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/typography";
import { useI18n } from "@/lib/i18n";
import { EventBadge } from "@/components/EventBadge";
import { type EventTypeBadge } from "@/data/events";

/**
 * Reusable filter panel for events.
 *
 * Identical UI is used in two places on the /events page:
 *   - Desktop (lg+): persistent left sidebar
 *   - Mobile (<lg): inside a slide-in <Sheet>
 *
 * Both paths render this component, so the chip styling, ordering, and
 * keyboard semantics stay identical across viewports. The chips reuse the
 * shared <EventBadge variant="inline" /> for color/typography, keeping a
 * single source of truth for GI / NO-GI / GI & NO-GI / KIDS / MASTER.
 */

export type EventFilterPanelProps = {
  available: ReadonlyArray<EventTypeBadge>;
  selected: ReadonlyArray<EventTypeBadge>;
  onToggle: (badge: EventTypeBadge) => void;
  onClear: () => void;
  /**
   * Layout orientation:
   *   - "vertical" (default) — one chip per row, used in the sidebar/sheet.
   *   - "horizontal" — wraps in a row, useful for compact contexts.
   */
  orientation?: "vertical" | "horizontal";
  className?: string;
};

export function EventFilterPanel({
  available,
  selected,
  onToggle,
  onClear,
  orientation = "vertical",
  className,
}: EventFilterPanelProps) {
  const { t } = useI18n();
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn("space-y-4", className)}
      data-testid="event-filter-panel"
      data-orientation={orientation}
    >
      <div className="flex items-center justify-between">
        <h3 className={cn(typo.heading.sm)}>{t("events.filter.label")}</h3>
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className={cn(
              typo.button.sm,
              "inline-flex items-center gap-1 text-primary hover:text-primary-dark transition-base",
            )}
            data-testid="event-filter-clear"
          >
            <X className="h-3 w-3" /> {t("events.empty.clear")}
          </button>
        ) : null}
      </div>

      <div
        className={cn(
          "flex gap-2",
          isVertical ? "flex-col items-stretch" : "flex-row flex-wrap items-center",
        )}
        role="group"
        aria-label={t("events.filter.label")}
      >
        {available.map((badge) => {
          const active = selected.includes(badge);
          return (
            <button
              key={badge}
              type="button"
              onClick={() => onToggle(badge)}
              aria-pressed={active}
              data-testid="event-filter-chip"
              data-badge={badge}
              data-active={active}
              className={cn(
                "transition-base focus-ring rounded-none",
                isVertical && "w-full text-left",
                active
                  ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                  : "opacity-70 hover:opacity-100",
              )}
            >
              <EventBadge
                badge={badge}
                variant="inline"
                className={cn(isVertical && "w-full justify-center")}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
