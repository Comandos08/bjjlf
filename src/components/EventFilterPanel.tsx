import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { type EventTypeBadge } from "@/data/events";

const chipBase =
  "inline-flex items-center justify-center rounded-[4px] px-4 py-1.5 uppercase tracking-widest transition-base focus-ring font-bold";
const chipInactive =
  "bg-[#F5F5F5] border border-[#C8211A] text-[#C8211A] hover:bg-[#C8211A]/10";
const chipActive =
  "bg-[#C8211A] border border-[#C8211A] text-white";
const chipFontStyle = { fontFamily: "Barlow Condensed", fontSize: "13px" } as const;

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
                chipBase,
                active ? chipActive : chipInactive,
                isVertical && "w-full",
              )}
              style={chipFontStyle}
            >
              {badge}
            </button>
          );
        })}
      </div>
    </div>
  );
}
