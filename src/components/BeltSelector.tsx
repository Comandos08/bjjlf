/**
 * BeltSelector — paired belt + degree selects following IBJJF taxonomy.
 *
 * - When the user changes the belt, the degree options update automatically
 *   and the value is clamped to the first valid value for the new belt.
 * - Renders a small color badge next to each select for visual context.
 * - Uncontrolled-friendly: pass `value`/`onChange` props.
 */
import { useEffect, useId } from "react";
import {
  BELT_DEFS,
  ADULT_BELT_NAMES,
  BELT_NAMES,
  type BeltName,
  degreesForBelt,
  defaultDegreeForBelt,
  formatDegreeLabel,
  getBeltDef,
} from "@/lib/belts-ibjjf";
import { cn } from "@/lib/utils";

type Props = {
  belt: string;
  degree: number;
  onBeltChange: (belt: BeltName) => void;
  onDegreeChange: (degree: number) => void;
  /** Hide kids-only belts (Cinza/Amarela/Laranja/Verde). Default: false. */
  adultOnly?: boolean;
  /** Hide the colored swatches. Default: false. */
  hideSwatch?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Tailwind class for the underlying selects. */
  selectClassName?: string;
  /** Tailwind class for the labels. */
  labelClassName?: string;
  /** Custom labels (defaults: "Faixa" / "Grau"). */
  beltLabel?: string;
  degreeLabel?: string;
  /** Layout: 2-col grid by default. */
  className?: string;
};

const DEFAULT_SELECT =
  "w-full h-11 px-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:border-[#C8211A] focus:ring-1 focus:ring-[#C8211A]";
const DEFAULT_LABEL = "block text-xs uppercase tracking-wider text-gray-500 mb-1.5";

export function BeltSelector({
  belt,
  degree,
  onBeltChange,
  onDegreeChange,
  adultOnly = false,
  hideSwatch = false,
  disabled = false,
  selectClassName,
  labelClassName,
  beltLabel = "Faixa",
  degreeLabel,
  className,
}: Props) {
  const beltId = useId();
  const degreeId = useId();
  const def = getBeltDef(belt);
  const allowed = degreesForBelt(belt);
  const dynamicDegreeLabel = degreeLabel ?? (def?.useDan ? "Grau" : "Grau");

  // Clamp degree to a valid value whenever belt changes.
  useEffect(() => {
    if (!allowed.includes(degree)) {
      onDegreeChange(defaultDegreeForBelt(belt));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [belt]);

  const beltsToShow: BeltName[] = adultOnly ? ADULT_BELT_NAMES : BELT_NAMES;
  const selectCls = cn(selectClassName ?? DEFAULT_SELECT);
  const labelCls = cn(labelClassName ?? DEFAULT_LABEL);

  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div>
        <label htmlFor={beltId} className={labelCls}>{beltLabel}</label>
        <div className="flex items-center gap-2">
          {!hideSwatch && <BeltSwatch belt={belt} />}
          <select
            id={beltId}
            value={belt}
            disabled={disabled}
            onChange={(e) => onBeltChange(e.target.value as BeltName)}
            className={selectCls}
          >
            {beltsToShow.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor={degreeId} className={labelCls}>{dynamicDegreeLabel}</label>
        <select
          id={degreeId}
          value={degree}
          disabled={disabled}
          onChange={(e) => onDegreeChange(Number(e.target.value))}
          className={selectCls}
        >
          {allowed.map((d) => (
            <option key={d} value={d}>
              {(() => {
                const lbl = formatDegreeLabel(belt, d);
                return lbl || "Lisa (sem grau)";
              })()}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function BeltSwatch({ belt, size = 22 }: { belt: string; size?: number }) {
  const def = BELT_DEFS.find((b) => b.name === belt);
  if (!def) return null;
  return (
    <span
      aria-hidden
      className="inline-block rounded-md shrink-0"
      style={{
        width: size,
        height: size,
        background: def.color,
        border: def.border ? `1px solid ${def.border}` : "1px solid rgba(0,0,0,0.08)",
      }}
    />
  );
}
