/**
 * TanStack Query hooks for Supabase-backed public content.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RANKINGS, type Event, type EventTypeBadge, type Ranked } from "@/data/events";
import { type NewsItem } from "@/data/news";
import { type Academy } from "@/data/academies";
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
        .eq("is_active", true)
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
        name: row.name_pt ?? row.name_en,
        nameEn: row.name_en,
        namePt: row.name_pt ?? row.name_en,
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
        const cat = (row.category ?? "").toLowerCase();
        const category: NewsItem["category"] =
          cat === "tournaments" ? "Tournaments"
          : cat === "promotions" ? "Promotions"
          : cat === "athletes" ? "Athletes"
          : "Federation";

        return {
          id: row.id,
          slug: row.slug,
          title: row.title_en,
          excerpt: row.excerpt_en ?? "",
          titleEn: row.title_en,
          titlePt: row.title_pt ?? row.title_en,
          excerptEn: row.excerpt_en ?? "",
          excerptPt: row.excerpt_pt ?? row.excerpt_en ?? "",
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
        .from("affiliated_academies_view")
        .select("id, name, logo_url, city, state, country, country_flag, professor, athlete_id, approved_at, belt, belt_degree")
        .order("approved_at", { ascending: false, nullsFirst: false });

      if (error) {
        console.error("[useAcademies] Supabase error:", error);
        return [];
      }
      if (!data) return [];

      const athleteIds = Array.from(
        new Set(data.map((r) => r.athlete_id).filter((x): x is string => !!x)),
      );
      const beltMap = new Map<string, { belt: string; degree: number }>();
      if (athleteIds.length > 0) {
        const { data: profs } = await supabase
          .from("athlete_profiles")
          .select("id, belt, degree")
          .in("id", athleteIds);
        for (const p of profs ?? []) beltMap.set(p.id, { belt: p.belt, degree: p.degree });
      }

      return data.map<Academy>((row) => {
        const ts = row.approved_at ? Date.parse(row.approved_at) : 0;
        const name = row.name ?? "Academia";
        const initials =
          name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "AC";
        const beltInfo = row.athlete_id ? beltMap.get(row.athlete_id) : undefined;
        const slug = (row.id ?? name).toString().toLowerCase().replace(/[^a-z0-9]+/g, "-");
        return {
          slug,
          name,
          professor: row.professor ?? "—",
          city: row.city ?? "—",
          state: row.state ?? "—",
          country: row.country ?? "—",
          flag: row.country_flag ?? "🏳️",
          belt: ((beltInfo?.belt ?? row.belt ?? "Preta") as Academy["belt"]),
          degree: beltInfo?.degree ?? row.belt_degree ?? 0,
          since: row.approved_at ? row.approved_at.slice(0, 7) : "",
          sinceTimestamp: Number.isFinite(ts) ? ts : 0,
          initials,
          logoUrl: bustStorageUrl(row.logo_url, row.approved_at) ?? row.logo_url ?? null,
        };
      });
    },
  });
}

/* ---------- hero slides ---------- */

export type HeroSlideData = {
  image: string;
  thumb: string;
  titleEn: string;
  titlePt: string;
  subEn: string;
  subPt: string;
  badge: string;
  tagEn: string | null;
  tagPt: string | null;
  badge1: string | null;
  badge2: string | null;
  ctaPrimaryUrl: string | null;
  ctaSecondaryUrl: string | null;
};

export function useHeroSlides() {
  return useQuery<HeroSlideData[]>({
    queryKey: ["hero_slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) {
        console.error("[useHeroSlides] Supabase error:", error);
        return [];
      }
      if (!data) return [];
      return data.map<HeroSlideData>((row) => {
        const img = bustStorageUrl(resolveAssetUrl(row.image_url), row.created_at) ?? row.image_url;
        return {
          image: img,
          thumb: img,
          titleEn: row.title_en,
          titlePt: row.title_pt,
          subEn: row.subtitle_en ?? "",
          subPt: row.subtitle_pt ?? "",
          badge: row.title_en,
          tagEn: row.tag_en,
          tagPt: row.tag_pt,
          badge1: row.badge1_label,
          badge2: row.badge2_label,
          ctaPrimaryUrl: row.cta_primary_url,
          ctaSecondaryUrl: row.cta_secondary_url,
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
      if (error || !data || data.length === 0) {
        if (error) console.error("[useRankings] Supabase error:", error);
        return RANKINGS;
      }
      const out: Record<string, Ranked[]> = {};
      for (const row of data) {
        const modality = (row.modality ?? "").toLowerCase().includes("no") ? "nogi" : "gi";
        const gender = (row.gender ?? "").toLowerCase().startsWith("f") ? "female" : "male";
        const key = `${gender}-${modality}`;
        (out[key] ??= []).push({
          rank: row.position ?? 0,
          athlete: row.athlete_name,
          country: row.country_code,
          academy: row.academy ?? "—",
          points: row.points,
        });
      }
      return Object.keys(out).length > 0 ? out : RANKINGS;
    },
  });
}

/* ---------- youtube videos ---------- */

export type YouTubeVideoData = {
  youtubeId: string;
  titleEn: string;
  titlePt: string;
  image: string;
  displayOrder: number;
  createdAt: string;
};

export function useYouTubeVideos() {
  return useQuery<YouTubeVideoData[]>({
    queryKey: ["youtube_videos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });
      if (error) {
        console.error("[useYouTubeVideos] Supabase error:", error);
        return [];
      }
      if (!data) return [];
      return data.map<YouTubeVideoData>((row) => ({
        youtubeId: row.youtube_id,
        titleEn: row.title_en,
        titlePt: row.title_pt,
        image: row.thumbnail_url ?? `https://img.youtube.com/vi/${row.youtube_id}/hqdefault.jpg`,
        displayOrder: row.display_order,
        createdAt: row.created_at,
      }));
    },
  });
}
