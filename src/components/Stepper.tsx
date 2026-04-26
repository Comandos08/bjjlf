import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-0 mb-10 overflow-x-auto pb-2">
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={label} className="flex items-center flex-1 min-w-[80px]">
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`shrink-0 h-10 w-10 grid place-items-center font-display text-base transition-all ${
                  done
                    ? "bg-primary text-white"
                    : active
                    ? "bg-gold text-[#0F0F0F]"
                    : "bg-[#E5E5E5] text-[#9CA3AF]"
                }`}
                style={{
                  borderRadius: "9999px",
                  boxShadow: active ? "0 0 0 4px rgba(184, 150, 12, 0.25)" : "none",
                  fontWeight: 800,
                }}
              >
                {done ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <span
                className={`hidden md:inline text-[11px] uppercase tracking-[0.06em] whitespace-nowrap ${
                  active ? "text-foreground font-bold" : done ? "text-foreground/80" : "text-muted-foreground"
                }`}
                style={{ fontFamily: "DM Sans" }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mx-2 mt-[-20px] ${done ? "bg-primary" : "bg-[#E5E5E5]"}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function PageHero({ kicker, title, desc, breadcrumb }: { kicker?: string; title: string; desc?: string; breadcrumb?: { label: string; to?: string }[] }) {
  const { t } = useI18n();
  return (
    <section className="relative bg-navbar border-b border-[#2A2A2A] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #C41E3A 0px, transparent 1px), radial-gradient(circle at 80% 70%, #B8960C 0px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative max-w-[1280px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-2 text-[12px] mb-4" style={{ fontFamily: "DM Sans" }}>
            <Link to="/" className="text-[#999] hover:text-gold transition-base uppercase tracking-[0.06em]">
              {t("nav.home")}
            </Link>
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-[#444]">/</span>
                {i === breadcrumb.length - 1 ? (
                  <span className="text-gold uppercase tracking-[0.06em]">{b.label}</span>
                ) : (
                  <span className="text-[#999] uppercase tracking-[0.06em]">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {kicker && <p className="text-gold font-heading text-[11px] tracking-[0.2em] uppercase mb-3" style={{ fontWeight: 700 }}>{kicker}</p>}
        <h1
          className="font-display text-3xl md:text-5xl lg:text-[42px] tracking-wider text-white leading-[1.05]"
          style={{ fontWeight: 900 }}
        >
          {title}
        </h1>
        {desc && (
          <p className="mt-4 max-w-2xl text-[15px] text-foreground/70" style={{ fontFamily: "DM Sans" }}>
            {desc}
          </p>
        )}
      </div>
    </section>
  );
}
