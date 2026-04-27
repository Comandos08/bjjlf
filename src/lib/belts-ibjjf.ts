/**
 * IBJJF Belt System — single source of truth for all belt/degree pickers.
 *
 * Belts in canonical order (kid belts only valid for youth categories).
 * Each belt has its own degree set + label semantics ("grau" vs "Dan").
 */

export type BeltName =
  | "Branca"
  | "Cinza"
  | "Amarela"
  | "Laranja"
  | "Verde"
  | "Azul"
  | "Roxa"
  | "Marrom"
  | "Preta"
  | "Coral"
  | "Vermelha";

export type BeltDef = {
  name: BeltName;
  /** true if reserved for kids categories (infanto-juvenil). */
  kidsOnly: boolean;
  /** Allowed degree values (numbers). For black/coral/red, these are Dan numbers. */
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
  { name: "Branca",   kidsOnly: false, degrees: [0, 1, 2, 3, 4],       color: "#FFFFFF", border: "#D1D1D1", textOn: "#1A1A1A", useDan: false },
  { name: "Cinza",    kidsOnly: true,  degrees: [0, 1, 2, 3, 4],       color: "#9CA3AF", textOn: "#FFFFFF", useDan: false },
  { name: "Amarela",  kidsOnly: true,  degrees: [0, 1, 2, 3, 4],       color: "#FACC15", textOn: "#1A1A1A", useDan: false },
  { name: "Laranja",  kidsOnly: true,  degrees: [0, 1, 2, 3, 4],       color: "#F97316", textOn: "#FFFFFF", useDan: false },
  { name: "Verde",    kidsOnly: true,  degrees: [0, 1, 2, 3, 4],       color: "#16A34A", textOn: "#FFFFFF", useDan: false },
  { name: "Azul",     kidsOnly: false, degrees: [0, 1, 2, 3, 4],       color: "#1E3A8A", textOn: "#FFFFFF", useDan: false },
  { name: "Roxa",     kidsOnly: false, degrees: [0, 1, 2, 3, 4],       color: "#6B21A8", textOn: "#FFFFFF", useDan: false },
  { name: "Marrom",   kidsOnly: false, degrees: [0, 1, 2, 3, 4],       color: "#78350F", textOn: "#FFFFFF", useDan: false },
  { name: "Preta",    kidsOnly: false, degrees: [1, 2, 3, 4, 5, 6],    color: "#1A1A1A", textOn: "#FFFFFF", useDan: true  },
  { name: "Coral",    kidsOnly: false, degrees: [7, 8],                color: "#FF6B35", textOn: "#FFFFFF", useDan: true  },
  { name: "Vermelha", kidsOnly: false, degrees: [9, 10],               color: "#C8211A", textOn: "#FFFFFF", useDan: true  },
];

export const BELT_NAMES: BeltName[] = BELT_DEFS.map((b) => b.name);
export const ADULT_BELT_NAMES: BeltName[] = BELT_DEFS.filter((b) => !b.kidsOnly).map((b) => b.name);

export function getBeltDef(name: string | null | undefined): BeltDef | undefined {
  if (!name) return undefined;
  return BELT_DEFS.find((b) => b.name === name);
}

/** Allowed degrees for a given belt name. Falls back to [0..4]. */
export function degreesForBelt(name: string | null | undefined): number[] {
  return getBeltDef(name)?.degrees ?? [0, 1, 2, 3, 4];
}

/** Default degree when the belt is changed (first allowed value). */
export function defaultDegreeForBelt(name: string | null | undefined): number {
  return degreesForBelt(name)[0] ?? 0;
}

/** Renders a single degree label, e.g. "0 grau", "3 graus", "5º Dan". */
export function formatDegreeLabel(belt: string | null | undefined, degree: number): string {
  const def = getBeltDef(belt);
  if (def?.useDan) return `${degree}º Dan`;
  if (degree === 0) return "Sem grau";
  return `${degree} ${degree === 1 ? "grau" : "graus"}`;
}

/**
 * Composes the human-readable line shown in cards / profile blocks.
 * Returns null when the belt is unknown/empty.
 */
export function formatBeltLine(belt: string | null | undefined, degree: number | null | undefined): string | null {
  const def = getBeltDef(belt);
  if (!def) return null;
  const d = typeof degree === "number" ? degree : 0;
  if (def.useDan) return `Faixa ${def.name} · ${d}º Dan`;
  if (d <= 0) return `Faixa ${def.name}`;
  return `Faixa ${def.name} · ${d} ${d === 1 ? "grau" : "graus"}`;
}
