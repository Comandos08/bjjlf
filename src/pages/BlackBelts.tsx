import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type BlackBelt = {
  id: string;
  athlete_name: string;
  academy: string | null;
  professor: string | null;
  belt_type: string;
  belt_degree: number;
  country_code: string;
  flag_emoji: string | null;
  city: string | null;
  photo_url: string | null;
};

const BELT_LABEL: Record<string, string> = {
  preta: "Preta",
  coral: "Coral",
  vermelha_branca: "Vermelha e Branca",
  vermelha: "Vermelha",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function BlackBeltsPage() {
  const [rows, setRows] = useState<BlackBelt[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [filterBelt, setFilterBelt] = useState("");
  const [filterCountry, setFilterCountry] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("certified_black_belts")
        .select(
          "id, athlete_name, academy, professor, belt_type, belt_degree, country_code, flag_emoji, city, photo_url",
        )
        .eq("is_active", true)
        .order("belt_degree", { ascending: false })
        .order("athlete_name", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error("[BlackBelts]", error);
        setError(true);
        return;
      }
      setRows((data ?? []) as BlackBelt[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const countries = useMemo(() => {
    if (!rows) return [];
    return Array.from(new Set(rows.map((r) => r.country_code))).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (filterBelt && r.belt_type !== filterBelt) return false;
      if (filterCountry && r.country_code !== filterCountry) return false;
      if (
        q &&
        !r.athlete_name.toLowerCase().includes(q) &&
        !(r.academy ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [rows, search, filterBelt, filterCountry]);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-8 text-center">
          <h1
            className="text-4xl md:text-5xl uppercase text-gray-900"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800, letterSpacing: "0.02em" }}
          >
            Faixas Pretas BJJLF
          </h1>
          <div className="h-1 w-16 bg-[#C8211A] rounded mx-auto mt-3" />
          <p
            className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto"
            style={{ fontFamily: "Barlow" }}
          >
            Registro mundial dos mestres certificados pela Brazilian Jiu-Jitsu Legends Federation.
          </p>
        </header>

        {/* Filtros */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou academia..."
              className="w-full h-11 pl-9 pr-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8211A]"
              style={{ fontFamily: "Barlow" }}
            />
          </div>
          <select
            value={filterBelt}
            onChange={(e) => setFilterBelt(e.target.value)}
            className="h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8211A]"
            style={{ fontFamily: "Barlow" }}
          >
            <option value="">Todas as faixas</option>
            {Object.entries(BELT_LABEL).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="h-11 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8211A]"
            style={{ fontFamily: "Barlow" }}
          >
            <option value="">Todos os países</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Conteúdo */}
        {rows === null && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-gray-200 rounded" />
                    <div className="h-3 w-1/2 bg-gray-200 rounded" />
                  </div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <Loader2 className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500" style={{ fontFamily: "Barlow" }}>
              Não foi possível carregar a lista. Tente novamente em instantes.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl py-16 text-center">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p
              className="text-base text-gray-700"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              {rows && rows.length === 0
                ? "Em breve, a lista oficial de faixas pretas BJJLF."
                : "Nenhum mestre encontrado com esses filtros."}
            </p>
            <p
              className="mt-2 text-sm text-gray-500 max-w-md mx-auto"
              style={{ fontFamily: "Barlow" }}
            >
              {rows && rows.length === 0
                ? "Os mestres certificados aparecerão aqui assim que forem cadastrados."
                : "Ajuste os filtros para ver mais resultados."}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((bb) => (
              <li
                key={bb.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-[#C8A84B] transition group"
              >
                <Link
                  to="/black-belts/$id"
                  params={{ id: bb.id }}
                  className="block p-5 no-underline"
                >
                  <div className="flex items-center gap-4">
                    {bb.photo_url ? (
                      <img
                        src={bb.photo_url}
                        alt={bb.athlete_name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#C8A84B] shrink-0"
                      />
                    ) : (
                      <div
                        className="w-16 h-16 rounded-full bg-gray-900 border-2 border-[#C8A84B] shrink-0 grid place-items-center text-[#C8A84B]"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: 18 }}
                      >
                        {initials(bb.athlete_name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-lg text-gray-900 truncate group-hover:text-[#C8211A] transition"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                      >
                        {bb.athlete_name}
                      </h3>
                      <p
                        className="text-xs uppercase tracking-wider text-[#C8A84B] mt-0.5"
                        style={{ fontFamily: "Barlow", fontWeight: 600 }}
                      >
                        {BELT_LABEL[bb.belt_type] ?? bb.belt_type}
                        {bb.belt_degree > 0 ? ` · ${bb.belt_degree}º Dan` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-xs text-gray-600" style={{ fontFamily: "Barlow" }}>
                    {bb.academy && (
                      <p className="truncate">
                        <span className="text-gray-400">Academia:</span> {bb.academy}
                      </p>
                    )}
                    {(bb.city || bb.country_code) && (
                      <p>
                        {bb.flag_emoji ? `${bb.flag_emoji} ` : ""}
                        {[bb.city, bb.country_code].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span
                      className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-[#C8211A] group-hover:gap-2 transition-all"
                      style={{ fontFamily: "Barlow", fontWeight: 700, letterSpacing: "0.08em" }}
                    >
                      Ver perfil →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
