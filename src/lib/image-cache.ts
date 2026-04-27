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

import { useEffect, useState } from "react";

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
 * React hook variant — generates the bust value **once per component mount on
 * the client**, after hydration. During SSR and the initial client render we
 * return the original URL so the markup matches; the cache-buster is then
 * applied via a post-mount state update (only in dev).
 *
 * Returns the original URL in production.
 */
export function useImageCacheUrl(url: string | undefined): string | undefined {
  const [busted, setBusted] = useState<string | undefined>(url);

  useEffect(() => {
    if (!isDev || !url) {
      setBusted(url);
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setBusted(url);
      return;
    }
    const sep = url.includes("?") ? "&" : "?";
    setBusted(`${url}${sep}v=${Date.now()}`);
  }, [url]);

  return busted;
}
