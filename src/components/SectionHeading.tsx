import { cn } from "@/lib/utils";
import { typo } from "@/lib/typography";
import type { ElementType, ReactNode } from "react";

type Size = "sm" | "md" | "lg" | "xl";

const headingSize: Record<Size, string> = {
  sm: typo.heading.sm,
  md: typo.heading.md,
  lg: typo.heading.lg,
  xl: typo.heading.xl,
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
  /** Center-align the block. Defaults to "left". */
  align?: "left" | "center";
  /** Color the title gold (used over dark hero sections). Defaults to false. */
  gold?: boolean;
  className?: string;
}

/**
 * SectionHeading — single source of truth for section/page titles.
 * Pulls every class from the centralized `typo` token map.
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
      {kicker && <p className={cn(typo.heading.kicker, "mb-3")}>{kicker}</p>}
      <Tag className={cn(headingSize[size], gold && "text-gold")}>{children}</Tag>
      {description && <p className={cn(typo.body.md, "mt-4")}>{description}</p>}
    </div>
  );
}
