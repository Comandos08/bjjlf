import { useEffect, useRef } from "react";
import { toast } from "sonner";
import heroBlackBeltUrl from "@/assets/hero-3-bjj.jpg";
import heroMundialUrl from "@/assets/hero-1-mundial.jpg";
import newsEuropeanOpenUrl from "@/assets/news-european-open.jpg";

/**
 * Dev-only watcher that tracks the bundled URL of each tracked asset.
 * When Vite re-bundles a file (e.g. you replaced `hero-1-mundial.jpg`),
 * the hashed URL changes — we detect that, log it, and pop a toast so
 * you can validate the new asset is live without guessing.
 *
 * Tracked URLs are persisted in localStorage under `asset-versions:v1`
 * so reloads only fire a toast on real changes, not every mount.
 */
const TRACKED: Record<string, string> = {
  "hero-1-mundial.jpg": heroMundialUrl,
  "hero-3-bjj.jpg": heroBlackBeltUrl,
  "news-european-open.jpg": newsEuropeanOpenUrl,
};

const STORAGE_KEY = "asset-versions:v1";

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
    for (const [file, url] of Object.entries(TRACKED)) {
      if (prev[file] && prev[file] !== url) {
        changed.push(file);
        // eslint-disable-next-line no-console
        console.info(
          `[asset-update] ${file} rebuilt at ${new Date().toLocaleTimeString()}\n  old: ${prev[file]}\n  new: ${url}`,
        );
      }
    }

    if (changed.length > 0) {
      const ts = new Date().toLocaleTimeString();
      toast.success(
        changed.length === 1
          ? `Asset atualizado: ${changed[0]}`
          : `${changed.length} assets atualizados`,
        {
          description: `Rebuild detectado às ${ts}\n${changed.join(", ")}`,
          duration: 8000,
        },
      );
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(TRACKED));
  }, []);

  return null;
}
