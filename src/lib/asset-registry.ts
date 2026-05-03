/**
 * Central registry of every file under `src/assets/` with its bundled URL,
 * plus helpers to apply cache-busting to any image URL (local or external).
 *
 * Public API:
 *   ASSET_REGISTRY        — { "<filename>": "<bundled url>" }
 *   ASSET_PATH_REGISTRY   — { "/src/assets/<filename>": "<bundled url>" }
 *   ASSET_CACHE_BUST      — token applied in dev, "" in production
 *   bustedAssetUrl(url)   — append the dev cache-buster to any URL
 *   resolveAsset(raw)     — DB-style path → bundled URL with cache-bust
 *   bustAnyImageUrl(url)  — apply cache-bust to local OR external image URLs
 *   probeAssetSignature() — async HEAD probe to detect content changes
 */

type GlobModule = { default: string };

const modules = import.meta.glob<GlobModule>(
  "/src/assets/**/*.{png,jpg,jpeg,gif,svg,webp,avif,ico,pdf,mp4,webm,woff,woff2,ttf,otf}",
  { eager: true },
);

export const ASSET_PATH_REGISTRY: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path, mod.default]),
);

export const ASSET_REGISTRY: Record<string, string> = Object.fromEntries(
  Object.entries(ASSET_PATH_REGISTRY).map(([path, url]) => {
    const name = path.split("/").pop() ?? path;
    return [name, url];
  }),
);

const IS_DEV = import.meta.env.DEV || import.meta.env.MODE !== "production";

/** Stable per-session cache-bust token (recomputed on every full reload). */
export const ASSET_CACHE_BUST = IS_DEV ? `v=${Date.now()}` : "";

export function bustedAssetUrl(url: string): string {
  if (!ASSET_CACHE_BUST) return url;
  return url + (url.includes("?") ? "&" : "?") + ASSET_CACHE_BUST;
}

/**
 * Apply cache-bust to ANY image URL — local bundled, /src/assets/...
 * paths from the database, or absolute https URLs (e.g. Unsplash). In
 * production this is a no-op so HTTP/CDN caching keeps working.
 */
export function bustAnyImageUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url;
  if (!IS_DEV) return url;
  // data: / blob: are already self-contained; skip them.
  if (/^(data|blob):/i.test(url)) return url;
  return bustedAssetUrl(url);
}

/**
 * Resolve a DB-stored path like "/src/assets/foo.jpg" (or a bare basename)
 * to the bundled URL with cache-bust applied. Absolute URLs are also
 * cache-busted in dev. Returns null for empty/missing values.
 */
export function resolveAsset(raw: string | null | undefined): string | null {
  if (!raw || raw.trim() === "") return null;
  const direct = ASSET_PATH_REGISTRY[raw];
  if (direct) return bustedAssetUrl(direct);
  const byName = ASSET_REGISTRY[raw];
  if (byName) return bustedAssetUrl(byName);
  // Pass-through (likely an external URL) — still bust in dev so the
  // browser refetches if the upstream content changed.
  return bustAnyImageUrl(raw) ?? raw;
}

/**
 * HEAD-probe a local asset URL and return a content signature derived from
 * server headers (etag, last-modified, content-length). This is the only
 * reliable way to detect that a file under src/assets/ was *replaced* in dev,
 * because Vite serves it under the same base path.
 *
 * Returns null on network errors or non-2xx responses.
 */
export async function probeAssetSignature(url: string): Promise<string | null> {
  if (typeof fetch === "undefined") return null;
  try {
    // Strip any existing cache-bust so we don't pollute the URL we probe.
    const clean = url.split("?")[0];
    const res = await fetch(clean, { method: "HEAD", cache: "no-store" });
    if (!res.ok) return null;
    const etag = res.headers.get("etag") ?? "";
    const lm = res.headers.get("last-modified") ?? "";
    const len = res.headers.get("content-length") ?? "";
    return `${etag}|${lm}|${len}`;
  } catch {
    return null;
  }
}
