/**
 * Hook used by athlete-only pages: redirects to /athlete/login when not
 * signed in or when the profile is not active.
 *
 * Returns the resolved profile + a boolean ready flag while loading.
 */
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAthleteAuth } from "@/lib/athlete-auth";

export function useRequireActiveAthlete() {
  const navigate = useNavigate();
  const auth = useAthleteAuth();

  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.user) {
      void navigate({ to: "/athlete/login" });
      return;
    }
    if (!auth.profile || auth.profile.status !== "active") {
      // Pending or suspended → send to login screen which renders the status banner.
      void navigate({ to: "/athlete/login" });
    }
  }, [auth.isLoading, auth.user, auth.profile, navigate]);

  return auth;
}
