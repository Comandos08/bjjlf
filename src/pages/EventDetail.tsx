import { Link, useLoaderData } from "@tanstack/react-router";
import { ArrowLeft, Calendar, MapPin, Trophy, Users, ShieldCheck } from "lucide-react";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SafeImage } from "@/components/SafeImage";
import { EventBadge } from "@/components/EventBadge";
import { useI18n, formatDate } from "@/lib/i18n";

/**
 * Generic event detail page.
 *
 * Layout is intentionally identical across every event regardless of its
 * GI / NO-GI / GI & NO-GI / KIDS / MASTER badge — only the badge color and
 * label differ, sourced from the shared <EventBadge /> component. This keeps
 * the visual contract consistent across the site.
 */
export function EventDetail() {
  const e = useLoaderData({ from: "/events/$eventId" });
  const { t, lang } = useI18n();

  return (
    <article>
      {/* Hero image with overlay badge — same overlay variant as homepage cards. */}
      <section className="relative bg-navbar border-b border-border overflow-hidden">
        <div className="relative h-[280px] md:h-[360px]">
          <SafeImage
            src={e.image.replace(/w=\d+&h=\d+/, "w=1440&h=600")}
            alt={`${e.name} — Brazilian Jiu-Jitsu event`}
            fallbackLabel={e.name}
            source="event"
            wrapperClassName="absolute inset-0"
          />
          {/* Dark gradient for legibility */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          <EventBadge badge={e.badge} />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container mx-auto px-0">
              <Link
                to="/"
                className={cn(
                  typo.body.sm,
                  "inline-flex items-center gap-2 text-white/80 hover:text-gold mb-4",
                )}
              >
                <ArrowLeft className="h-4 w-4" /> {t("event.back")}
              </Link>
              <h1 className={cn(typo.heading.xl, "text-white max-w-3xl")}>{e.name}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/85">
                <span className={cn(typo.body.md, "inline-flex items-center gap-2")}>
                  <Calendar className="h-4 w-4 text-gold" />
                  {formatDate(e.date, lang)}
                </span>
                <span className={cn(typo.body.md, "inline-flex items-center gap-2")}>
                  <MapPin className="h-4 w-4 text-gold" />
                  {e.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body — identical structure for every event/badge category */}
      <section className="py-12 lg:py-16">
        <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-[1fr,320px] gap-10">
          <div className="space-y-10">
            <div>
              <p className={cn(typo.heading.kicker, "mb-2")}>{t("event.about.kicker")}</p>
              <h2 className={cn(typo.heading.lg, "mb-4")}>{t("event.about.title")}</h2>
              <p className={cn(typo.body.lg)}>
                {t("event.about.body")
                  .replace("{name}", e.name)
                  .replace("{location}", e.location)}
              </p>
            </div>

            <div>
              <h3 className={cn(typo.heading.md, "mb-4 text-gold")}>
                {t("event.format.title")}
              </h3>
              <div className="grid sm:grid-cols-2 gap-3">
                <FormatRow icon={Trophy} label={t("event.format.type")} value={e.type} />
                <FormatRow
                  icon={ShieldCheck}
                  label={t("event.format.category")}
                  value={
                    /* The badge label IS the category — keep it consistent
                       across the site by reusing the inline badge here. */
                    <EventBadge badge={e.badge} variant="inline" className="!relative" />
                  }
                />
                <FormatRow icon={Calendar} label={t("event.format.date")} value={formatDate(e.date, lang)} />
                <FormatRow icon={MapPin} label={t("event.format.venue")} value={e.location} />
              </div>
            </div>
          </div>

          {/* Sticky register card */}
          <aside className="bg-card border border-border p-6 h-fit lg:sticky lg:top-24 space-y-4">
            <div className="flex items-center justify-between">
              <span className={cn(typo.heading.kicker)}>{t("event.register.kicker")}</span>
              <EventBadge badge={e.badge} variant="inline" className="!relative" />
            </div>
            <h3 className={cn(typo.heading.md)}>{t("event.register.title")}</h3>
            <p className={cn(typo.body.sm)}>{t("event.register.body")}</p>
            <Button asChild variant="primary" size="lg" className="w-full">
              <Link to="/register/athlete">
                <Users className="h-4 w-4" /> {t("event.register.cta")}
              </Link>
            </Button>
            <p className={cn(typo.label.sm, "text-center")}>
              {t("event.register.deadline")}: {formatDate(e.date, lang)}
            </p>
          </aside>
        </div>
      </section>
    </article>
  );
}

function FormatRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border border-border p-3 bg-card">
      <Icon className="h-4 w-4 text-gold shrink-0" />
      <div className="min-w-0">
        <p className={cn(typo.label.sm)}>{label}</p>
        <div className={cn(typo.body.md, "text-foreground truncate")}>{value}</div>
      </div>
    </div>
  );
}
