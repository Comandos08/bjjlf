/**
 * Admin-side TanStack Query hooks. Unlike the public hooks in `queries.ts`,
 * these talk to the live Supabase backend with no fallback — admins must see
 * the real DB state, including unpublished/inactive rows.
 *
 * Mutations invalidate both the admin query keys and the public query keys
 * (`["events"]`, `["news"]`, etc.) so the public site reflects changes
 * immediately without a hard refresh.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type EventInsert = Database["public"]["Tables"]["events"]["Insert"];
type EventUpdate = Database["public"]["Tables"]["events"]["Update"];

type NewsRow = Database["public"]["Tables"]["news"]["Row"];
type NewsInsert = Database["public"]["Tables"]["news"]["Insert"];
type NewsUpdate = Database["public"]["Tables"]["news"]["Update"];

type RankingRow = Database["public"]["Tables"]["rankings"]["Row"];
type RankingInsert = Database["public"]["Tables"]["rankings"]["Insert"];
type RankingUpdate = Database["public"]["Tables"]["rankings"]["Update"];

type YoutubeRow = Database["public"]["Tables"]["youtube_videos"]["Row"];
type YoutubeInsert = Database["public"]["Tables"]["youtube_videos"]["Insert"];
type YoutubeUpdate = Database["public"]["Tables"]["youtube_videos"]["Update"];

type HeroRow = Database["public"]["Tables"]["hero_slides"]["Row"];
type HeroInsert = Database["public"]["Tables"]["hero_slides"]["Insert"];
type HeroUpdate = Database["public"]["Tables"]["hero_slides"]["Update"];

type BlackBeltRow = Database["public"]["Tables"]["certified_black_belts"]["Row"];
type BlackBeltInsert = Database["public"]["Tables"]["certified_black_belts"]["Insert"];
type BlackBeltUpdate = Database["public"]["Tables"]["certified_black_belts"]["Update"];

type AcademyRow = Database["public"]["Tables"]["affiliated_academies"]["Row"];
type AcademyInsert = Database["public"]["Tables"]["affiliated_academies"]["Insert"];
type AcademyUpdate = Database["public"]["Tables"]["affiliated_academies"]["Update"];

type AdminUserRow = Database["public"]["Tables"]["admin_users"]["Row"];

/* ============================================================
 * Dashboard counts
 * ============================================================ */
export function useDashboardCounts() {
  return useQuery({
    queryKey: ["admin", "dashboard", "counts"],
    queryFn: async () => {
      const [events, news, academies, blackBelts] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase
          .from("news")
          .select("*", { count: "exact", head: true })
          .eq("is_published", true),
        supabase
          .from("affiliated_academies")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("certified_black_belts")
          .select("*", { count: "exact", head: true })
          .eq("is_active", true),
      ]);
      return {
        events: events.count ?? 0,
        news: news.count ?? 0,
        academies: academies.count ?? 0,
        blackBelts: blackBelts.count ?? 0,
      };
    },
  });
}

export function useRecentEvents(limit = 5) {
  return useQuery({
    queryKey: ["admin", "dashboard", "recent-events", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, name_en, name_pt, event_date, status")
        .order("event_date", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRecentNews(limit = 5) {
  return useQuery({
    queryKey: ["admin", "dashboard", "recent-news", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title_en, title_pt, category, is_published, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

/* ============================================================
 * Events CRUD
 * ============================================================ */
export function useAdminEvents() {
  return useQuery<EventRow[]>({
    queryKey: ["admin", "events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpsertEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; values: EventInsert | EventUpdate }) => {
      if (input.id) {
        const { error } = await supabase.from("events").update(input.values).eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("events").insert(input.values as EventInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useToggleEventField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; field: "show_on_home" | "is_featured"; value: boolean }) => {
      const patch: EventUpdate =
        input.field === "show_on_home" ? { show_on_home: input.value } : { is_featured: input.value };
      const { error } = await supabase.from("events").update(patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/* ============================================================
 * Generic helpers — small, repeated patterns
 * ============================================================ */
function makeListHook<TRow>(table: string, key: string, orderBy: { column: string; asc: boolean }) {
  return function useAdminList() {
    return useQuery<TRow[]>({
      queryKey: ["admin", key],
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table as never)
          .select("*")
          .order(orderBy.column, { ascending: orderBy.asc });
        if (error) throw error;
        return (data ?? []) as TRow[];
      },
    });
  };
}

function makeUpsertHook<TInsert, TUpdate>(table: string, key: string, publicKey?: string) {
  return function useUpsert() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: { id?: string; values: TInsert | TUpdate }) => {
        if (input.id) {
          const { error } = await supabase
            .from(table as never)
            .update(input.values as never)
            .eq("id", input.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from(table as never)
            .insert(input.values as never);
          if (error) throw error;
        }
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", key] });
        qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
        if (publicKey) qc.invalidateQueries({ queryKey: [publicKey] });
      },
    });
  };
}

function makeDeleteHook(table: string, key: string, publicKey?: string) {
  return function useDeleteRow() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (id: string) => {
        const { error } = await supabase.from(table as never).delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", key] });
        qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
        if (publicKey) qc.invalidateQueries({ queryKey: [publicKey] });
      },
    });
  };
}

function makeFieldToggleHook<TUpdate extends Record<string, unknown>>(
  table: string,
  key: string,
  publicKey?: string,
) {
  return function useToggleField() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: async (input: { id: string; field: keyof TUpdate; value: boolean }) => {
        const patch = { [input.field]: input.value } as unknown as TUpdate;
        const { error } = await supabase
          .from(table as never)
          .update(patch as never)
          .eq("id", input.id);
        if (error) throw error;
      },
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: ["admin", key] });
        if (publicKey) qc.invalidateQueries({ queryKey: [publicKey] });
      },
    });
  };
}

/* ============================================================
 * News
 * ============================================================ */
export const useAdminNews = makeListHook<NewsRow>("news", "news", { column: "created_at", asc: false });
export const useUpsertNews = makeUpsertHook<NewsInsert, NewsUpdate>("news", "news", "news");
export const useDeleteNews = makeDeleteHook("news", "news", "news");
export const useToggleNewsField = makeFieldToggleHook<NewsUpdate>("news", "news", "news");

/* ============================================================
 * Rankings
 * ============================================================ */
export const useAdminRankings = makeListHook<RankingRow>("rankings", "rankings", { column: "points", asc: false });
export const useUpsertRanking = makeUpsertHook<RankingInsert, RankingUpdate>("rankings", "rankings", "rankings");
export const useDeleteRanking = makeDeleteHook("rankings", "rankings", "rankings");
export const useToggleRankingField = makeFieldToggleHook<RankingUpdate>("rankings", "rankings", "rankings");

export function useRecalcRankings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (filter: {
      season?: string;
      modality?: string;
      gender?: string;
      belt?: string;
      category?: string;
    }) => {
      let q = supabase.from("rankings").select("id, points").eq("is_active", true);
      if (filter.season) q = q.eq("season", filter.season);
      if (filter.modality) q = q.eq("modality", filter.modality);
      if (filter.gender) q = q.eq("gender", filter.gender);
      if (filter.belt) q = q.eq("belt", filter.belt);
      if (filter.category) q = q.eq("category", filter.category);
      const { data, error } = await q.order("points", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      // Update positions sequentially. (Small set; no need for bulk RPC.)
      for (let i = 0; i < rows.length; i++) {
        await supabase.from("rankings").update({ position: i + 1 }).eq("id", rows[i].id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "rankings"] });
      qc.invalidateQueries({ queryKey: ["rankings"] });
    },
  });
}

/* ============================================================
 * YouTube
 * ============================================================ */
export const useAdminYoutube = makeListHook<YoutubeRow>("youtube_videos", "youtube", { column: "display_order", asc: true });
export const useUpsertYoutube = makeUpsertHook<YoutubeInsert, YoutubeUpdate>("youtube_videos", "youtube", "youtube");
export const useDeleteYoutube = makeDeleteHook("youtube_videos", "youtube", "youtube");
export const useToggleYoutubeField = makeFieldToggleHook<YoutubeUpdate>("youtube_videos", "youtube", "youtube");

/* ============================================================
 * Hero slides
 * ============================================================ */
export const useAdminHero = makeListHook<HeroRow>("hero_slides", "hero", { column: "display_order", asc: true });
export const useUpsertHero = makeUpsertHook<HeroInsert, HeroUpdate>("hero_slides", "hero", "hero-slides");
export const useDeleteHero = makeDeleteHook("hero_slides", "hero", "hero-slides");
export const useToggleHeroField = makeFieldToggleHook<HeroUpdate>("hero_slides", "hero", "hero-slides");

/* ============================================================
 * Black belts
 * ============================================================ */
export const useAdminBlackBelts = makeListHook<BlackBeltRow>("certified_black_belts", "black-belts", { column: "certified_at", asc: false });
export const useUpsertBlackBelt = makeUpsertHook<BlackBeltInsert, BlackBeltUpdate>("certified_black_belts", "black-belts", "graduates");
export const useDeleteBlackBelt = makeDeleteHook("certified_black_belts", "black-belts", "graduates");
export const useToggleBlackBeltField = makeFieldToggleHook<BlackBeltUpdate>("certified_black_belts", "black-belts", "graduates");

/* ============================================================
 * Academies
 * ============================================================ */
export const useAdminAcademies = makeListHook<AcademyRow>("affiliated_academies", "academies", { column: "name", asc: true });
export const useUpsertAcademy = makeUpsertHook<AcademyInsert, AcademyUpdate>("affiliated_academies", "academies", "academies");
export const useDeleteAcademy = makeDeleteHook("affiliated_academies", "academies", "academies");
export const useToggleAcademyField = makeFieldToggleHook<AcademyUpdate>("affiliated_academies", "academies", "academies");

/* ============================================================
 * Admin users (settings)
 * ============================================================ */
export function useAdminUsers() {
  return useQuery<AdminUserRow[]>({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleAdminUserActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; value: boolean }) => {
      const { error } = await supabase
        .from("admin_users")
        .update({ is_active: input.value })
        .eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export function useDeleteAdminUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_users").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });
}

export type {
  EventRow,
  NewsRow,
  RankingRow,
  YoutubeRow,
  HeroRow,
  BlackBeltRow,
  AcademyRow,
  AdminUserRow,
};
