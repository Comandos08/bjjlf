import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, X, Zap } from "lucide-react";
import {
  ASSET_CACHE_BUST,
  ASSET_REGISTRY,
  bustedAssetUrl,
} from "@/lib/asset-registry";

const STORAGE_KEY = "asset-versions:v2"; // shared with HeroAssetUpdateNotifier

type Entry = { name: string; url: string; changed: boolean };

/**
 * Dev-only floating panel showing every bundled asset URL and the
 * cache-bust token that was appended.
 *
 * Auto-detects assets whose hashed URL changed since the last rebuild
 * (compared against the snapshot persisted by HeroAssetUpdateNotifier in
 * localStorage). When changes are detected the panel auto-opens and the
 * filter switches to "changed only" so you immediately see what moved.
 */
export function AssetCacheBustPanel() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [closed, setClosed] = useState(false);
  const [filter, setFilter] = useState("");
  const [changedOnly, setChangedOnly] = useState(false);
  const [changedSet, setChangedSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMounted(true);

    let prev: Record<string, string> = {};
    try {
      prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      prev = {};
    }

    const changed = new Set<string>();
    for (const [name, url] of Object.entries(ASSET_REGISTRY)) {
      const stripped = url.split("?")[0];
      const prevStripped = prev[name]?.split("?")[0];
      if (prevStripped && prevStripped !== stripped) changed.add(name);
    }
    setChangedSet(changed);

    if (changed.size > 0) {
      setOpen(true);
      setChangedOnly(true);
    }

    // eslint-disable-next-line no-console
    console.info(
      `[asset-cache-bust] token=${ASSET_CACHE_BUST || "(none — production)"}\n` +
        `[asset-cache-bust] tracking ${Object.keys(ASSET_REGISTRY).length} assets · ${changed.size} changed`,
    );
    if (changed.size > 0) {
      // eslint-disable-next-line no-console
      console.info(`[asset-cache-bust] changed: ${[...changed].join(", ")}`);
    }
  }, []);

  const entries: Entry[] = useMemo(() => {
    const list: Entry[] = Object.entries(ASSET_REGISTRY).map(([name, url]) => ({
      name,
      url: bustedAssetUrl(url),
      changed: changedSet.has(name),
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
  }, [filter, changedOnly, changedSet]);

  if (!import.meta.env.DEV || !mounted || closed) return null;

  const changedCount = changedSet.size;

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
          {changedCount > 0 && (
            <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {changedCount} changed
            </span>
          )}
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
                      title="Changed since last rebuild"
                    />
                  )}
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
                <li className="px-1 py-2 text-center text-muted-foreground">
                  {changedOnly ? "Nenhum asset alterado" : "No matches"}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
