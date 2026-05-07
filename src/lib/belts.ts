export type BeltColor =
  | "white"
  | "grey"
  | "yellow"
  | "orange"
  | "green"
  | "blue"
  | "purple"
  | "brown"
  | "black"
  | "red_black"
  | "red_white"
  | "red";

export const BELTS: { value: BeltColor; label: string; hex: string; text: string }[] = [
  { value: "white",     label: "Branca",            hex: "#F5F5F5", text: "#0A0A0A" },
  { value: "grey",      label: "Cinza",             hex: "#9CA3AF", text: "#FFFFFF" },
  { value: "yellow",    label: "Amarela",           hex: "#FACC15", text: "#0A0A0A" },
  { value: "orange",    label: "Laranja",           hex: "#F97316", text: "#FFFFFF" },
  { value: "green",     label: "Verde",             hex: "#16A34A", text: "#FFFFFF" },
  { value: "blue",      label: "Azul",              hex: "#1E5BB8", text: "#FFFFFF" },
  { value: "purple",    label: "Roxa",              hex: "#6B2D8C", text: "#FFFFFF" },
  { value: "brown",     label: "Marrom",            hex: "#6B4423", text: "#FFFFFF" },
  { value: "black",     label: "Preta",             hex: "#0A0A0A", text: "#FFFFFF" },
  { value: "red_black", label: "Vermelha e Preta",  hex: "#8B0000", text: "#FFFFFF" },
  { value: "red_white", label: "Vermelha e Branca", hex: "#DC2626", text: "#FFFFFF" },
  { value: "red",       label: "Vermelha",          hex: "#C8211A", text: "#FFFFFF" },
];

export const beltHex = (b: BeltColor) => BELTS.find((x) => x.value === b)?.hex ?? "#000";
