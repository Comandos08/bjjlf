import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, X, Zap } from "lucide-react";
import {
  ASSET_CACHE_BUST,
  ASSET_REGISTRY,
  bustedAssetUrl,
} from "@/lib/asset-registry";

/**
 * Dev-only floating panel showing every bundled asset URL and the
 * cache-bust token that was appended. Helps diagnose "why didn't my
 * image update?" without digging through DevTools network tab.
 */
export function AssetCacheBustPanel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setMounted(true);
    // eslint-disable-next-line no-console
    console.info(
      `[asset-cache-bust] token=${ASSET_CACHE_BUST || "(none — production)"}\n` +
        `[asset-cache-bust] tracking ${Object.keys(ASSET_REGISTRY).length} assets`,
    );
    for (const [name, url] of Object.entries(ASSET_REGISTRY)) {
      // eslint-disable-next-line no-console
      console.debug(`[asset-cache-bust] ${name} → ${bustedAssetUrl(url)}`);
    }
  }, []);

  const entries = useMemo(() => {
    const list = Object.entries(ASSET_REGISTRY).map(([name, url]) => ({
      name,
      url: bustedAssetUrl(url),
    }));
    list.sort((a, b) => a.name.localeCompare(b.name));
    if (!filter.trim()) return list;
    const f = filter.toLowerCase();
    return list.filter((e) => e.name.toLowerCase().includes(f));
  }, [filter]);

  if (!import.meta.env.DEV || !mounted || closed) return null;

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
            · {Object.keys(ASSET_REGISTRY).length} assets
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto rounded p-1 hover:bg-muted"
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
          <div className="max-h-80 w-[28rem] max-w-[90vw] overflow-auto p-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="mb-2 w-full rounded border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
            />
            <ul className="space-y-1">
              {entries.map((e) => (
                <li
                  key={e.name}
                  className="flex items-center gap-2 rounded px-1 py-0.5 hover:bg-muted/50"
                >
                  <span className="truncate text-foreground" title={e.name}>
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
                <li className="px-1 py-2 text-center text-muted-foreground">No matches</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
