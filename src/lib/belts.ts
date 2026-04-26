export type BeltColor = "white" | "blue" | "purple" | "brown" | "black";

export const BELTS: { value: BeltColor; label: string; hex: string; text: string }[] = [
  { value: "white", label: "White", hex: "#F5F5F5", text: "#0A0A0A" },
  { value: "blue", label: "Blue", hex: "#1E5BB8", text: "#FFFFFF" },
  { value: "purple", label: "Purple", hex: "#6B2D8C", text: "#FFFFFF" },
  { value: "brown", label: "Brown", hex: "#6B4423", text: "#FFFFFF" },
  { value: "black", label: "Black", hex: "#0A0A0A", text: "#FFFFFF" },
];

export const beltHex = (b: BeltColor) => BELTS.find((x) => x.value === b)?.hex ?? "#000";
