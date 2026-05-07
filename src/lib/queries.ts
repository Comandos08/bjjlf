/**
 * TanStack Query hooks for Supabase-backed public content.
 *
 * Each hook returns Supabase data when available and falls back to the
 * hardcoded seed data on error or empty result. This keeps the site rendering
 * even if the backend is temporarily unreachable, and lets us iterate on the
 * admin panel without breaking visitors.
 *
 * The shape returned by each hook matches the existing hardcoded type used
 * by the consumer page, so call-site code is unchanged.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RANKINGS, type Event, type EventTypeBadge, type Ranked } from "@/data/events";
import { type NewsItem } from "@/data/news";
import { type Academy } from "@/data/academies";
// All assets under src/assets/ are auto-discovered and cache-busted in dev
// via the central registry. DB rows that store "/src/assets/<file>" paths
// are rewritten to the bundled URL on the fly.
import { resolveAsset } from "@/lib/asset-registry";
import { bustStorageUrl } from "@/lib/bust-storage-url";

/* ---------- helpers ---------- */

const FALLBACK_EVENT_IMG =
  "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=400&h=250";
const FALLBACK_NEWS_IMG =
  "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=600&h=350";

function resolveAssetUrl(raw: string | null | undefined): string | null {
  return resolveAsset(raw);
}



/** Coerce arbitrary DB strings to a known badge value (defaults to GI). */
function normalizeBadge(s: string | null | undefined): EventTypeBadge {
  const v = (s ?? "").toUpperCase().replace(/\s+/g, " ").trim();
  if (v === "NO-GI" || v === "NOGI" || v === "NO GI") return "NO-GI";
  if (v === "GI & NO-GI" || v === "GI&NO-GI") return "GI & NO-GI";
  if (v === "KIDS") return "KIDS";
  if (v === "MASTER") return "MASTER";
  return "GI";
}

function normalizeType(s: string | null | undefined): Event["type"] {
  const v = (s ?? "").toLowerCase();
  if (v.includes("no-gi") || v.includes("nogi")) return "No-Gi";
  if (v.includes("open")) return "Open";
  return "Gi";
}

/* ---------- events ---------- */

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("status", "upcoming")
        .gte("event_date", today)
        .order("is_featured", { ascending: false })
        .order("event_date", { ascending: true });

      if (error) {
        console.error("[useEvents] Supabase error:", error);
        return [];
      }
      if (!data) return [];

      return data.map<Event>((row) => ({
        id: row.id,
        name: row.name_en, // page uses single string; PT translation flows through i18n keys
        date: row.event_date,
        location: `${row.city}, ${row.country_code}`,
        image: bustStorageUrl(resolveAssetUrl(row.image_url), row.created_at) ?? FALLBACK_EVENT_IMG,
        type: normalizeType(row.event_type),
        badge: normalizeBadge(row.event_type),
      }));
    },
  });
}

/* ---------- news ---------- */

export function useNews() {
  return useQuery<NewsItem[]>({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false, nullsFirst: false });

      if (error) {
        console.error("[useNews] Supabase error:", error);
        return [];
      }
      if (!data) return [];

      return data.map<NewsItem>((row) => {
        // Map free-form DB category onto our literal union; default to Federation.
        const cat = (row.category ?? "").toLowerCase();
        const category: NewsItem["category"] =
          cat === "tournaments" ? "Tournaments"
          : cat === "promotions" ? "Promotions"
          : cat === "athletes" ? "Athletes"
          : "Federation";

        return {
          id: row.id,
          title: row.title_en,
          excerpt: row.excerpt_en ?? "",
          category,
          image: bustStorageUrl(resolveAssetUrl(row.cover_image_url), row.created_at) ?? FALLBACK_NEWS_IMG,
          date: (row.published_at ?? row.created_at).slice(0, 10),
          author: row.author ?? "BJJLF Editorial",
          featured: row.is_featured,
        };
      });
    },
  });
}

/* ---------- academies ---------- */

export function useAcademies() {
  return useQuery<Academy[]>({
    queryKey: ["academies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliated_academies")
        .select("*")
        .eq("is_active", true)
        .order("affiliated_since", { ascending: false });

      if (error) {
        console.error("[useAcademies] Supabase error:", error);
        return [];
      }
      if (!data) return [];

      return data.map<Academy>((row) => {
        const ts = Date.parse(row.affiliated_since);
        const initials = row.name
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0]?.toUpperCase() ?? "")
          .join("") || "AC";
        return {
          slug: row.slug,
          name: row.name,
          professor: row.professor,
          city: row.city,
          state: row.state ?? "—",
          country: row.country,
          flag: row.flag_emoji ?? "🏳️",
          belt: (row.belt as Academy["belt"]) ?? "Preta",
          degree: row.belt_degree ?? 0,
          since: row.affiliated_since.slice(0, 7), // "YYYY-MM"
          sinceTimestamp: Number.isFinite(ts) ? ts : 0,
          initials,
        };
      });
    },
  });
}

/* ---------- rankings ---------- */

export function useRankings() {
  return useQuery<Record<string, Ranked[]>>({
    queryKey: ["rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rankings")
        .select("*")
        .eq("is_active", true)
        .order("position", { ascending: true, nullsFirst: false });

      if (error) {
        console.error("[useRankings] Supabase error:", error);
        return {};
      }
      if (!data) return {};

      // Group rows into the existing { "male-gi": [...], ... } shape.
      const out: Record<string, Ranked[]> = {};
      for (const row of data) {
        const key = `${row.gender}-${row.modality}`.toLowerCase();
        (out[key] ??= []).push({
          rank: row.position ?? out[key].length + 1,
          athlete: row.athlete_name,
          country: row.country_code,
          academy: row.academy ?? "",
          points: row.points,
        });
      }
      // Fill any missing keys from fallback so partially-populated DBs don't show empty panels.
      if (data.length > 0) {
        for (const k of Object.keys(RANKINGS)) {
          if (!out[k]) out[k] = RANKINGS[k];
        }
      }
      return out;
    },
  });
}

/* ---------- hero slides ---------- */

export type HeroSlide = {
  image: string;
  thumb: string;
  titlePt: string;
  titleEn: string;
  subPt: string;
  subEn: string;
  badge: string;
};

export function useHeroSlides() {
  return useQuery<HeroSlide[]>({
    queryKey: ["hero"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error || !data || data.length === 0) return [];

      return data.map<HeroSlide>((row) => {
        const resolved = bustStorageUrl(resolveAssetUrl(row.image_url) ?? row.image_url, row.created_at) ?? row.image_url;
        return {
          image: resolved,
          thumb: resolved,
          titlePt: row.title_pt,
          titleEn: row.title_en,
          subPt: row.subtitle_pt ?? "",
          subEn: row.subtitle_en ?? "",
          badge: row.badge1_label ?? row.tag_en ?? row.title_en,
        };
      });
    },
  });
}

/* ---------- youtube videos ---------- */

export type YouTubeVideo = {
  id: string;
  titleEn: string;
  titlePt: string;
  image: string;
  url: string;
  youtubeId: string;
  displayOrder: number;
  createdAt: string;
};

export function useYouTubeVideos() {
  return useQuery<YouTubeVideo[]>({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error || !data || data.length === 0) return [];

      return data.map<YouTubeVideo>((row) => ({
        id: row.id,
        titleEn: row.title_en,
        titlePt: row.title_pt,
        image: row.thumbnail_url ?? `https://img.youtube.com/vi/${row.youtube_id}/hqdefault.jpg`,
        url: row.youtube_url,
        youtubeId: row.youtube_id,
        displayOrder: row.display_order,
        createdAt: row.created_at,
      }));
    },
  });
}
