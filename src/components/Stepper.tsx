import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";

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
                className={cn(
                  "hidden md:inline whitespace-nowrap",
                  typo.label.md,
                  active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground",
                )}
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
    <section className="relative bg-gray-900 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #C8211A 0px, transparent 1px), radial-gradient(circle at 80% 70%, #C8A84B 0px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            className="flex items-center gap-2 mb-4 text-sm text-gray-500"
            style={{ fontFamily: "Barlow", fontWeight: 400 }}
          >
            <Link to="/" className="hover:text-white transition-base">
              {t("nav.home")}
            </Link>
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="text-gray-700">/</span>
                {i === breadcrumb.length - 1 ? (
                  <span className="text-gray-300">{b.label}</span>
                ) : (
                  <span className="text-gray-500">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {kicker && (
          <p
            className="mb-3 text-xs uppercase tracking-widest text-[#C8A84B]"
            style={{ fontFamily: "Barlow", fontWeight: 700 }}
          >
            {kicker}
          </p>
        )}
        <h1
          className="text-5xl md:text-6xl uppercase tracking-wide text-white leading-[0.95]"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
        >
          {title}
        </h1>
        {desc && (
          <p
            className="mt-4 max-w-2xl text-base md:text-lg text-gray-400 leading-[1.7]"
            style={{ fontFamily: "Barlow", fontWeight: 400 }}
          >
            {desc}
          </p>
        )}
      </div>
    </section>
  );
}
