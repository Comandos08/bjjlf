import { useEffect, useRef } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { type EventTypeBadge } from "@/data/events";

/**
 * localStorage key for persisted /events filter selection.
 * Versioned so we can invalidate stored shape if the badge enum changes.
 */
const STORAGE_KEY = "bjjlf:events:filters:v1";

const VALID_BADGES: ReadonlyArray<EventTypeBadge> = [
  "GI",
  "NO-GI",
  "GI & NO-GI",
  "KIDS",
  "MASTER",
];

/**
 * Read persisted filters from localStorage. Returns [] for any of:
 *   - SSR (no window)
 *   - missing / unreadable key
 *   - malformed JSON
 *   - any badge in the stored array that is no longer valid
 *
 * Always returns badges in the canonical VALID_BADGES order so the
 * URL serialization stays stable.
 */
export function readPersistedBadges(): EventTypeBadge[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const set = new Set(
      parsed.filter((v): v is EventTypeBadge =>
        typeof v === "string" && (VALID_BADGES as readonly string[]).includes(v),
      ),
    );
    return VALID_BADGES.filter((b) => set.has(b));
  } catch {
    return [];
  }
}

/** Write the badge selection to localStorage. Silently no-ops on failure. */
export function writePersistedBadges(badges: ReadonlyArray<EventTypeBadge>): void {
  if (typeof window === "undefined") return;
  try {
    if (badges.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(badges));
    }
  } catch {
    // Quota exceeded, privacy mode, etc. — non-fatal.
  }
}

/**
 * Sync the /events route's URL `?badges=` param with localStorage.
 *
 * Behavior:
 *   1. On first mount, IF the URL has no badges set AND localStorage has
 *      a saved selection, restore it via `navigate({ search, replace: true })`.
 *      This keeps the back stack clean.
 *   2. Whenever the URL `badges` change, write them to localStorage so the
 *      next visit (even from a fresh tab) sees the same selection.
 *
 * The URL stays the source of truth during a session — localStorage is just
 * the seed for the *next* visit. This avoids loops and respects deep links
 * (a shared `/events?badges=GI` URL is honored as-is, not overwritten).
 */
export function usePersistedEventFilters() {
  const search = useSearch({ from: "/events" });
  const badges: EventTypeBadge[] = search.badges;
  const navigate = useNavigate({ from: "/events" });
  const hydratedRef = useRef(false);

  // 1) Hydrate from localStorage once, only if URL has no filters.
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (badges.length > 0) return; // URL wins on deep links.
    const stored = readPersistedBadges();
    if (stored.length === 0) return;

    navigate({
      // Reducer must return the FULL search shape declared by validateSearch
      // on /events. Preserve everything except `badges` from prev.
      search: (prev) => ({ ...prev, badges: stored }),
      replace: true,
    });
    // We intentionally don't depend on `badges` here — we only want to run
    // this restore on the very first mount. Subsequent navigations are
    // handled by the write effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Persist on every change.
  useEffect(() => {
    writePersistedBadges(badges);
  }, [badges]);
}
