/**
 * Image URL cache helpers.
 *
 * Two goals:
 *
 * 1. **Production**: keep URLs stable so the browser HTTP cache and any CDN
 *    (Cloudflare, Unsplash imgix) can serve them with long-lived caching.
 *    We do NOT append cache-busters in prod — that would defeat the cache
 *    and force a re-download on every page view.
 *
 * 2. **Dev preview**: when image URLs change between iterations, the browser
 *    can keep serving a previously-failed (404) response from its own cache
 *    or from the disk cache, so a card that is now valid still shows broken.
 *    To fix that we append a per-session cache-busting query parameter only
 *    in dev. The bust value is generated once at module load, so a single
 *    page-load reuses cached responses (still fast), but a hard refresh or a
 *    new dev session forces a fresh fetch.
 */

const isDev = import.meta.env.DEV;

// One bust token per dev session. Stable across renders, fresh per reload.
const BUST = isDev ? `_lovable=${Date.now().toString(36)}` : "";

/**
 * Return a cache-aware variant of an image URL.
 * - In production: returned unchanged so HTTP/CDN caching works normally.
 * - In dev: appends a per-session query param to bypass stale browser cache.
 *
 * Safe to call with relative URLs, data: URLs, blob: URLs, and bundled
 * asset URLs (e.g. imported via `import x from "@/assets/x.jpg"`).
 */
export function withImageCache(url: string | undefined): string | undefined {
  if (!url) return url;
  if (!isDev) return url;
  // Don't touch non-http(s) URLs (data:, blob:, bundled asset hashes are
  // already content-addressed and don't need busting).
  if (!/^https?:\/\//i.test(url)) return url;
  return url.includes("?") ? `${url}&${BUST}` : `${url}?${BUST}`;
}
