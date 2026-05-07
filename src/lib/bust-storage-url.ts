/**
 * Cache-busting helper for Supabase Storage URLs.
 *
 * Appends a `t=<timestamp>` query parameter to public Supabase Storage URLs
 * so that re-uploads to the same path bypass the browser cache. Anything
 * that isn't a Supabase Storage URL (external CDN, Unsplash, YouTube
 * thumbnail, blob:, data:, relative path, etc.) is returned unchanged.
 *
 * Runtime guards:
 *   - Accepts arbitrary `unknown` for both args; bad inputs return `null`
 *     for missing url, or pass through unchanged for non-storage urls.
 *   - Falls back to `Date.now()` when `updatedAt` is missing, not a string,
 *     or fails to parse to a finite epoch.
 *   - Never throws.
 */

const STORAGE_MARKER = "/storage/v1/object/public/";

export function bustStorageUrl(
  url: string | null | undefined,
  updatedAt: string | null | undefined,
): string | null {
  // Defensive: reject non-strings rather than blow up downstream.
  if (typeof url !== "string" || url.length === 0) return null;

  // Only touch Supabase Storage public URLs. Everything else (external
  // images, blob:, data:, relative asset paths) passes through untouched.
  if (!url.includes(STORAGE_MARKER)) return url;

  const ts = parseTimestamp(updatedAt);
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}t=${ts}`;
}

function parseTimestamp(updatedAt: unknown): number {
  if (typeof updatedAt === "string" && updatedAt.length > 0) {
    const parsed = new Date(updatedAt).getTime();
    if (Number.isFinite(parsed)) return parsed;
  }
  return Date.now();
}
