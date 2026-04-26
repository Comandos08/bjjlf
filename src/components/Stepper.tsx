import { Check } from "lucide-react";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex flex-wrap gap-y-3 items-center justify-center sm:justify-between mb-10">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`shrink-0 h-10 w-10 grid place-items-center font-display text-lg border-2 transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : done ? "border-gold bg-gold text-gold-foreground" : "border-border bg-card text-muted-foreground"}`}>
                {done ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <span className={`hidden md:inline font-heading uppercase tracking-wider text-sm whitespace-nowrap ${active ? "text-foreground" : done ? "text-gold" : "text-muted-foreground"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-3 ${done ? "bg-gold" : "bg-border"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

export function PageHero({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <section className="relative bg-navbar border-b border-border overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, var(--color-primary) 0px, transparent 1px), radial-gradient(circle at 70% 50%, var(--color-gold) 0px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <div className="relative container mx-auto px-4 lg:px-6 py-16 lg:py-24 text-center">
        <p className="text-gold font-heading text-xs tracking-[0.3em] uppercase mb-3">{kicker}</p>
        <h1 className="font-display text-4xl md:text-6xl tracking-wider">{title}</h1>
        {desc && <p className="mt-4 max-w-2xl mx-auto text-foreground/70">{desc}</p>}
      </div>
    </section>
  );
}
