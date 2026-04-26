/**
 * One-time, dev-only cleanup that:
 *
 *   1. Unregisters any service worker that was previously installed for this
 *      origin (e.g. by an older preview build or a sibling project on the
 *      same `*.lovable.app` host).
 *   2. Deletes any CacheStorage entries that may be holding stale image
 *      responses (4xx for URLs we now want to load successfully).
 *
 * In production this is a no-op so legitimate SWs keep working.
 */

const isDev = import.meta.env.DEV;

let ran = false;

export function cleanupStaleCaches() {
  if (!isDev || ran) return;
  ran = true;
  if (typeof window === "undefined") return;

  // Service workers
  if ("serviceWorker" in navigator) {
    void navigator.serviceWorker
      .getRegistrations()
      .then((regs) => Promise.all(regs.map((r) => r.unregister())))
      .catch(() => {
        /* noop */
      });
  }

  // Cache storage (used by SW precache, custom fetch handlers, etc.)
  if ("caches" in window) {
    void caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .catch(() => {
        /* noop */
      });
  }
}
