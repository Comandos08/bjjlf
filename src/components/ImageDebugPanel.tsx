import { memo, useMemo, useState } from "react";
import type { ImageEntry, ImageRegistryTelemetry } from "@/lib/image-registry";
import { ChevronDown, ChevronUp, RefreshCw, X, Bug } from "lucide-react";
import {
  useImageRegistry,
  clearImageRegistry,
  useImageRegistryTelemetry,
  resetImageRegistryTelemetry,
} from "@/lib/image-registry";

const isDev = import.meta.env.DEV;

/**
 * Floating dev-only panel that lists every <SafeImage> on the page along
 * with its load status. Hidden in production builds.
 */
export function ImageDebugPanel() {
  if (!isDev) return null;
  return <Panel />;
}

function Panel() {
  const entries = useImageRegistry();
  const [open, setOpen] = useState(true);
  const [closed, setClosed] = useState(false);
  const [filter, setFilter] = useState<"all" | "loaded" | "error" | "pending">("all");

  const telemetry = useImageRegistryTelemetry();

  const counts = useMemo(() => {
    const c = { total: entries.length, loaded: 0, error: 0, pending: 0 };
    for (const e of entries) c[e.status] += 1;
    return c;
  }, [entries]);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((e) => e.status === filter)),
    [entries, filter],
  );

  if (closed) {
    return (
      <button
        onClick={() => setClosed(false)}
        aria-label="Open image debug panel"
        className="fixed bottom-4 right-4 z-[9999] grid h-10 w-10 place-items-center rounded-full shadow-lg"
        style={{ background: "#1A1A1A", color: "#B8960C", border: "1px solid #333" }}
      >
        <Bug size={18} />
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex max-h-[70vh] w-[360px] flex-col text-[11px]"
      style={{
        background: "#0F0F0F",
        border: "1px solid #333",
        borderTop: "2px solid #C41E3A",
        color: "#CCCCCC",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between gap-2 px-3 py-2"
        style={{ background: "#1A1A1A", borderBottom: "1px solid #2A2A2A" }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 text-left"
          aria-expanded={open}
        >
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          <span
            className="text-[11px] uppercase tracking-[0.12em]"
            style={{ color: "#B8960C", fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            Image Debug
          </span>
          <Badge label={`${counts.total}`} color="#888" />
          <Badge label={`OK ${counts.loaded}`} color="#22C55E" />
          <Badge label={`ERR ${counts.error}`} color="#EF4444" />
          {counts.pending > 0 && <Badge label={`… ${counts.pending}`} color="#B8960C" />}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={clearImageRegistry}
            aria-label="Reset list"
            className="grid h-6 w-6 place-items-center hover:text-white"
          >
            <RefreshCw size={12} />
          </button>
          <button
            onClick={() => setClosed(true)}
            aria-label="Close panel"
            className="grid h-6 w-6 place-items-center hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {open && (
        <>
          {/* Telemetry strip — memoized so changes elsewhere don't redraw it */}
          <TelemetryStrip telemetry={telemetry} onReset={resetImageRegistryTelemetry} />


          <div className="flex gap-1 px-3 py-2" style={{ borderBottom: "1px solid #2A2A2A" }}>
            {(["all", "loaded", "error", "pending"] as const).map((f) => {
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-2 py-0.5 text-[10px] uppercase tracking-[0.1em] transition-colors"
                  style={{
                    background: active ? "#C41E3A" : "transparent",
                    color: active ? "#FFFFFF" : "#888",
                    border: `1px solid ${active ? "#C41E3A" : "#333"}`,
                    fontFamily: "Barlow Condensed",
                    fontWeight: 700,
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>

          {/* List — memoized; only re-renders when filtered list reference changes */}
          <EntryList entries={filtered} filter={filter} />
        </>
      )}
    </div>
  );
}

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="px-1.5 py-0.5 text-[10px]"
      style={{ background: "#0F0F0F", border: `1px solid ${color}55`, color }}
    >
      {label}
    </span>
  );
}

function StatusPill({ status, ms }: { status: "pending" | "loaded" | "error"; ms?: number }) {
  const map = {
    loaded: { bg: "#22C55E", label: "OK" },
    error: { bg: "#EF4444", label: "ERR" },
    pending: { bg: "#B8960C", label: "…" },
  } as const;
  const { bg, label } = map[status];
  return (
    <span
      className="shrink-0 px-1.5 py-0.5 text-[10px]"
      style={{ background: bg, color: "#0F0F0F", fontWeight: 800 }}
    >
      {label}
      {typeof ms === "number" ? ` ${ms}ms` : ""}
    </span>
  );
}

function shortUrl(url: string) {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 28 ? "…" + u.pathname.slice(-28) : u.pathname;
    return `${u.host}${path}`;
  } catch {
    return url.length > 50 ? url.slice(0, 50) + "…" : url;
  }
}
