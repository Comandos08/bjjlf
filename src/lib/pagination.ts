/**
 * Tiny pagination helpers shared by /events (and any future paginated list).
 * Pure, framework-free, unit-testable in isolation.
 */

export const DEFAULT_PER_PAGE = 12;
export const ALLOWED_PER_PAGE: ReadonlyArray<number> = [12, 24, 48];
export const MAX_PER_PAGE = 100; // hard cap so a hand-edited URL can't render 10k cards

/**
 * Coerce an unknown URL value into a positive integer page number.
 * Falls back to 1 for missing / malformed values.
 */
export function parsePage(input: unknown): number {
  const n = typeof input === "string" ? Number.parseInt(input, 10) : input;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

/**
 * Coerce an unknown URL value into an allowed perPage value. Anything outside
 * ALLOWED_PER_PAGE (or non-numeric / negative / huge) collapses to the default.
 * Hand-edited values within MAX_PER_PAGE that aren't in the canonical set are
 * accepted as-is (capped) so deep links from older builds keep working.
 */
export function parsePerPage(input: unknown): number {
  const n = typeof input === "string" ? Number.parseInt(input, 10) : input;
  if (typeof n !== "number" || !Number.isFinite(n) || n < 1) {
    return DEFAULT_PER_PAGE;
  }
  return Math.min(Math.floor(n), MAX_PER_PAGE);
}

/** Total page count (>= 1) for `total` items at `perPage` size. */
export function pageCount(total: number, perPage: number): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / perPage));
}

/**
 * Clamp a requested page into the valid [1, pageCount] range. Used to recover
 * gracefully when filters shrink the result set below the current page.
 */
export function clampPage(page: number, total: number, perPage: number): number {
  return Math.min(Math.max(1, page), pageCount(total, perPage));
}

/**
 * Build the visible page-number sequence for a numbered paginator.
 *
 * Rules:
 *   - Always show first + last page
 *   - Show `siblings` pages on each side of the current page
 *   - Insert a single ellipsis ("…") wherever a gap exists
 *
 * Examples (siblings=1):
 *   total=5  current=3 → [1, 2, 3, 4, 5]
 *   total=10 current=1 → [1, 2, 3, "…", 10]
 *   total=10 current=5 → [1, "…", 4, 5, 6, "…", 10]
 *   total=10 current=10 → [1, "…", 8, 9, 10]
 */
export function buildPageList(
  current: number,
  total: number,
  siblings = 1,
): ReadonlyArray<number | "…"> {
  if (total <= 1) return [1];
  // Small enough to render every page: skip the ellipsis logic.
  const maxPlain = siblings * 2 + 5; // first + last + 2*siblings + current + 2 ellipsis slots
  if (total <= maxPlain) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);

  const out: Array<number | "…"> = [1];
  if (left > 2) out.push("…");
  for (let p = left; p <= right; p++) out.push(p);
  if (right < total - 1) out.push("…");
  out.push(total);
  return out;
}
