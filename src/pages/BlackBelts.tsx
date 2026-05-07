import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, Award, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
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
  Preta: "Preta",
  "Vermelha e Preta": "Vermelha e Preta",
  "Vermelha e Branca": "Vermelha e Branca",
  Vermelha: "Vermelha",
  // legacy lowercase fallbacks
  preta: "Preta",
  vermelha_e_preta: "Vermelha e Preta",
  vermelha_e_branca: "Vermelha e Branca",
  vermelha_branca: "Vermelha e Branca",
  vermelha: "Vermelha",
  coral: "Vermelha e Preta",
};

function beltLabelFor(type: string, degree: number): string {
  if (type === "Preta" || type === "preta") {
    return degree === 0 ? "Preta Lisa" : `Preta · ${degree}º Grau`;
  }
  const label = BELT_LABEL[type] ?? type;
  return degree > 0 ? `${label} · ${degree}º Dan` : label;
}

// ISO 3166-1 alpha-2/alpha-3 → nome PT (principais países do BJJ)
const COUNTRY_NAME: Record<string, string> = {
  BR: "Brasil", BRA: "Brasil",
  US: "Estados Unidos", USA: "Estados Unidos",
  PT: "Portugal", PRT: "Portugal",
  AR: "Argentina", ARG: "Argentina",
  GB: "Reino Unido", GBR: "Reino Unido", UK: "Reino Unido",
  FR: "França", FRA: "França",
  DE: "Alemanha", DEU: "Alemanha",
  ES: "Espanha", ESP: "Espanha",
  IT: "Itália", ITA: "Itália",
  JP: "Japão", JPN: "Japão",
  CA: "Canadá", CAN: "Canadá",
  AU: "Austrália", AUS: "Austrália",
  MX: "México", MEX: "México",
  CL: "Chile", CHL: "Chile",
  CO: "Colômbia", COL: "Colômbia",
  PE: "Peru", PER: "Peru",
  UY: "Uruguai", URY: "Uruguai",
  PY: "Paraguai", PRY: "Paraguai",
  NL: "Holanda", NLD: "Holanda",
  BE: "Bélgica", BEL: "Bélgica",
  CH: "Suíça", CHE: "Suíça",
  SE: "Suécia", SWE: "Suécia",
  NO: "Noruega", NOR: "Noruega",
  IE: "Irlanda", IRL: "Irlanda",
  AE: "Emirados Árabes", ARE: "Emirados Árabes",
  RU: "Rússia", RUS: "Rússia",
};
const countryName = (code: string) => COUNTRY_NAME[code.toUpperCase()] ?? code;

const PAGE_SIZE = 12;
type SortKey = "dan_desc" | "name_asc" | "academy_asc";

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
  const [sort, setSort] = useState<SortKey>("dan_desc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data, error } = await supabase
        .from("certified_black_belts")
        .select(
          "id, athlete_name, academy, professor, belt_type, belt_degree, country_code, flag_emoji, city, photo_url",
        )
        .eq("is_active", true);
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

  // Reset página ao mudar filtros/ordem
  useEffect(() => {
    setPage(1);
  }, [search, filterBelt, filterCountry, sort]);

  const countries = useMemo(() => {
    if (!rows) return [];
    const map = new Map<string, string | null>();
    rows.forEach((r) => {
      if (!map.has(r.country_code)) map.set(r.country_code, r.flag_emoji);
    });
    return Array.from(map.entries())
      .map(([code, flag]) => ({ code, flag, name: countryName(code) }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }, [rows]);

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    const out = rows.filter((r) => {
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
    out.sort((a, b) => {
      if (sort === "name_asc") return a.athlete_name.localeCompare(b.athlete_name, "pt-BR");
      if (sort === "academy_asc")
        return (a.academy ?? "").localeCompare(b.academy ?? "", "pt-BR");
      // dan_desc (default): maior Dan, depois nome
      if (b.belt_degree !== a.belt_degree) return b.belt_degree - a.belt_degree;
      return a.athlete_name.localeCompare(b.athlete_name, "pt-BR");
    });
    return out;
  }, [rows, search, filterBelt, filterCountry, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const totalAll = rows?.length ?? 0;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-8 text-center">
          <h1
            className="text-5xl md:text-6xl uppercase text-gray-900"
            style={{ fontFamily: "Bebas Neue", letterSpacing: "0.04em" }}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div className="relative lg:col-span-2">
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
              <option key={c.code} value={c.code}>
                {c.flag ? `${c.flag} ` : ""}
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Contador + Ordenação */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <p
            className="text-sm text-gray-600"
            style={{ fontFamily: "Barlow" }}
          >
            {rows === null
              ? "Carregando..."
              : `Exibindo ${filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} de ${filtered.length}${filtered.length !== totalAll ? ` (${totalAll} total)` : ""} mestre${filtered.length === 1 ? "" : "s"}`}
          </p>
          <div className="flex items-center gap-2">
            <label
              className="text-xs uppercase tracking-wider text-gray-500"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              Ordenar por
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-9 px-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C8211A]"
              style={{ fontFamily: "Barlow" }}
            >
              <option value="dan_desc">Dan (maior primeiro)</option>
              <option value="name_asc">Nome (A–Z)</option>
              <option value="academy_asc">Academia (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Conteúdo */}
        {rows === null && !error ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="w-full aspect-square rounded-lg bg-gray-200 mb-4" />
                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
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
              className="text-xl text-gray-700 uppercase"
              style={{ fontFamily: "Bebas Neue", letterSpacing: "0.03em" }}
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
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paged.map((bb) => (
                <li key={bb.id} className="group">
                  <Link
                    to="/black-belts/$id"
                    params={{ id: bb.id }}
                    className="block bg-white border border-gray-200 rounded-xl overflow-hidden no-underline transition hover:shadow-lg hover:border-[#C8A84B] hover:-translate-y-0.5"
                  >
                    {/* Foto destaque */}
                    <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                      {bb.photo_url ? (
                        <img
                          src={bb.photo_url}
                          alt={bb.athlete_name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full grid place-items-center text-[#C8A84B]"
                          style={{ fontFamily: "Bebas Neue", fontSize: 72, letterSpacing: "0.05em" }}
                        >
                          {initials(bb.athlete_name)}
                        </div>
                      )}
                      {/* Badge faixa/Dan */}
                      <div className="absolute top-3 left-3">
                        <span
                          className="inline-flex items-center bg-[#C8211A] text-white px-2.5 py-1 rounded text-xs uppercase tracking-widest shadow-md"
                          style={{ fontFamily: "Barlow", fontWeight: 700, letterSpacing: "0.1em" }}
                        >
                          {bb.belt_degree > 0 ? `${bb.belt_degree}º Dan` : BELT_LABEL[bb.belt_type] ?? bb.belt_type}
                        </span>
                      </div>
                      {/* Bandeira */}
                      {bb.flag_emoji && (
                        <div className="absolute top-3 right-3 text-2xl drop-shadow-md">
                          {bb.flag_emoji}
                        </div>
                      )}
                      {/* Faixa de tipo embaixo da foto */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <p
                          className="text-[#C8A84B] text-xs uppercase tracking-widest"
                          style={{ fontFamily: "Barlow", fontWeight: 600, letterSpacing: "0.12em" }}
                        >
                          Faixa {BELT_LABEL[bb.belt_type] ?? bb.belt_type}
                        </p>
                      </div>
                    </div>

                    {/* Conteúdo do card */}
                    <div className="p-5">
                      <h3
                        className="text-2xl text-gray-900 uppercase leading-tight group-hover:text-[#C8211A] transition-colors"
                        style={{ fontFamily: "Bebas Neue", letterSpacing: "0.02em" }}
                      >
                        {bb.athlete_name}
                      </h3>

                      <div
                        className="mt-3 space-y-1.5 text-sm text-gray-600"
                        style={{ fontFamily: "Barlow" }}
                      >
                        {bb.academy && (
                          <p className="truncate">
                            <span className="text-gray-400">Academia: </span>
                            <span className="text-gray-800" style={{ fontWeight: 500 }}>
                              {bb.academy}
                            </span>
                          </p>
                        )}
                        {(bb.city || bb.country_code) && (
                          <p className="truncate">
                            <span className="text-gray-400">Local: </span>
                            <span className="text-gray-800" style={{ fontWeight: 500 }}>
                              {[bb.city, countryName(bb.country_code)].filter(Boolean).join(", ")}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span
                          className="text-xs uppercase tracking-widest text-[#C8211A] group-hover:tracking-[0.15em] transition-all"
                          style={{ fontFamily: "Barlow", fontWeight: 700, letterSpacing: "0.1em" }}
                        >
                          Ver perfil
                        </span>
                        <span className="text-[#C8211A] transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Paginação */}
            {totalPages > 1 && (
              <nav
                className="mt-8 flex items-center justify-center gap-2"
                aria-label="Paginação"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="inline-flex items-center gap-1 h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white hover:border-[#C8211A] hover:text-[#C8211A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-inherit transition"
                  style={{ fontFamily: "Barlow", fontWeight: 600 }}
                >
                  <ChevronLeft className="h-4 w-4" /> Anterior
                </button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const n = i + 1;
                  // mostra primeira/última, atual±1, e ellipsis
                  const show =
                    n === 1 ||
                    n === totalPages ||
                    (n >= safePage - 1 && n <= safePage + 1);
                  if (!show) {
                    if (n === safePage - 2 || n === safePage + 2) {
                      return (
                        <span key={n} className="px-2 text-gray-400">
                          …
                        </span>
                      );
                    }
                    return null;
                  }
                  const active = n === safePage;
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={`h-10 min-w-10 px-3 rounded-lg text-sm border transition ${
                        active
                          ? "bg-[#C8211A] border-[#C8211A] text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:border-[#C8211A] hover:text-[#C8211A]"
                      }`}
                      style={{ fontFamily: "Barlow", fontWeight: active ? 700 : 500 }}
                      aria-current={active ? "page" : undefined}
                    >
                      {n}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="inline-flex items-center gap-1 h-10 px-3 border border-gray-300 rounded-lg text-sm bg-white hover:border-[#C8211A] hover:text-[#C8211A] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:text-inherit transition"
                  style={{ fontFamily: "Barlow", fontWeight: 600 }}
                >
                  Próxima <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
