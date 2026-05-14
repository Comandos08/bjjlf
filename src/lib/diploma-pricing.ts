export type Currency = "BRL" | "EUR" | "USD";

export type BeltKey =
  | "white"
  | "grey"
  | "yellow"
  | "orange"
  | "blue"
  | "green"
  | "purple"
  | "brown"
  | "black1"
  | "black2"
  | "black3"
  | "black4"
  | "black5"
  | "black6"
  | "black7"
  | "vermelha_e_preta7"
  | "vermelha_e_branca8"
  | "red9";

export type PriceGroup = "preta" | "marromRoxa" | "azulVerde" | "ateLaranja";

export const BELT_GROUP: Record<BeltKey, PriceGroup> = {
  white: "ateLaranja",
  grey: "ateLaranja",
  yellow: "ateLaranja",
  orange: "ateLaranja",
  blue: "azulVerde",
  green: "azulVerde",
  purple: "marromRoxa",
  brown: "marromRoxa",
  black1: "preta",
  black2: "preta",
  black3: "preta",
  black4: "preta",
  black5: "preta",
  black6: "preta",
  black7: "preta",
  vermelha_e_preta7: "preta",
  vermelha_e_branca8: "preta",
  red9: "preta",
};

export const PRICES: Record<PriceGroup, Record<Currency, number>> = {
  preta: { BRL: 300, EUR: 55, USD: 60 },
  marromRoxa: { BRL: 250, EUR: 45, USD: 50 },
  azulVerde: { BRL: 200, EUR: 35, USD: 40 },
  ateLaranja: { BRL: 150, EUR: 25, USD: 30 },
};

export const CURRENCY_SYMBOL: Record<Currency, string> = {
  BRL: "R$",
  EUR: "€",
  USD: "$",
};

export const BELT_SWATCH: Record<BeltKey, string> = {
  white: "#F5F5F5",
  grey: "#9CA3AF",
  yellow: "#FACC15",
  orange: "#F97316",
  blue: "#1E5BB8",
  green: "#15803D",
  purple: "#6B2D8C",
  brown: "#6B4423",
  black1: "#0A0A0A",
  black2: "#0A0A0A",
  black3: "#0A0A0A",
  black4: "#0A0A0A",
  black5: "#0A0A0A",
  black6: "#0A0A0A",
  black7: "#0A0A0A",
  vermelha_e_preta7: "#8B0000",
  vermelha_e_branca8: "#DC2626",
  red9: "#9B1B14",
};

export const ALL_BELTS: BeltKey[] = [
  "white",
  "grey",
  "yellow",
  "orange",
  "blue",
  "green",
  "purple",
  "brown",
  "black1",
  "black2",
  "black3",
  "black4",
  "black5",
  "black6",
  
  "vermelha_e_preta7",
  "vermelha_e_branca8",
  "red9",
];

export function priceFor(belt: BeltKey, currency: Currency): number {
  return PRICES[BELT_GROUP[belt]][currency];
}
