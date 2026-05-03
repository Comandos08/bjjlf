import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ASSET_REGISTRY, probeAssetSignature } from "@/lib/asset-registry";

/**
 * Dev-only watcher: HEAD-probes every bundled asset and persists a content
 * signature (etag/last-modified/content-length). When a file is replaced
 * the signature changes — we toast + log so you can validate immediately.
 *
 * This works even when Vite keeps serving the asset under the same base
 * URL (e.g. `/src/assets/hero-1.jpg`), which the previous URL-only check
 * could not detect.
 */
const STORAGE_KEY = "asset-versions:v3";

type Snapshot = Record<string, string>; // name -> signature

export function HeroAssetUpdateNotifier() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (ranRef.current) return;
    ranRef.current = true;

    let prev: Snapshot = {};
    try {
      prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      prev = {};
    }

    (async () => {
      const next: Snapshot = {};
      const changed: string[] = [];
      const entries = Object.entries(ASSET_REGISTRY);
      // Probe in parallel — small set (~10s), cheap HEAD requests.
      const sigs = await Promise.all(
        entries.map(([, url]) => probeAssetSignature(url)),
      );
      entries.forEach(([name, url], i) => {
        const sig = sigs[i] ?? `url:${url.split("?")[0]}`;
        next[name] = sig;
        if (prev[name] && prev[name] !== sig) changed.push(name);
      });

      // eslint-disable-next-line no-console
      console.info(
        `[asset-update] probed ${entries.length} assets · ${changed.length} changed`,
      );
      if (changed.length > 0) {
        // eslint-disable-next-line no-console
        console.info(`[asset-update] changed:`, changed);
        const ts = new Date().toLocaleTimeString();
        const preview = changed.slice(0, 5).join(", ");
        const more = changed.length > 5 ? ` (+${changed.length - 5})` : "";
        toast.success(
          changed.length === 1
            ? `Asset atualizado: ${changed[0]}`
            : `${changed.length} assets atualizados`,
          {
            description: `Detectado às ${ts}\n${preview}${more}`,
            duration: 8000,
          },
        );
        // Notify the panel so it can highlight changed entries.
        window.dispatchEvent(
          new CustomEvent("asset-changes", { detail: { changed } }),
        );
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    })();
  }, []);

  return null;
}
