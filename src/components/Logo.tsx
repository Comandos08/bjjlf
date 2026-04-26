import dragon from "@/assets/dragon-logo.png";

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <div className="flex items-center gap-3">
      <img src={dragon} alt="BJJLF dragon emblem" className={className} width={64} height={64} />
      <div className="hidden sm:flex flex-col leading-none">
        <span className="font-display text-xl tracking-wider text-foreground">BJJLF</span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-gold">Legends Federation</span>
      </div>
    </div>
  );
}
