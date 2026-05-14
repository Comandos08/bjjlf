/**
 * Returns true if the current authenticated athlete has at least one
 * academy permit row (any status). Used to gate the "Alvará da Academia"
 * menu item — only academy owners (those who registered an academy) see it.
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";

export function useHasAcademyPermit(): boolean {
  const { user } = useAthleteAuth();
  const [hasPermit, setHasPermit] = useState(false);

  useEffect(() => {
    if (!user) {
      setHasPermit(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      const { count } = await supabase
        .from("academy_permits")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if (!cancelled) setHasPermit((count ?? 0) > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return hasPermit;
}
