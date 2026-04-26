import { cn } from "@/lib/utils";
import type { ElementType, ReactNode } from "react";

type Size = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<Size, string> = {
  sm: "text-xl md:text-2xl",
  md: "text-2xl md:text-3xl",
  lg: "text-3xl md:text-4xl lg:text-5xl",
  xl: "text-4xl md:text-5xl lg:text-6xl",
};

export interface SectionHeadingProps {
  /** Small label rendered above the title (e.g. "Newsroom", "Our Federation"). */
  kicker?: ReactNode;
  /** Main heading text — always rendered uppercase. */
  children: ReactNode;
  /** Optional supporting paragraph rendered below the title. */
  description?: ReactNode;
  /** Heading level. Defaults to h2; use h1 for page headings. */
  as?: Extract<ElementType, "h1" | "h2" | "h3">;
  /** Size preset. Defaults to "lg". */
  size?: Size;
  /** Center-align the block. Defaults to false. */
  align?: "left" | "center";
  /** Color the title gold (used over dark hero sections). Defaults to false. */
  gold?: boolean;
  className?: string;
}

/**
 * SectionHeading — single source of truth for section/page titles.
 * Enforces:
 *  - Barlow Condensed (via .font-display)
 *  - UPPERCASE
 *  - tracking-wider (≈0.05em letter-spacing)
 *  - consistent kicker + description spacing
 */
export function SectionHeading({
  kicker,
  children,
  description,
  as = "h2",
  size = "lg",
  align = "left",
  gold = false,
  className,
}: SectionHeadingProps) {
  const Tag = as;
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <div className={cn("max-w-3xl", alignClass, className)}>
      {kicker && (
        <p className="font-heading text-gold text-[11px] md:text-xs tracking-[0.2em] uppercase mb-3">
          {kicker}
        </p>
      )}
      <Tag
        className={cn(
          "font-display uppercase tracking-wider leading-[1.05]",
          sizeClasses[size],
          gold ? "text-gold" : "text-foreground",
        )}
      >
        {children}
      </Tag>
      {description && (
        <p className="mt-4 text-[15px] text-foreground/70 font-sans">
          {description}
        </p>
      )}
    </div>
  );
}
