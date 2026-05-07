import logo from "@/assets/bjjlf-logo.png";
import { bustAnyImageUrl } from "@/lib/asset-registry";

export function Logo({ compact = false, light = true }: { compact?: boolean; light?: boolean }) {
  void light;
  return (
    <div className="flex items-center">
      <img
        src={bustAnyImageUrl(logo) ?? logo}
        alt="BJJLF — Brazilian Jiu-Jitsu Legends Federation"
        className={compact ? "h-10 w-auto" : "h-12 w-auto md:h-14"}
      />
    </div>
  );
}
