/**
 * Seed data for /academies (Academias Afiliadas).
 *
 * This is intentionally hardcoded for now — the route only ever reads from
 * this module, so swapping it for a Supabase loader later is a single import
 * change in `AcademiesPage`. Keep the shape STABLE: filter/sort logic in the
 * page consumes these exact field names.
 */

export type Academy = {
  /** URL slug for the future detail page (/academies/$slug). Kept stable so
   *  external links don't rot when the display name is tweaked. */
  slug: string;
  name: string;
  professor: string;
  city: string;
  /** Region/state code for Brazil (e.g. "SP"); "—" for non-Brazil entries.
   *  The state filter is only enabled when country === "Brasil". */
  state: string;
  /** Country in Portuguese — country filter does an exact match on this. */
  country: string;
  /** Flag emoji rendered inline next to the country. */
  flag: string;
  /** Belt rank of the head professor. Visible on the card. */
  belt: "Preta" | "Coral";
  /** Degree on the belt (e.g. 4 for Preta 4° grau). */
  degree: number;
  /** Display string for "affiliated since" (e.g. "Jan 2020"). Used for label
   *  AND for the "most recent" sort — see `sinceTimestamp` for the actual
   *  sort key so we don't try to date-parse "Mai" / "Set" Portuguese months. */
  since: string;
  /** Numeric epoch (ms) for sorting "most recent". Pre-computed so sort is
   *  cheap and locale-independent. */
  sinceTimestamp: number;
  /** 2-letter initials shown when no logo image is available. */
  initials: string;
};

export const ACADEMIES: Academy[] = [
  {
    slug: "alliance-sao-paulo",
    name: "Alliance São Paulo",
    professor: "Fábio Gurgel",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    flag: "🇧🇷",
    belt: "Preta",
    degree: 6,
    since: "Jan 2020",
    sinceTimestamp: Date.UTC(2020, 0, 1),
    initials: "AL",
  },
  {
    slug: "gracie-barra-rio",
    name: "Gracie Barra Rio",
    professor: "Carlos Gracie Jr.",
    city: "Rio de Janeiro",
    state: "RJ",
    country: "Brasil",
    flag: "🇧🇷",
    belt: "Coral",
    degree: 8,
    since: "Mar 2019",
    sinceTimestamp: Date.UTC(2019, 2, 1),
    initials: "GB",
  },
  {
    slug: "checkmat-bh",
    name: "CheckMat BH",
    professor: "Leo Vieira",
    city: "Belo Horizonte",
    state: "MG",
    country: "Brasil",
    flag: "🇧🇷",
    belt: "Preta",
    degree: 5,
    since: "Jun 2021",
    sinceTimestamp: Date.UTC(2021, 5, 1),
    initials: "CM",
  },
  {
    slug: "atos-jiu-jitsu",
    name: "Atos Jiu-Jitsu",
    professor: "André Galvão",
    city: "San Diego",
    state: "CA",
    country: "EUA",
    flag: "🇺🇸",
    belt: "Preta",
    degree: 4,
    since: "Ago 2020",
    sinceTimestamp: Date.UTC(2020, 7, 1),
    initials: "AT",
  },
  {
    slug: "nova-uniao-porto-alegre",
    name: "Nova União Porto Alegre",
    professor: "Wendell Alexander",
    city: "Porto Alegre",
    state: "RS",
    country: "Brasil",
    flag: "🇧🇷",
    belt: "Preta",
    degree: 3,
    since: "Nov 2021",
    sinceTimestamp: Date.UTC(2021, 10, 1),
    initials: "NU",
  },
  {
    slug: "soul-fighters-salvador",
    name: "Soul Fighters Salvador",
    professor: "Marcos Torregrosa",
    city: "Salvador",
    state: "BA",
    country: "Brasil",
    flag: "🇧🇷",
    belt: "Preta",
    degree: 4,
    since: "Fev 2022",
    sinceTimestamp: Date.UTC(2022, 1, 1),
    initials: "SF",
  },
  {
    slug: "bjj-revolution-lisboa",
    name: "BJJ Revolution Lisboa",
    professor: "Sofia Mendes",
    city: "Lisboa",
    state: "—",
    country: "Portugal",
    flag: "🇵🇹",
    belt: "Preta",
    degree: 2,
    since: "Set 2022",
    sinceTimestamp: Date.UTC(2022, 8, 1),
    initials: "BR",
  },
  {
    slug: "tri-force-tokyo",
    name: "Tri-Force Tokyo",
    professor: "Yuki Tanaka",
    city: "Tóquio",
    state: "—",
    country: "Japão",
    flag: "🇯🇵",
    belt: "Preta",
    degree: 3,
    since: "Jan 2021",
    sinceTimestamp: Date.UTC(2021, 0, 1),
    initials: "TF",
  },
  {
    slug: "dream-art-sao-paulo",
    name: "Dream Art São Paulo",
    professor: "Isaque Bahiense",
    city: "São Paulo",
    state: "SP",
    country: "Brasil",
    flag: "🇧🇷",
    belt: "Preta",
    degree: 3,
    since: "Mai 2021",
    sinceTimestamp: Date.UTC(2021, 4, 1),
    initials: "DA",
  },
  {
    slug: "roger-gracie-academy-london",
    name: "Roger Gracie Academy London",
    professor: "Roger Gracie",
    city: "Londres",
    state: "—",
    country: "Reino Unido",
    flag: "🇬🇧",
    belt: "Coral",
    degree: 7,
    since: "Out 2020",
    sinceTimestamp: Date.UTC(2020, 9, 1),
    initials: "RG",
  },
  {
    slug: "infight-brasil-curitiba",
    name: "Infight Brasil Curitiba",
    professor: "Fernando Reis",
    city: "Curitiba",
    state: "PR",
    country: "Brasil",
    flag: "🇧🇷",
    belt: "Preta",
    degree: 4,
    since: "Mar 2022",
    sinceTimestamp: Date.UTC(2022, 2, 1),
    initials: "IF",
  },
  {
    slug: "zenith-bjj-buenos-aires",
    name: "Zenith BJJ Buenos Aires",
    professor: "Diego Vasquez",
    city: "Buenos Aires",
    state: "—",
    country: "Argentina",
    flag: "🇦🇷",
    belt: "Preta",
    degree: 3,
    since: "Jul 2022",
    sinceTimestamp: Date.UTC(2022, 6, 1),
    initials: "ZB",
  },
];

/** Canonical country list for the filter dropdown. Matches the seed data. */
export const ACADEMY_COUNTRIES: ReadonlyArray<string> = [
  "Brasil",
  "EUA",
  "Portugal",
  "Argentina",
  "Reino Unido",
  "Japão",
];

/** Brazilian states shown in the dropdown when country === "Brasil". Spec list. */
export const ACADEMY_BR_STATES: ReadonlyArray<string> = [
  "SP",
  "RJ",
  "MG",
  "RS",
  "BA",
  "PR",
  "SC",
  "CE",
  "PE",
  "DF",
];
