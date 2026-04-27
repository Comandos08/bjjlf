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

export type { EventRow, NewsRow };
