import dragon from "@/assets/dragon-logo.png";

export function Logo({ compact = false, light = true }: { compact?: boolean; light?: boolean }) {
  void light;
  return (
    <div className="flex items-center gap-3">
      <img
        src={dragon}
        alt="BJJLF dragon emblem"
        className={compact ? "h-10 w-10" : "h-12 w-12"}
        width={64}
        height={64}
      />
      {!compact && (
        <div className="flex flex-col leading-none">
          <span
            className="text-xl tracking-wider text-[#C8211A]"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            BJJLF
          </span>
          <span
            className="text-[9px] tracking-[0.18em] text-[#C8A84B] mt-1 uppercase"
            style={{ fontFamily: "Barlow", fontWeight: 500 }}
          >
            Brazilian Jiu-Jitsu Legends Federation
          </span>
        </div>
      )}
    </div>
  );
}
