/**
 * Athlete authentication context.
 *
 * Separate from the admin auth context. Wraps non-admin pages and exposes:
 *   - user: Supabase auth user (or null)
 *   - profile: athlete_profiles row (or null)
 *   - isLoading
 *   - isActive: profile.status === 'active'
 *   - signOut()
 *   - refresh()
 *
 * Listener-first pattern (auth event registered before getSession) — same
 * gotcha as admin-auth.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AthleteStatus = "pending" | "active" | "suspended";

export type AthleteProfile = {
  id: string;
  user_id: string;
  full_name: string;
  belt: string;
  degree: number;
  academy: string | null;
  professor: string | null;
  country: string | null;
  country_flag: string | null;
  category: string | null;
  modality: string | null;
  photo_url: string | null;
  status: AthleteStatus;
  valid_until: string | null;
  registration_number: string | null;
  created_at: string;
  approved_at: string | null;
  first_login_completed: boolean;
};

type AthleteAuthValue = {
  user: User | null;
  profile: AthleteProfile | null;
  isLoading: boolean;
  isActive: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AthleteAuthContext = createContext<AthleteAuthValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<AthleteProfile | null> {
  const { data, error } = await supabase
    .from("athlete_profiles")
    .select(
      "id, user_id, full_name, belt, degree, academy, professor, country, country_flag, category, modality, photo_url, status, valid_until, registration_number, created_at, approved_at, first_login_completed",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as AthleteProfile;
}

export function AthleteAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const applyUser = useCallback(async (u: User | null) => {
    setUser(u);
    if (!u) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(u.id);
    setProfile(p);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setTimeout(() => {
        if (cancelled) return;
        if (event === "PASSWORD_RECOVERY") {
          // Session is valid — just apply the user so updateUser() works.
          // Do NOT redirect away; let the reset-password page handle it.
          void applyUser(session?.user ?? null);
          if (!cancelled) setIsLoading(false);
          return;
        }
        void applyUser(session?.user ?? null);
      }, 0);
    });

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
    setProfile(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }, []);

  const refresh = useCallback(async () => {
    if (user) await applyUser(user);
  }, [user, applyUser]);

  const value = useMemo<AthleteAuthValue>(
    () => ({
      user,
      profile,
      isLoading,
      isActive: profile?.status === "active",
      signOut,
      refresh,
    }),
    [user, profile, isLoading, signOut, refresh],
  );

  return <AthleteAuthContext.Provider value={value}>{children}</AthleteAuthContext.Provider>;
}

export function useAthleteAuth(): AthleteAuthValue {
  const ctx = useContext(AthleteAuthContext);
  if (!ctx) throw new Error("useAthleteAuth must be used inside <AthleteAuthProvider>");
  return ctx;
}
