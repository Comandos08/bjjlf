/**
 * Centralized typography tokens — single source of truth for fonts, weights,
 * sizes, casing, and tracking across the app.
 *
 * Rules enforced:
 *  - All headings/nav/buttons → Barlow Condensed (font-display)
 *  - All body/labels/meta    → DM Sans (font-sans, the default)
 *  - All section titles      → UPPERCASE + tracking-wider
 *  - All buttons & labels    → UPPERCASE + tracking-[0.08em]
 *
 * Usage:
 *   import { typo } from "@/lib/typography";
 *   <h2 className={typo.heading.lg}>...</h2>
 *   <button className={typo.button.md}>...</button>
 *   <span className={typo.label.sm}>...</span>
 */

export const typo = {
  /** Display/section/page headings — Barlow Condensed, uppercase, wider tracking. */
  heading: {
    /** Hero / page title (e.g. <h1>). */
    xl: "font-display uppercase tracking-wider leading-[0.95] text-4xl md:text-5xl lg:text-6xl",
    /** Major section title. */
    lg: "font-display uppercase tracking-wider leading-[1.05] text-3xl md:text-4xl lg:text-5xl",
    /** In-section subtitle. */
    md: "font-display uppercase tracking-wider leading-tight text-2xl md:text-3xl",
    /** Card / list-item title. */
    sm: "font-display uppercase tracking-wider leading-tight text-xl md:text-2xl",
    /** Tiny eyebrow / kicker label. */
    kicker: "font-heading text-gold uppercase tracking-[0.2em] text-[11px] md:text-xs",
  },

  /** Body copy — DM Sans. */
  body: {
    lg: "font-sans text-base md:text-lg leading-relaxed text-foreground/80",
    md: "font-sans text-[15px] leading-relaxed text-foreground/70",
    sm: "font-sans text-sm leading-relaxed text-foreground/70",
    xs: "font-sans text-xs leading-normal text-foreground/60",
  },

  /** Button labels — Barlow Condensed, uppercase, tight tracking. */
  button: {
    lg: "font-heading uppercase tracking-[0.08em] font-bold text-sm md:text-base",
    md: "font-heading uppercase tracking-[0.08em] font-bold text-xs md:text-sm",
    sm: "font-heading uppercase tracking-[0.08em] font-bold text-[11px]",
  },

  /** Form labels & meta tags — DM Sans, uppercase, micro tracking. */
  label: {
    /** Standard form-field label. */
    md: "font-sans uppercase tracking-[0.06em] text-[11px] font-semibold text-foreground/80",
    /** Tiny meta (date · author, key/value, badges). */
    sm: "font-sans uppercase tracking-[0.1em] text-[10px] font-semibold text-muted-foreground",
  },

  /** Nav links — Barlow Condensed, heaviest weight, uppercase. */
  nav: {
    link: "font-heading uppercase tracking-[0.08em] font-black text-sm",
    sub: "font-heading uppercase tracking-[0.06em] font-semibold text-xs",
  },

  /** Mono — for IDs, certificate numbers, code. */
  mono: {
    sm: "font-mono text-xs",
    md: "font-mono text-sm",
  },
} as const;

export type TypoToken = typeof typo;
