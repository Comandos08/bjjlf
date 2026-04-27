/**
 * Admin authentication context.
 *
 * Wraps the admin section of the app and exposes:
 *   - user: the Supabase auth user (or null)
 *   - role: 'super_admin' | 'editor' | 'viewer' | null
 *   - isLoading: true until the initial session check resolves
 *   - signOut(): logs out and redirects to /admin/login
 *   - refresh(): re-runs the admin_users lookup (after settings changes)
 *
 * Implementation notes
 * --------------------
 *  - We register `onAuthStateChange` BEFORE calling `getSession()` to avoid
 *    a race where a sign-in event fires before the listener is attached
 *    (Supabase's documented gotcha).
 *  - The admin row lookup uses `setTimeout(..., 0)` inside the auth listener
 *    so we don't block the auth event loop while the DB call is in flight.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AdminRole = "super_admin" | "editor" | "viewer";

type AdminAuthValue = {
  user: User | null;
  role: AdminRole | null;
  fullName: string | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthValue | undefined>(undefined);

async function fetchAdminRow(userId: string): Promise<{ role: AdminRole; fullName: string | null } | null> {
  const { data, error } = await supabase
    .from("admin_users")
    .select("role, full_name, is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data || !data.is_active) return null;

  // Coerce free-form DB role to our union; unknown roles fall back to viewer.
  const r = (data.role ?? "").toLowerCase();
  const role: AdminRole =
    r === "super_admin" ? "super_admin" : r === "editor" ? "editor" : "viewer";
  return { role, fullName: data.full_name };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyUser = useCallback(async (u: User | null) => {
    setUser(u);
    if (!u) {
      setRole(null);
      setFullName(null);
      return;
    }
    const row = await fetchAdminRow(u.id);
    if (row) {
      setRole(row.role);
      setFullName(row.fullName);
    } else {
      // Authenticated but not an admin — clear role so route guards reject.
      setRole(null);
      setFullName(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // 1) Listener first (synchronous registration).
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Defer the DB call so we don't block the auth event loop.
      setTimeout(() => {
        if (cancelled) return;
        void applyUser(session?.user ?? null);
      }, 0);
    });

    // 2) Then check the existing session.
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      await applyUser(data.session?.user ?? null);
      if (!cancelled) setIsLoading(false);
    })();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [applyUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setFullName(null);
    // Hard redirect ensures all in-memory state (queries, etc.) is reset.
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }, []);

  const refresh = useCallback(async () => {
    if (user) await applyUser(user);
  }, [user, applyUser]);

  const value = useMemo<AdminAuthValue>(
    () => ({ user, role, fullName, isLoading, signOut, refresh }),
    [user, role, fullName, isLoading, signOut, refresh],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside <AdminAuthProvider>");
  return ctx;
}

/** Convenience: which top-level admin sections is this role allowed to access? */
export function canAccessSection(role: AdminRole | null, section: AdminSection): boolean {
  if (!role) return false;
  if (role === "super_admin") return true;
  if (role === "editor") {
    // Editors get everything except settings + rankings writes.
    // Rankings page itself is visible to editors as read-only — the section
    // gate here returns true; UI gates the write actions separately.
    return section !== "settings";
  }
  // viewer — read-only everywhere except settings
  return section !== "settings";
}

export type AdminSection =
  | "dashboard"
  | "events"
  | "news"
  | "rankings"
  | "youtube"
  | "black-belts"
  | "academies"
  | "hero"
  | "settings";

/** Can this role perform write actions (create/edit/delete) for this section? */
export function canWrite(role: AdminRole | null, section: AdminSection): boolean {
  if (role === "super_admin") return true;
  if (role === "editor") return section !== "rankings" && section !== "settings";
  return false; // viewer
}
