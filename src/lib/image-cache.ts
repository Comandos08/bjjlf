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
 *    can keep serving a previously-failed (404) response from its own cache.
 *    To fix that we append a cache-busting query param only in dev.
 */

import { useMemo } from "react";

const isDev = import.meta.env.DEV;

/**
 * Plain helper — uses a per-call timestamp as the bust value.
 * Useful outside React (e.g. background fetches, debug logs).
 *
 * - Production: returned unchanged.
 * - Dev: appends `&v=<timestamp>` (or `?v=<timestamp>`).
 *
 * Skips data:/blob:/relative URLs (bundled assets are already
 * content-addressed and don't need busting).
 */
export function withImageCache(url: string | undefined): string | undefined {
  if (!url) return url;
  if (!isDev) return url;
  if (!/^https?:\/\//i.test(url)) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${Date.now()}`;
}

/**
 * React hook variant — generates the bust value **once per component mount**
 * (and only when the URL changes), so:
 *
 *   - Each card refreshes its image every time it mounts (e.g. you navigate
 *     away and back, or the component is conditionally remounted).
 *   - Re-renders within the same mount keep the same URL, so React doesn't
 *     thrash the browser into re-downloading on every state change.
 *
 * Returns the original URL in production.
 */
export function useImageCacheUrl(url: string | undefined): string | undefined {
  return useMemo(() => {
    if (!url) return url;
    if (!isDev) return url;
    if (!/^https?:\/\//i.test(url)) return url;
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}v=${Date.now()}`;
  }, [url]);
}
