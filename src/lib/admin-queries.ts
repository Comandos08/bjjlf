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

type BenefitRow = Database["public"]["Tables"]["member_benefits"]["Row"];
type BenefitInsert = Database["public"]["Tables"]["member_benefits"]["Insert"];
type BenefitUpdate = Database["public"]["Tables"]["member_benefits"]["Update"];

/* ============================================================
 * Dashboard counts
 * ============================================================ */
export function useDashboardCounts() {
  return useQuery({
    queryKey: ["admin", "dashboard", "counts"],
    queryFn: async () => {
      const now = new Date();
      const in30 = new Date(now); in30.setDate(now.getDate() + 30);
      const todayISO = now.toISOString().slice(0, 10);
      const in30ISO = in30.toISOString().slice(0, 10);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      const [
        events, news, academies, blackBelts,
        athletesActive, athletesPending, athletesSuspended,
        permitsActive, permitsExpiring, permitsExpired,
        regsPending, regsConfirmed, regsCancelled,
        eventsNext30, monthRegs, monthPermits,
      ] = await Promise.all([
        supabase.from("events").select("*", { count: "exact", head: true }),
        supabase.from("news").select("*", { count: "exact", head: true }).eq("is_published", true),
        supabase.from("affiliated_academies").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("certified_black_belts").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("athlete_profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("athlete_profiles").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("athlete_profiles").select("*", { count: "exact", head: true }).eq("status", "suspended"),
        supabase.from("academy_permits").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("academy_permits").select("*", { count: "exact", head: true }).eq("status", "active").gte("expires_at", todayISO).lte("expires_at", in30ISO),
        supabase.from("academy_permits").select("*", { count: "exact", head: true }).lt("expires_at", todayISO),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("status", "pending_payment").gte("created_at", monthStart),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("status", "confirmed").gte("created_at", monthStart),
        supabase.from("event_registrations").select("*", { count: "exact", head: true }).eq("status", "cancelled").gte("created_at", monthStart),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("event_date", todayISO).lte("event_date", in30ISO),
        supabase.from("event_registrations").select("amount_cents").eq("status", "confirmed").gte("created_at", monthStart),
        supabase.from("academy_permits").select("amount_cents").eq("status", "active").gte("paid_at", monthStart),
      ]);

      const monthRevenue =
        (monthRegs.data ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0) +
        (monthPermits.data ?? []).reduce((s, r) => s + (r.amount_cents ?? 0), 0);

      return {
        events: events.count ?? 0,
        news: news.count ?? 0,
        academies: academies.count ?? 0,
        blackBelts: blackBelts.count ?? 0,
        athletesActive: athletesActive.count ?? 0,
        athletesPending: athletesPending.count ?? 0,
        athletesSuspended: athletesSuspended.count ?? 0,
        permitsActive: permitsActive.count ?? 0,
        permitsExpiring: permitsExpiring.count ?? 0,
        permitsExpired: permitsExpired.count ?? 0,
        regsPending: regsPending.count ?? 0,
        regsConfirmed: regsConfirmed.count ?? 0,
        regsCancelled: regsCancelled.count ?? 0,
        eventsNext30: eventsNext30.count ?? 0,
        monthRevenue,
      };
    },
  });
}

export function usePendingAthletes(limit = 5) {
  return useQuery({
    queryKey: ["admin", "dashboard", "pending-athletes", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("athlete_profiles")
        .select("id, full_name, belt, degree, academy, created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useExpiringPermits(limit = 5) {
  return useQuery({
    queryKey: ["admin", "dashboard", "expiring-permits", limit],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const in30 = new Date(); in30.setDate(in30.getDate() + 30);
      const { data, error } = await supabase
        .from("academy_permits")
        .select("id, academy_name, expires_at, permit_number")
        .eq("status", "active")
        .gte("expires_at", today)
        .lte("expires_at", in30.toISOString().slice(0, 10))
        .order("expires_at", { ascending: true })
        .limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useApproveAthlete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const validUntil = new Date();
      validUntil.setFullYear(validUntil.getFullYear() + 1);
      const { error } = await supabase
        .from("athlete_profiles")
        .update({
          status: "active",
          approved_at: new Date().toISOString(),
          valid_until: validUntil.toISOString().slice(0, 10),
        })
        .eq("id", id);
      if (error) throw error;
      // Fire-and-forget approval email
      try { await supabase.functions.invoke("send-athlete-approval-email", { body: { athleteId: id } }); } catch (_e) { /* noop */ }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
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
    mutationFn: async (input: { id: string; field: "show_on_home" | "is_featured" | "is_active"; value: boolean }) => {
      const patch: EventUpdate = { [input.field]: input.value } as EventUpdate;
      const { error } = await supabase.from("events").update(patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Toggle event activation. Public /events page lists rows with status='upcoming'.
 * "Desativar" => status='cancelled' (hidden from public list).
 * "Ativar" => status='upcoming' (visible).
 */
export function useToggleEventStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; activate: boolean }) => {
      const patch: EventUpdate = { status: input.activate ? "upcoming" : "cancelled" };
      const { error } = await supabase.from("events").update(patch).eq("id", input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      qc.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

/**
 * Bulk-deactivate all currently active events (sets is_active=false).
 * Useful for QA: lets admins clear the public /events list with one click
 * without altering each event's status (Próximo / Em Andamento / etc.).
 */
export function useDeactivateAllEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { error, count } = await supabase
        .from("events")
        .update({ is_active: false }, { count: "exact" })
        .eq("is_active", true);
      if (error) throw error;
      return count ?? 0;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "events"] });
      qc.invalidateQueries({ queryKey: ["admin", "dashboard"] });
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
export const useUpsertYoutube = makeUpsertHook<YoutubeInsert, YoutubeUpdate>("youtube_videos", "youtube", "youtube_videos");
export const useDeleteYoutube = makeDeleteHook("youtube_videos", "youtube", "youtube_videos");
export const useToggleYoutubeField = makeFieldToggleHook<YoutubeUpdate>("youtube_videos", "youtube", "youtube_videos");

/* ============================================================
 * Hero slides
 * ============================================================ */
export const useAdminHero = makeListHook<HeroRow>("hero_slides", "hero", { column: "display_order", asc: true });
export const useUpsertHero = makeUpsertHook<HeroInsert, HeroUpdate>("hero_slides", "hero", "hero");
export const useDeleteHero = makeDeleteHook("hero_slides", "hero", "hero");
export const useToggleHeroField = makeFieldToggleHook<HeroUpdate>("hero_slides", "hero", "hero");

/* ============================================================
 * Black belts
 * ============================================================ */
export const useAdminBlackBelts = makeListHook<BlackBeltRow>("certified_black_belts", "black-belts", { column: "certified_at", asc: false });
export const useUpsertBlackBelt = makeUpsertHook<BlackBeltInsert, BlackBeltUpdate>("certified_black_belts", "black-belts", "black-belts");
export const useDeleteBlackBelt = makeDeleteHook("certified_black_belts", "black-belts", "black-belts");
export const useToggleBlackBeltField = makeFieldToggleHook<BlackBeltUpdate>("certified_black_belts", "black-belts", "black-belts");

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
