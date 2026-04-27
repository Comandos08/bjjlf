import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Play, ArrowRight, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENTS, RANKINGS } from "@/data/events";
import { NEWS } from "@/data/news";
import { useI18n, formatDateShort } from "@/lib/i18n";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { SafeImage } from "@/components/SafeImage";
import { EventBadge } from "@/components/EventBadge";
// FIX A + FIX C: pin BJJ images locally so the Unsplash CDN can't swap them
// for unrelated photos (tennis, gym, photographer) the way it has been doing
// when the same photo ID is requested at different sizes.
import heroBlackBeltUrl from "@/assets/hero-3-bjj.jpg";
import youtubeBlackBeltImg from "@/assets/youtube-black-belt-promotions.jpg";
import youtubeMestreRobertoImg from "@/assets/youtube-mestre-roberto.jpg";

const SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=1440&h=600",
    thumb: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=80&h=50",
    titleKey: "slide.1.title",
    subKey: "slide.1.sub",
    badge: "BJJLF World Championship 2025",
  },
  {
    image: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=1440&h=600",
    thumb: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=80&h=50",
    titleKey: "slide.2.title",
    subKey: "slide.2.sub",
    badge: "No-Gi Pan-American",
  },
  {
    image: heroBlackBeltUrl,
    thumb: heroBlackBeltUrl,
    titleKey: "slide.3.title",
    subKey: "slide.3.sub",
    badge: "Black Belt Registry",
  },
];

const SLIDE_TEXT: Record<string, { pt: string; en: string }> = {
  "slide.1.title": { pt: "A jornada para a glória começa agora", en: "The road to glory begins now" },
  "slide.1.sub": { pt: "60+ países. Um tatame. Uma lenda em formação.", en: "60+ countries. One mat. One legend in the making." },
  "slide.2.title": { pt: "Técnica pura, sem barreiras", en: "Pure technique, no holds barred" },
  "slide.2.sub": { pt: "Assista às novas estrelas do no-gi no palco global.", en: "Watch the rising stars of no-gi on the global stage." },
  "slide.3.title": { pt: "Honrando os que pavimentaram o caminho", en: "Honoring those who paved the way" },
  "slide.3.sub": { pt: "O registro de faixas pretas — um histórico permanente de excelência.", en: "The black belt registry — a permanent record of excellence." },
};

function HeroSlider() {
  const { lang, t } = useI18n();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);
  const slide = SLIDES[i];

  return (
    <section className="relative w-full overflow-hidden bg-black" style={{ height: "560px" }}>
      {SLIDES.map((s, idx) => (
        <div key={idx} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: idx === i ? 1 : 0 }}>
          <SafeImage src={s.image} alt={s.badge} fallbackLabel={s.badge} source="hero" wrapperClassName="absolute inset-0" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.3) 100%)" }} />
        </div>
      ))}

      <div className="relative z-10 max-w-[1280px] mx-auto h-full px-4 lg:px-12 flex items-center pb-32">
        <div className="max-w-2xl">
          <span className={cn(typo.label.sm, "inline-block bg-primary text-white px-3 py-1.5 mb-5 tracking-[0.12em]")}>
            {t("hero.featured")}
          </span>
          {/* Hero title intentionally uses fluid clamp() — token classes set font-family/case/tracking */}
          <h1
            className={cn(typo.heading.xl, "text-white leading-[1.0]")}
            style={{ fontSize: "clamp(36px, 6vw, 64px)", letterSpacing: "0.01em" }}
          >
            {SLIDE_TEXT[slide.titleKey]?.[lang]}
          </h1>
          <p className={cn(typo.body.lg, "mt-4 max-w-xl")} style={{ color: "rgba(255,255,255,0.75)" }}>
            {SLIDE_TEXT[slide.subKey]?.[lang]}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["BJJLF", slide.badge].map((b, k) => (
              <span key={k} className={cn(typo.label.sm, "px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 text-white tracking-[0.1em]")}>
                {b}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="primary" size="default">{t("hero.cta.learnMore")}</Button>
            <Button variant="outline" size="default">{t("hero.cta.register")}</Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ background: "rgba(0,0,0,0.4)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-12 py-3 flex items-center gap-3">
          <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
            {SLIDES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 shrink-0 transition-base text-left",
                  idx === i ? "border-l-[3px] border-gold bg-black/40" : "border-l-[3px] border-transparent hover:bg-black/30",
                )}
              >
                <SafeImage src={s.thumb} alt={s.badge} fallbackLabel={s.badge} source="hero-thumb" hideFallbackIcon wrapperClassName="h-10 w-16 shrink-0" />
                <div>
                  <div className={cn(typo.label.sm, "tracking-[0.08em]", idx === i ? "text-white" : "text-[#888]")}>
                    {s.badge}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length)}
              className="h-9 w-9 grid place-items-center border border-white/40 text-white hover:bg-white hover:text-black transition-base rounded-full"
              aria-label="Prev"
              style={{ borderRadius: "9999px" }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setI((p) => (p + 1) % SLIDES.length)}
              className="h-9 w-9 grid place-items-center border border-white/40 text-white hover:bg-white hover:text-black transition-base rounded-full"
              aria-label="Next"
              style={{ borderRadius: "9999px" }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function LocalSectionHeading({ title, action, dark = true }: { title: React.ReactNode; action?: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <h2 className={cn(typo.heading.lg, dark ? "text-foreground" : "text-[#0F0F0F]")}>{title}</h2>
      {action}
    </div>
  );
}

function EventsSection() {
  const { t, lang } = useI18n();
  return (
    <section className="py-16 lg:py-20" style={{ background: "#F7F9FC" }}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className={cn(typo.heading.lg)} style={{ color: "#111827" }}>{t("home.events.title")}</h2>
          <Link to="/about" className={cn(typo.button.md, "text-primary hover:text-primary-dark transition-base inline-flex items-center gap-1")}>
            {t("home.events.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {EVENTS.slice(0, 6).map((e) => {
            return (
              <Link
                key={e.id}
                to="/events/$eventId"
                params={{ eventId: e.id }}
                // /events parent declares validateSearch; the detail page
                // doesn't use list filters, so pass an empty search object.
                search={{}}
                className="rounded-none bg-white border border-[#E5E5E5] flex flex-col group cursor-pointer hover:border-primary hover:shadow-[0_8px_24px_rgba(196,30,58,0.15)] hover:-translate-y-[3px] no-underline"
                style={{ transition: "all 0.18s ease" }}
              >
                <article className="flex flex-col h-full">
                  <div className="relative">
                    <SafeImage
                      src={e.image}
                      alt={`${e.name} — Brazilian Jiu-Jitsu event`}
                      fallbackLabel={e.name}
                      source="event"
                      wrapperClassName="h-40 bg-[#F7F9FC]"
                    />
                    <EventBadge badge={e.badge} />
                  </div>
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col">
                    <h3 className={cn(typo.heading.sm, "text-[#0F0F0F] text-sm leading-tight")}>{e.name}</h3>
                    <div className={cn(typo.body.xs, "flex items-center gap-1.5 text-[#6B7280]")}>
                      <Calendar className="h-3.5 w-3.5" /> {formatDateShort(e.date, lang)}
                    </div>
                    <div className={cn(typo.body.xs, "flex items-center gap-1.5 text-[#6B7280]")}>
                      <MapPin className="h-3.5 w-3.5" /> {e.location}
                    </div>
                    <span className={cn(typo.button.sm, "mt-auto w-full h-9 rounded-none bg-primary group-hover:bg-primary-dark text-white transition-base inline-flex items-center justify-center")}>
                      {t("home.events.details")}
                    </span>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  const { t, lang } = useI18n();
  const items = NEWS.slice(0, 3);

  const categoryKey = (c: string) => `news.cat.${c.toLowerCase()}.label`;
  const titleKey = (id: string) => `news.item.${id}.title`;

  return (
    <section className="py-16 lg:py-20 bg-[#F7F9FC]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <LocalSectionHeading
          dark={false}
          title={t("home.news.title")}
          action={
            <Link to="/news" className={cn(typo.button.md, "text-primary hover:text-primary-dark transition-base inline-flex items-center gap-1")}>
              {t("home.news.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((n) => {
            const translatedCategory = t(categoryKey(n.category));
            const translatedTitle = t(titleKey(n.id));
            return (
              <Link key={n.id} to="/news" className="group bg-white border border-[#E5E5E5] hover:border-primary transition-base flex flex-col">
                <SafeImage
                  src={n.image}
                  alt={translatedTitle === titleKey(n.id) ? n.title : translatedTitle}
                  fallbackLabel={n.title}
                  source="news"
                  wrapperClassName="h-[180px]"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <span className={cn(typo.label.sm, "text-primary uppercase")}>
                    {translatedCategory === categoryKey(n.category) ? n.category.toUpperCase() : translatedCategory}
                  </span>
                  <h3 className={cn(typo.body.md, "text-[#111] font-semibold leading-[1.35]")}>
                    {translatedTitle === titleKey(n.id) ? n.title : translatedTitle}
                  </h3>
                  <div className={cn(typo.body.xs, "text-[#9CA3AF] mt-auto")}>
                    {formatDateShort(n.date, lang)} · 4 {t("home.news.minRead")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function RankingSection() {
  const { t } = useI18n();
  const [gender, setGender] = useState<"male" | "female">("male");
  const [belt, setBelt] = useState<"black" | "brown" | "purple" | "blue" | "white">("black");
  const [category, setCategory] = useState<"adult" | "master" | "juvenile">("adult");

  const giData = RANKINGS[`${gender}-gi`] ?? [];
  const nogiData = RANKINGS[`${gender}-nogi`] ?? [];

  const beltLabel = t(`home.ranking.belt${belt[0].toUpperCase()}${belt.slice(1)}`);
  const categoryLabel = t(`home.ranking.${category}`);
  const genderLabel = t(`home.ranking.${gender}`);

  return (
    <section className="py-16 lg:py-20 bg-background border-t border-b border-[#2A2A2A]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <LocalSectionHeading title={t("home.ranking.title")} />

        <div className="flex flex-wrap gap-6 mb-6 border-b border-[#2A2A2A] pb-4">
          <FilterGroup label={t("home.ranking.gender")} options={[{ v: "male", l: t("home.ranking.male") }, { v: "female", l: t("home.ranking.female") }]} value={gender} onChange={(v) => setGender(v as "male" | "female")} />
          <FilterGroup label={t("home.ranking.belt")} options={[{ v: "black", l: t("home.ranking.beltBlack") }, { v: "brown", l: t("home.ranking.beltBrown") }, { v: "purple", l: t("home.ranking.beltPurple") }, { v: "blue", l: t("home.ranking.beltBlue") }, { v: "white", l: t("home.ranking.beltWhite") }]} value={belt} onChange={(v) => setBelt(v as typeof belt)} />
          <FilterGroup label={t("home.ranking.category")} options={[{ v: "adult", l: t("home.ranking.adult") }, { v: "master", l: t("home.ranking.master") }, { v: "juvenile", l: t("home.ranking.juvenile") }]} value={category} onChange={(v) => setCategory(v as typeof category)} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <RankingPanel title={`${genderLabel} · ${categoryLabel} · ${beltLabel}`} data={giData} mode="gi" t={t} />
          <RankingPanel title={`${genderLabel} · ${categoryLabel} · ${beltLabel}`} data={nogiData} mode="nogi" t={t} />
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className={cn(typo.label.sm, "tracking-[0.15em]")}>{label}</span>
      <div className="flex gap-3">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              typo.body.sm,
              "pb-1 transition-base",
              value === o.v ? "text-foreground font-bold border-b-2 border-gold" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function RankingPanel({ title, data, mode, t }: { title: string; data: { rank: number; athlete: string; country: string; academy: string; points: number }[]; mode: "gi" | "nogi"; t: (k: string) => string }) {
  const [activeMode, setActiveMode] = useState<"gi" | "nogi">(mode);
  return (
    <div className="bg-dark border border-[#2A2A2A]">
      <div className="bg-navbar px-5 py-3.5 flex items-center justify-between border-b border-[#2A2A2A]">
        <h3 className={cn(typo.heading.sm, "text-white text-[13px]")}>{title}</h3>
        <div className="flex gap-1">
          {(["gi", "nogi"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={cn(
                typo.button.sm,
                "px-3 py-1 transition-base",
                activeMode === m ? "bg-primary text-white" : "border border-[#444] text-muted-foreground hover:text-white hover:border-[#666]",
              )}
            >
              {m === "gi" ? t("home.ranking.gi") : t("home.ranking.nogi")}
            </button>
          ))}
        </div>
      </div>

      <div>
        {data.map((r) => (
          <div key={r.rank} className="px-5 py-3.5 flex items-center gap-4 border-b border-[#2A2A2A] hover:bg-dark-2 transition-base">
            <div className={cn(typo.heading.sm, "text-gold w-8 text-center text-[20px]")}>{r.rank}</div>
            <div className="flex-1 min-w-0">
              <div className={cn(typo.body.sm, "text-white font-semibold truncate")}>
                {flagEmoji(r.country)} {r.athlete}
              </div>
              <div className={cn(typo.body.xs, "text-[#888] truncate")}>{r.academy}</div>
            </div>
            <div className={cn(typo.heading.sm, "text-gold text-right text-[18px]")}>{r.points.toLocaleString("en-US")}</div>
          </div>
        ))}
      </div>

      <Link to="/about" className={cn(typo.button.sm, "block bg-navbar text-center py-3 text-gold hover:text-gold-light transition-base")}>
        {t("home.ranking.viewFull")} →
      </Link>
    </div>
  );
}

function flagEmoji(code: string) {
  const map: Record<string, string> = { BR: "🇧🇷", US: "🇺🇸", PT: "🇵🇹", JP: "🇯🇵", UK: "🇬🇧", MX: "🇲🇽", KR: "🇰🇷" };
  return map[code] ?? "🏳️";
}

function CTASection() {
  const { t } = useI18n();
  return (
    <section className="bg-dark py-16">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 grid md:grid-cols-2 gap-5">
        <Link to="/register/athlete" className="bg-dark-2 border border-[#333] p-7 transition-base hover:bg-dark-3 group" style={{ borderLeft: "4px solid #C41E3A" }}>
          <div className="h-12 w-12 grid place-items-center bg-primary mb-5">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3 className={cn(typo.heading.md, "text-white mb-3")}>{t("home.cta.athleteTitle")}</h3>
          <p className={cn(typo.body.sm, "text-[#999] mb-5 max-w-md")}>{t("home.cta.athleteDesc")}</p>
          <span className={cn(typo.button.md, "inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 group-hover:bg-primary-dark transition-base")}>
            {t("home.cta.athleteBtn")} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link to="/register/academy" className="bg-dark-2 border border-[#333] p-7 transition-base hover:bg-dark-3 group" style={{ borderLeft: "4px solid #B8960C" }}>
          <div className="h-12 w-12 grid place-items-center bg-gold mb-5">
            <Building2 className="h-6 w-6 text-[#0F0F0F]" />
          </div>
          <h3 className={cn(typo.heading.md, "text-white mb-3")}>{t("home.cta.academyTitle")}</h3>
          <p className={cn(typo.body.sm, "text-[#999] mb-5 max-w-md")}>{t("home.cta.academyDesc")}</p>
          <span className={cn(typo.button.md, "inline-flex items-center gap-2 bg-gold text-[#0F0F0F] px-5 py-2.5 group-hover:bg-gold-light transition-base")}>
            {t("home.cta.academyBtn")} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}

function YouTubeSection() {
  const { t } = useI18n();
  const videos = [
    { t: "World Championship 2024 — Best Submissions", img: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=500&h=280" },
    { t: "Black Belt Promotions Ceremony", img: youtubeBlackBeltImg },
    { t: "Mestre Roberto — A Life on the Mat", img: youtubeMestreRobertoImg },
  ];
  return (
    <section className="lg:py-20 bg-white" style={{ paddingTop: "80px", paddingBottom: "80px" }}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <LocalSectionHeading
          dark={false}
          title={t("home.youtube.title")}
          action={
            <a href="#" className={cn(typo.button.md, "text-primary hover:text-primary-dark transition-base inline-flex items-center gap-1")}>
              {t("home.youtube.visit")} <ArrowRight className="h-3.5 w-3.5" />
            </a>
          }
        />
        <div className="grid md:grid-cols-3 gap-4">
          {videos.map((v, i) => (
            <a key={i} href="#" className="group bg-white border border-[#E5E5E5] hover:border-primary transition-base">
              <div className="relative aspect-video bg-[#1A1A1A] overflow-hidden">
                <SafeImage src={v.img} alt={v.t} fallbackLabel={v.t} source="video" wrapperClassName="absolute inset-0" className="opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="h-14 w-14 rounded-full bg-primary grid place-items-center group-hover:scale-110 transition-transform" style={{ borderRadius: "9999px" }}>
                    <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h4 className={cn(typo.body.sm, "text-[#111] font-semibold")}>{v.t}</h4>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div>
      <HeroSlider />
      <EventsSection />
      <NewsSection />
      <RankingSection />
      <CTASection />
      <YouTubeSection />
    </div>
  );
}
