import { useEffect, useState } from "react";
import { ComingSoon } from "@/components/ComingSoon";
import { supabase } from "@/integrations/supabase/client";

export function RankingsPage() {
  const [hasData, setHasData] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { count } = await supabase
        .from("rankings")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true);
      if (!cancelled) setHasData((count ?? 0) > 0);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mostra empty state honesto enquanto não há ranking real publicado.
  if (hasData === false || hasData === null) {
    return <ComingSoon page="rankings" />;
  }

  // Quando houver dados reais, ainda usamos a placeholder (a tabela
  // de ranking pública detalhada será montada em uma onda futura).
  return <ComingSoon page="rankings" />;
}
