import dragon from "@/assets/dragon-logo.png";

export function Logo({ compact = false, light = true }: { compact?: boolean; light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <img src={dragon} alt="BJJLF dragon emblem" className={compact ? "h-9 w-9" : "h-11 w-11"} width={64} height={64} />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span className={`font-display text-2xl tracking-wider ${light ? "text-white" : "text-foreground"}`} style={{ fontWeight: 900 }}>
            BJJLF
          </span>
          <span className="text-[9px] uppercase tracking-[0.18em] text-gold italic mt-0.5" style={{ fontFamily: "DM Sans" }}>
            Brazilian Jiu-Jitsu Legends Federation
          </span>
        </div>
      )}
    </div>
  );
}
