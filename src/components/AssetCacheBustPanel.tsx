import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, RefreshCw, X, Zap } from "lucide-react";
import {
  ASSET_CACHE_BUST,
  ASSET_REGISTRY,
  bustedAssetUrl,
  probeAssetSignature,
} from "@/lib/asset-registry";

const STORAGE_KEY = "asset-versions:v3";

type Entry = { name: string; url: string; changed: boolean; sig: string | null };

/**
 * Dev-only floating panel showing every bundled asset URL, the cache-bust
 * token applied, and which assets changed since the last probe.
 *
 * Detection uses HEAD probes (etag/last-modified/content-length) — works
 * even when Vite serves the asset under the same `/src/assets/...` URL.
 */
export function AssetCacheBustPanel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  const [filter, setFilter] = useState("");
  const [changedOnly, setChangedOnly] = useState(false);
  const [changedSet, setChangedSet] = useState<Set<string>>(new Set());
  const [sigs, setSigs] = useState<Record<string, string | null>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    let prev: Record<string, string> = {};
    try {
      prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      prev = {};
    }

    let cancelled = false;
    (async () => {
      const entries = Object.entries(ASSET_REGISTRY);
      const probed = await Promise.all(
        entries.map(([, url]) => probeAssetSignature(url)),
      );
      if (cancelled) return;
      const sigMap: Record<string, string | null> = {};
      const changed = new Set<string>();
      entries.forEach(([name, url], i) => {
        const sig = probed[i] ?? `url:${url.split("?")[0]}`;
        sigMap[name] = probed[i];
        if (prev[name] && prev[name] !== sig) changed.add(name);
      });
      setSigs(sigMap);
      setChangedSet(changed);
      if (changed.size > 0) {
        setOpen(true);
        setChangedOnly(true);
      }
      // eslint-disable-next-line no-console
      console.info(
        `[asset-cache-bust] token=${ASSET_CACHE_BUST || "(none — production)"} · ` +
          `tracking ${entries.length} assets · ${changed.size} changed`,
      );
    })();

    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as { changed?: string[] };
      if (detail?.changed?.length) {
        setChangedSet(new Set(detail.changed));
        setOpen(true);
        setChangedOnly(true);
      }
    };
    window.addEventListener("asset-changes", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("asset-changes", onChange);
    };
  }, [refreshKey]);

  const entries: Entry[] = useMemo(() => {
    const list: Entry[] = Object.entries(ASSET_REGISTRY).map(([name, url]) => ({
      name,
      url: bustedAssetUrl(url),
      changed: changedSet.has(name),
      sig: sigs[name] ?? null,
    }));
    list.sort((a, b) => {
      if (a.changed !== b.changed) return a.changed ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
    let out = list;
    if (changedOnly) out = out.filter((e) => e.changed);
    if (filter.trim()) {
      const f = filter.toLowerCase();
      out = out.filter((e) => e.name.toLowerCase().includes(f));
    }
    return out;
  }, [filter, changedOnly, changedSet, sigs]);

  if (!import.meta.env.DEV || !mounted || closed) return null;

  const changedCount = changedSet.size;
  const probedCount = Object.values(sigs).filter((s) => s !== null).length;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] font-mono text-xs">
      <div className="rounded border border-border bg-background/95 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold">cache-bust</span>
          <code className="rounded bg-muted px-1.5 py-0.5 text-[10px]">
            {ASSET_CACHE_BUST || "(prod)"}
          </code>
          <span className="text-muted-foreground">
            · {Object.keys(ASSET_REGISTRY).length} assets · probed {probedCount}
          </span>
          {changedCount > 0 && (
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {changedCount} changed
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY);
              setChangedSet(new Set());
              setRefreshKey((k) => k + 1);
            }}
            className="ml-auto rounded p-1 hover:bg-muted"
            title="Reset snapshot & re-probe"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded p-1 hover:bg-muted"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => setClosed(true)}
            className="rounded p-1 hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {open && (
          <div className="max-h-80 w-[30rem] max-w-[90vw] overflow-auto p-2">
            <div className="mb-2 flex items-center gap-2">
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter…"
                className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
              />
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={changedOnly}
                  onChange={(e) => setChangedOnly(e.target.checked)}
                />
                changed only
              </label>
            </div>
            <ul className="space-y-1">
              {entries.map((e) => (
                <li
                  key={e.name}
                  className={`flex items-center gap-2 rounded px-1 py-0.5 hover:bg-muted/50 ${
                    e.changed ? "bg-primary/5" : ""
                  }`}
                >
                  {e.changed && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                      title="Changed since last snapshot"
                    />
                  )}
                  <span className="truncate text-foreground" title={`${e.name}\nsig: ${e.sig ?? "(no headers)"}`}>
                    {e.name}
                  </span>
                  <code
                    className="ml-auto truncate text-[10px] text-muted-foreground"
                    title={e.url}
                  >
                    {e.url}
                  </code>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(e.url)}
                    className="rounded p-1 hover:bg-muted"
                    aria-label="Copy URL"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </li>
              ))}
              {entries.length === 0 && (
                <li className="px-1 py-2 text-center text-muted-foreground">
                  {changedOnly ? "Nenhum asset alterado" : "No matches"}
                </li>
              )}
            </ul>
            {probedCount === 0 && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                Não foi possível ler headers via HEAD — detecção de mudanças
                pode ficar limitada à URL.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
