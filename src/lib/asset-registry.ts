/**
 * Central registry of every file under `src/assets/` with its bundled URL.
 *
 * Uses Vite's `import.meta.glob(..., { eager: true })` so:
 *   - every asset is discovered automatically (no manual import list to maintain)
 *   - in production each URL is content-hashed by Vite (cache-safe by default)
 *   - in dev we append a session-scoped `?v=<timestamp>` cache-buster so the
 *     browser refetches even if it cached the previous bundle under the same URL
 *
 * Public API:
 *   ASSET_REGISTRY        — { "<filename>": "<bundled url>" }
 *   ASSET_PATH_REGISTRY   — { "/src/assets/<filename>": "<bundled url>" } (DB form)
 *   bustedAssetUrl(url)   — append the dev cache-buster to any URL
 *   resolveAsset(raw)     — DB-style path → bundled URL (null if missing/empty)
 */

type GlobModule = { default: string };

const modules = import.meta.glob<GlobModule>(
  "/src/assets/**/*.{png,jpg,jpeg,gif,svg,webp,avif,ico,pdf,mp4,webm,woff,woff2,ttf,otf}",
  { eager: true },
);

/** "/src/assets/foo/bar.png" → bundled URL */
export const ASSET_PATH_REGISTRY: Record<string, string> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path, mod.default]),
);

/** "bar.png" (basename only) → bundled URL */
export const ASSET_REGISTRY: Record<string, string> = Object.fromEntries(
  Object.entries(ASSET_PATH_REGISTRY).map(([path, url]) => {
    const name = path.split("/").pop() ?? path;
    return [name, url];
  }),
);

const IS_DEV = import.meta.env.DEV || import.meta.env.MODE !== "production";

/**
 * Stable per-session cache-bust token. Recomputed on every full page load,
 * which in dev happens after a Vite restart / HMR full reload — exactly when
 * we want the browser to refetch.
 */
export const ASSET_CACHE_BUST = IS_DEV ? `v=${Date.now()}` : "";

export function bustedAssetUrl(url: string): string {
  if (!ASSET_CACHE_BUST) return url;
  return url + (url.includes("?") ? "&" : "?") + ASSET_CACHE_BUST;
}

/**
 * Resolve a DB-stored path like "/src/assets/foo.jpg" (or a bare basename)
 * to the bundled URL with cache-bust applied. Absolute URLs pass through
 * unchanged. Returns null for empty/missing values.
 */
export function resolveAsset(raw: string | null | undefined): string | null {
  if (!raw || raw.trim() === "") return null;
  const direct = ASSET_PATH_REGISTRY[raw];
  if (direct) return bustedAssetUrl(direct);
  const byName = ASSET_REGISTRY[raw];
  if (byName) return bustedAssetUrl(byName);
  return raw;
}
