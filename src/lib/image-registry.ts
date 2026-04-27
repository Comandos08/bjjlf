import { useSyncExternalStore } from "react";

export type ImageStatus = "pending" | "loaded" | "error";

export type ImageEntry = {
  /** Unique key per <SafeImage> instance (registered URL + auto id). */
  id: string;
  url: string;
  /** Human label so you know which card it is (alt or fallbackLabel). */
  label: string;
  /** Where it's used: 'hero' | 'event' | 'news' | 'video' | 'other'. */
  source: string;
  status: ImageStatus;
  /** ms since registration when the final status arrived. */
  durationMs?: number;
  registeredAt: number;
};

type Listener = () => void;

const entries = new Map<string, ImageEntry>();
const listeners = new Set<Listener>();
let counter = 0;

// Stable empty snapshot. Used by BOTH the server snapshot and the initial
// client snapshot so that the first client render after hydration matches
// what was rendered on the server (an empty list). Without this, the
// registry would already contain entries from synchronous module-level
// effects on the client and React would warn about a hydration mismatch.
const EMPTY_SNAPSHOT: ImageEntry[] = Object.freeze([]) as ImageEntry[];

// Cached snapshot — MUST be a stable reference between emits, otherwise
// useSyncExternalStore will detect a change on every render and trigger an
// infinite update loop in the consuming component. Starts pointing at the
// shared EMPTY_SNAPSHOT so SSR and the first client render agree.
let cachedSnapshot: ImageEntry[] = EMPTY_SNAPSHOT;

function recomputeSnapshot() {
  if (entries.size === 0) {
    // Always collapse back to the shared empty reference so consumers
    // cannot observe two distinct "empty" arrays across renders.
    cachedSnapshot = EMPTY_SNAPSHOT;
    return;
  }
  cachedSnapshot = Array.from(entries.values()).reverse();
}

function emit() {
  recomputeSnapshot();
  for (const l of listeners) l();
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

function getSnapshot(): ImageEntry[] {
  // Return the cached array reference. It is only replaced inside emit(),
  // which is exactly when useSyncExternalStore expects a new value.
  return cachedSnapshot;
}

function getServerSnapshot(): ImageEntry[] {
  // Same stable reference as the initial client snapshot — guarantees the
  // server-rendered HTML and the first client render produce identical
  // output, preventing hydration warnings for the debug panel.
  return EMPTY_SNAPSHOT;
}

/** Allocate a stable id for one image instance. */
export function registerImage(input: { url: string; label: string; source: string }): string {
  const id = `img-${++counter}`;
  entries.set(id, {
    id,
    url: input.url,
    label: input.label,
    source: input.source,
    status: "pending",
    registeredAt: Date.now(),
  });
  emit();
  return id;
}

export function reportImageStatus(id: string, status: "loaded" | "error") {
  const prev = entries.get(id);
  if (!prev || prev.status !== "pending") return;
  entries.set(id, {
    ...prev,
    status,
    durationMs: Date.now() - prev.registeredAt,
  });
  emit();
}

export function unregisterImage(id: string) {
  if (entries.delete(id)) emit();
}

export function clearImageRegistry() {
  entries.clear();
  emit();
}

/** Hook used by the debug panel — reactive snapshot of the registry. */
export function useImageRegistry(): ImageEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
