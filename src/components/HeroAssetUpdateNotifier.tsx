import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ASSET_REGISTRY } from "@/lib/asset-registry";

/**
 * Dev-only watcher that tracks the bundled URL of EVERY file under src/assets/.
 * When Vite re-bundles a file (e.g. you replaced an image), the hashed URL
 * changes — we detect that, log it, and pop a toast so you can validate the
 * new asset is live without guessing.
 *
 * Tracked URLs are persisted in localStorage so reloads only fire a toast on
 * real changes, not every mount.
 */
const STORAGE_KEY = "asset-versions:v2";

export function HeroAssetUpdateNotifier() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    if (ranRef.current) return;
    ranRef.current = true;

    let prev: Record<string, string> = {};
    try {
      prev = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    } catch {
      prev = {};
    }

    const changed: string[] = [];
    for (const [file, url] of Object.entries(ASSET_REGISTRY)) {
      // Strip the cache-bust query when comparing so a fresh session doesn't
      // mark every asset as "changed" just because the timestamp rotated.
      const stripped = url.split("?")[0];
      const prevStripped = prev[file]?.split("?")[0];
      if (prevStripped && prevStripped !== stripped) {
        changed.push(file);
        // eslint-disable-next-line no-console
        console.info(
          `[asset-update] ${file} rebuilt at ${new Date().toLocaleTimeString()}\n  old: ${prev[file]}\n  new: ${url}`,
        );
      }
    }

    if (changed.length > 0) {
      const ts = new Date().toLocaleTimeString();
      const preview = changed.slice(0, 5).join(", ");
      const more = changed.length > 5 ? ` (+${changed.length - 5})` : "";
      toast.success(
        changed.length === 1
          ? `Asset atualizado: ${changed[0]}`
          : `${changed.length} assets atualizados`,
        {
          description: `Rebuild detectado às ${ts}\n${preview}${more}`,
          duration: 8000,
        },
      );
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(ASSET_REGISTRY));
  }, []);

  return null;
}
