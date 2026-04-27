import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { EventBadge } from "@/components/EventBadge";
import { type EventTypeBadge } from "@/data/events";

/**
 * Reusable filter panel for events. Light theme.
 */

export type EventFilterPanelProps = {
  available: ReadonlyArray<EventTypeBadge>;
  selected: ReadonlyArray<EventTypeBadge>;
  onToggle: (badge: EventTypeBadge) => void;
  onClear: () => void;
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
        <h3
          className="text-base uppercase tracking-wide text-gray-900"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          {t("events.filter.label")}
        </h3>
        {selected.length > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#C8211A] hover:text-[#8B1612] transition-base"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
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
                "transition-base focus-ring rounded",
                isVertical && "w-full text-left",
                active
                  ? "ring-2 ring-offset-2 ring-offset-white ring-[#C8211A]"
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
