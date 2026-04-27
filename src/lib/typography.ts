/**
 * Centralized typography tokens — single source of truth for fonts, weights,
 * sizes, casing, and tracking across the app (BJJLF white theme).
 *
 * Rules:
 *  - Section titles (h2): Barlow Condensed 700, UPPERCASE, tracking-wide
 *  - Card titles (h3):    Barlow Condensed 700, UPPERCASE
 *  - News titles:         Barlow Condensed 700, NOT uppercase (use heading.news)
 *  - Body copy:           Barlow 400, line-height 1.7, gray-600
 *  - Labels/badges:       Barlow 600, UPPERCASE, tracking-widest
 *  - Buttons:             Barlow Condensed 700, UPPERCASE, tracking-widest
 *  - Hero h1:             Bebas Neue, tracking-wider
 */

export const typo = {
  /** Display/section/page headings — Barlow Condensed, uppercase. */
  heading: {
    /** Hero — Bebas Neue, big, NOT uppercased (Bebas is naturally caps). */
    xl: "font-display tracking-wider leading-[0.95] text-6xl md:text-7xl lg:text-8xl",
    /** Major section title — text-4xl md:text-5xl. */
    lg: "font-heading uppercase tracking-wide leading-[1.05] text-4xl md:text-5xl",
    /** In-section subtitle. */
    md: "font-heading uppercase tracking-wide leading-tight text-2xl md:text-3xl",
    /** Card / list-item title — uppercase. */
    sm: "font-heading uppercase tracking-wide leading-tight text-xl",
    /** News/article title — NOT uppercase, lighter sentence-case. */
    news: "font-heading tracking-normal leading-tight text-lg",
    /** Tiny eyebrow / kicker label. */
    kicker: "font-sans uppercase tracking-[0.2em] text-[11px] md:text-xs font-bold",
  },

  /** Body copy — Barlow 400. */
  body: {
    lg: "font-sans text-base md:text-lg leading-[1.7] text-gray-600",
    md: "font-sans text-base leading-[1.7] text-gray-600",
    sm: "font-sans text-sm leading-relaxed text-gray-500",
    xs: "font-sans text-xs leading-normal text-gray-400",
  },

  /** Button labels — Barlow Condensed, uppercase, wide tracking. */
  button: {
    lg: "font-heading uppercase tracking-widest font-bold text-sm md:text-base",
    md: "font-heading uppercase tracking-widest font-bold text-sm",
    sm: "font-heading uppercase tracking-widest font-bold text-xs",
  },

  /** Form labels & meta tags — Barlow 600, uppercase. */
  label: {
    md: "font-sans uppercase tracking-widest text-xs font-semibold text-gray-700",
    sm: "font-sans uppercase tracking-widest text-[10px] font-semibold text-gray-500",
  },

  /** Nav links — Barlow 500, sentence case acceptable. */
  nav: {
    link: "font-sans tracking-wide font-medium text-sm",
    sub: "font-sans tracking-wide font-medium text-xs",
  },

  /** Mono — for IDs, certificate numbers, code. */
  mono: {
    sm: "font-mono text-xs",
    md: "font-mono text-sm",
  },
} as const;

export type TypoToken = typeof typo;
