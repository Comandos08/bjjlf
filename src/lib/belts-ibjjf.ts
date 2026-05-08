/**
 * BJJLF Belt System — single source of truth for all belt/degree pickers.
 *
 * Belts in canonical order (kid belts only valid for youth categories).
 * Adult colored belts and Preta use "Xº Grau"; high belts (Vermelha e Preta,
 * Vermelha e Branca, Vermelha) use "Xº Dan".
 */

export type BeltName =
  | "Branca"
  | "Cinza"            // kids only
  | "Amarela"          // kids only
  | "Laranja"          // kids only
  | "Verde"            // kids only
  | "Azul"
  | "Roxa"
  | "Marrom"
  | "Preta"
  | "Vermelha e Preta"   // 7º Dan
  | "Vermelha e Branca"  // 8º Dan
  | "Vermelha";          // 9º Dan

export type BeltDef = {
  name: BeltName;
  /** true if reserved for kids categories (infanto-juvenil). */
  kidsOnly: boolean;
  /** Allowed degree values (numbers). For high belts these are Dan numbers. */
  degrees: number[];
  /** UI hint color (background). */
  color: string;
  /** Border color (used when bg is white/light). */
  border?: string;
  /** Text color when sitting on the belt color background. */
  textOn: string;
  /** Whether degrees use "Dan" naming. */
  useDan: boolean;
};

export const BELT_DEFS: BeltDef[] = [
  { name: "Branca",            kidsOnly: false, degrees: [0,1,2,3,4],     color: "#FFFFFF", border: "#D1D1D1", textOn: "#1A1A1A", useDan: false },
  { name: "Cinza",             kidsOnly: true,  degrees: [0,1,2,3,4],     color: "#9CA3AF", textOn: "#FFFFFF", useDan: false },
  { name: "Amarela",           kidsOnly: true,  degrees: [0,1,2,3,4],     color: "#FACC15", textOn: "#1A1A1A", useDan: false },
  { name: "Laranja",           kidsOnly: true,  degrees: [0,1,2,3,4],     color: "#F97316", textOn: "#FFFFFF", useDan: false },
  { name: "Verde",             kidsOnly: true,  degrees: [0,1,2,3,4],     color: "#16A34A", textOn: "#FFFFFF", useDan: false },
  { name: "Azul",              kidsOnly: false, degrees: [0,1,2,3,4],     color: "#1E3A8A", textOn: "#FFFFFF", useDan: false },
  { name: "Roxa",              kidsOnly: false, degrees: [0,1,2,3,4],     color: "#6B21A8", textOn: "#FFFFFF", useDan: false },
  { name: "Marrom",            kidsOnly: false, degrees: [0,1,2,3,4],     color: "#78350F", textOn: "#FFFFFF", useDan: false },
  { name: "Preta",             kidsOnly: false, degrees: [0,1,2,3,4,5,6], color: "#1A1A1A", textOn: "#FFFFFF", useDan: false },
  { name: "Vermelha e Preta",  kidsOnly: false, degrees: [7],             color: "#8B0000", textOn: "#FFFFFF", useDan: true },
  { name: "Vermelha e Branca", kidsOnly: false, degrees: [8],             color: "#DC2626", textOn: "#FFFFFF", useDan: true },
  { name: "Vermelha",          kidsOnly: false, degrees: [9],             color: "#C8211A", textOn: "#FFFFFF", useDan: true },
];

export const BELT_NAMES: BeltName[] = BELT_DEFS.map((b) => b.name);
export const ADULT_BELT_NAMES: BeltName[] = BELT_DEFS.filter((b) => !b.kidsOnly).map((b) => b.name);
export const KIDS_BELT_NAMES: BeltName[] = BELT_DEFS.filter((b) => b.kidsOnly || b.name === "Branca").map((b) => b.name);

/**
 * Normalizes legacy / lowercase / English belt names to the canonical BeltName.
 * Returns null when the input doesn't match any known belt.
 */
export function normalizeBelt(b: string | null | undefined): BeltName | null {
  if (!b) return null;
  const v = b.trim();
  const exact = BELT_DEFS.find((d) => d.name.toLowerCase() === v.toLowerCase());
  if (exact) return exact.name;
  const map: Record<string, BeltName> = {
    branca: "Branca", branco: "Branca", white: "Branca",
    cinza: "Cinza", grey: "Cinza", gray: "Cinza",
    amarela: "Amarela", amarelo: "Amarela", yellow: "Amarela",
    laranja: "Laranja", orange: "Laranja",
    verde: "Verde", green: "Verde",
    azul: "Azul", blue: "Azul",
    roxa: "Roxa", roxo: "Roxa", purple: "Roxa",
    marrom: "Marrom", brown: "Marrom",
    preta: "Preta", preto: "Preta", black: "Preta",
    coral: "Vermelha e Preta",
    vermelha_e_preta: "Vermelha e Preta",
    vermelha_e_branca: "Vermelha e Branca",
    vermelha_branca: "Vermelha e Branca",
    vermelha: "Vermelha", red: "Vermelha",
  };
  return map[v.toLowerCase()] ?? null;
}

export function getBeltDef(name: string | null | undefined): BeltDef | undefined {
  if (!name) return undefined;
  const canonical = normalizeBelt(name);
  if (!canonical) return undefined;
  return BELT_DEFS.find((b) => b.name === canonical);
}

/** Allowed degrees for a given belt name. Falls back to [0..4]. */
export function degreesForBelt(name: string | null | undefined): number[] {
  return getBeltDef(name)?.degrees ?? [0, 1, 2, 3, 4];
}

/** Default degree when the belt is changed (first allowed value). */
export function defaultDegreeForBelt(name: string | null | undefined): number {
  return degreesForBelt(name)[0] ?? 0;
}

/** Renders just the degree label for a belt, e.g. "3º Grau", "Lisa", "7º Dan". */
export function formatDegreeLabel(belt: string | null | undefined, degree: number): string {
  const def = getBeltDef(belt);
  if (!def) return String(degree);
  if (def.useDan) return `${degree}º Dan`;
  if (belt === "Preta") return degree === 0 ? "Lisa" : `${degree}º Grau`;
  if (degree === 0) return ""; // colored belt with no stripe
  return `${degree}º Grau`;
}

/**
 * Composes the human-readable line shown in cards / profile blocks.
 * Returns null when the belt is unknown/empty.
 */
export function formatBeltLine(belt: string | null | undefined, degree: number | null | undefined): string | null {
  const def = getBeltDef(belt);
  if (!def) return null;
  const d = typeof degree === "number" ? degree : 0;
  if (def.useDan) return `${def.name} · ${d}º Dan`;
  if (belt === "Preta") return d === 0 ? "Faixa Preta Lisa" : `Faixa Preta · ${d}º Grau`;
  if (d === 0) return `Faixa ${def.name}`;
  return `Faixa ${def.name} · ${d}º Grau`;
}
