import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Play, ArrowRight, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENTS, RANKINGS } from "@/data/events";
import { NEWS } from "@/data/news";
import { useI18n, formatDateShort } from "@/lib/i18n";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const SLIDES = [
  {
    image: hero1,
    titleKey: "slide.1.title",
    subKey: "slide.1.sub",
    badge: "BJJLF World Championship 2025",
  },
  {
    image: hero2,
    titleKey: "slide.2.title",
    subKey: "slide.2.sub",
    badge: "No-Gi Pan-American",
  },
  {
    image: hero3,
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
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: idx === i ? 1 : 0 }}
        >
          <img src={s.image} alt="" className="h-full w-full object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.3) 100%)",
            }}
          />
        </div>
      ))}

      <div className="relative z-10 max-w-[1280px] mx-auto h-full px-4 lg:px-12 flex items-center pb-32">
        <div className="max-w-2xl">
          <span className="inline-block bg-primary text-white px-3 py-1.5 mb-5 text-[11px] uppercase tracking-[0.12em] font-bold">
            {t("hero.featured")}
          </span>
          <h1
            className="font-display text-white leading-[1.0]"
            style={{ fontSize: "clamp(36px, 6vw, 64px)", fontWeight: 900, letterSpacing: "0.01em" }}
          >
            {SLIDE_TEXT[slide.titleKey]?.[lang]}
          </h1>
          <p
            className="mt-4 max-w-xl text-[16px]"
            style={{ color: "rgba(255,255,255,0.75)", fontFamily: "DM Sans" }}
          >
            {SLIDE_TEXT[slide.subKey]?.[lang]}
          </p>

          {/* Partner badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {["BJJLF", slide.badge].map((b, k) => (
              <span
                key={k}
                className="px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 text-white text-[10px] uppercase tracking-[0.1em] font-bold"
              >
                {b}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="primary" size="default">
              {t("hero.cta.learnMore")}
            </Button>
            <Button variant="outline" size="default">
              {t("hero.cta.register")}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom slide thumbnails */}
      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ background: "rgba(0,0,0,0.4)" }}>
        <div className="max-w-[1280px] mx-auto px-4 lg:px-12 py-3 flex items-center gap-3">
          <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
            {SLIDES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`flex items-center gap-3 px-3 py-2 shrink-0 transition-base text-left ${
                  idx === i ? "border-l-[3px] border-gold bg-black/40" : "border-l-[3px] border-transparent hover:bg-black/30"
                }`}
              >
                <img src={s.image} alt="" className="h-10 w-16 object-cover" />
                <div>
                  <div
                    className={`text-[10px] uppercase tracking-[0.08em] ${idx === i ? "text-white" : "text-[#888]"}`}
                    style={{ fontFamily: "DM Sans", fontWeight: 600 }}
                  >
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

function SectionHeading({ title, action, dark = true }: { title: React.ReactNode; action?: React.ReactNode; dark?: boolean }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <h2
        className={`font-display ${dark ? "text-foreground" : "text-[#0F0F0F]"}`}
        style={{ fontSize: "clamp(22px, 3vw, 32px)", fontWeight: 900, letterSpacing: "0.02em" }}
      >
        {title}
      </h2>
      {action}
    </div>
  );
}

function EventsSection() {
  const { t, lang } = useI18n();
  return (
    <section className="py-16 lg:py-20 bg-background">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <SectionHeading
          title={t("home.events.title")}
          action={
            <Link to="/about" className="text-primary text-[13px] uppercase tracking-[0.08em] font-bold hover:text-primary-dark transition-base inline-flex items-center gap-1">
              {t("home.events.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))" }}>
          {EVENTS.slice(0, 6).map((e) => (
            <article
              key={e.id}
              className="bg-white border border-[#E5E5E5] hover:border-primary transition-base group"
              style={{ boxShadow: "0 0 0 0 transparent" }}
            >
              <div className="bg-[#F7F9FC] p-4 h-[100px] grid place-items-center">
                <img src={e.image} alt={e.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
              <div className="p-4 space-y-2.5">
                <h3
                  className="text-[14px] text-[#0F0F0F] leading-tight uppercase"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 800, letterSpacing: "0.02em" }}
                >
                  {e.name}
                </h3>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                  <Calendar className="h-3.5 w-3.5" /> {formatDateShort(e.date, lang)}
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#6B7280]">
                  <MapPin className="h-3.5 w-3.5" /> {e.location}
                </div>
                <button className="w-full h-8 bg-primary hover:bg-primary-dark text-white text-[11px] uppercase tracking-[0.08em] font-bold transition-base">
                  {t("home.events.register")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSection() {
  const { t, lang } = useI18n();
  const items = NEWS.slice(0, 3);
  return (
    <section className="py-16 lg:py-20 bg-[#F7F9FC]">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <SectionHeading
          title={t("home.news.title")}
          action={
            <Link to="/news" className="text-primary text-[13px] uppercase tracking-[0.08em] font-bold hover:text-primary-dark transition-base inline-flex items-center gap-1">
              {t("home.news.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        />
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((n) => (
            <Link key={n.id} to="/news" className="group bg-white border border-[#E5E5E5] hover:border-primary transition-base flex flex-col">
              <div className="relative h-[180px] overflow-hidden bg-[#E5E5E5]">
                <img src={n.image} alt={n.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4 flex-1 flex flex-col gap-2">
                <span
                  className="text-[11px] uppercase tracking-[0.1em] text-primary"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
                >
                  {n.category}
                </span>
                <h3
                  className="text-[16px] text-[#111] leading-[1.35]"
                  style={{ fontFamily: "DM Sans", fontWeight: 600 }}
                >
                  {n.title}
                </h3>
                <div className="text-[12px] text-[#9CA3AF] mt-auto">
                  {formatDateShort(n.date, lang)} · 4 min read
                </div>
              </div>
            </Link>
          ))}
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
        <SectionHeading title={t("home.ranking.title")} />

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-6 mb-6 border-b border-[#2A2A2A] pb-4">
          <FilterGroup
            label="Gender"
            options={[
              { v: "male", l: t("home.ranking.male") },
              { v: "female", l: t("home.ranking.female") },
            ]}
            value={gender}
            onChange={(v) => setGender(v as "male" | "female")}
          />
          <FilterGroup
            label="Belt"
            options={[
              { v: "black", l: t("home.ranking.beltBlack") },
              { v: "brown", l: t("home.ranking.beltBrown") },
              { v: "purple", l: t("home.ranking.beltPurple") },
              { v: "blue", l: t("home.ranking.beltBlue") },
              { v: "white", l: t("home.ranking.beltWhite") },
            ]}
            value={belt}
            onChange={(v) => setBelt(v as typeof belt)}
          />
          <FilterGroup
            label="Category"
            options={[
              { v: "adult", l: t("home.ranking.adult") },
              { v: "master", l: t("home.ranking.master") },
              { v: "juvenile", l: t("home.ranking.juvenile") },
            ]}
            value={category}
            onChange={(v) => setCategory(v as typeof category)}
          />
        </div>

        {/* Two panels */}
        <div className="grid md:grid-cols-2 gap-4">
          <RankingPanel
            title={`${genderLabel} · ${categoryLabel} · ${beltLabel}`}
            data={giData}
            mode="gi"
            t={t}
          />
          <RankingPanel
            title={`${genderLabel} · ${categoryLabel} · ${beltLabel}`}
            data={nogiData}
            mode="nogi"
            t={t}
          />
        </div>
      </div>
    </section>
  );
}

function FilterGroup({ label, options, value, onChange }: { label: string; options: { v: string; l: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground" style={{ fontFamily: "DM Sans", fontWeight: 600 }}>{label}</span>
      <div className="flex gap-3">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`text-[13px] pb-1 transition-base ${
              value === o.v ? "text-foreground font-bold border-b-2 border-gold" : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "DM Sans" }}
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
      {/* Header */}
      <div className="bg-navbar px-5 py-3.5 flex items-center justify-between border-b border-[#2A2A2A]">
        <h3
          className="text-white text-[13px] uppercase tracking-[0.05em]"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
        >
          {title}
        </h3>
        <div className="flex gap-1">
          {(["gi", "nogi"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`px-3 py-1 text-[11px] uppercase tracking-[0.1em] font-bold transition-base ${
                activeMode === m
                  ? "bg-primary text-white"
                  : "border border-[#444] text-muted-foreground hover:text-white hover:border-[#666]"
              }`}
            >
              {m === "gi" ? t("home.ranking.gi") : t("home.ranking.nogi")}
            </button>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div>
        {data.map((r) => (
          <div key={r.rank} className="px-5 py-3.5 flex items-center gap-4 border-b border-[#2A2A2A] hover:bg-dark-2 transition-base">
            <div
              className="text-gold w-8 text-center"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: "20px" }}
            >
              {r.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-white text-[14px] truncate"
                style={{ fontFamily: "DM Sans", fontWeight: 600 }}
              >
                {flagEmoji(r.country)} {r.athlete}
              </div>
              <div className="text-[#888] text-[12px] truncate" style={{ fontFamily: "DM Sans" }}>
                {r.academy}
              </div>
            </div>
            <div
              className="text-gold text-right"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: "18px" }}
            >
              {r.points.toLocaleString("en-US")}
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/about"
        className="block bg-navbar text-center py-3 text-gold text-[12px] uppercase tracking-[0.1em] font-bold hover:text-gold-light transition-base"
      >
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
        <Link
          to="/register/athlete"
          className="bg-dark-2 border border-[#333] p-7 transition-base hover:bg-dark-3 group"
          style={{ borderLeft: "4px solid #C41E3A" }}
        >
          <div className="h-12 w-12 grid place-items-center bg-primary mb-5">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3
            className="text-white mb-3"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "24px", letterSpacing: "0.02em" }}
          >
            {t("home.cta.athleteTitle")}
          </h3>
          <p className="text-[#999] text-[14px] mb-5 max-w-md" style={{ fontFamily: "DM Sans" }}>
            {t("home.cta.athleteDesc")}
          </p>
          <span className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 text-[12px] uppercase tracking-[0.08em] font-bold group-hover:bg-primary-dark transition-base">
            {t("home.cta.athleteBtn")} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          to="/register/academy"
          className="bg-dark-2 border border-[#333] p-7 transition-base hover:bg-dark-3 group"
          style={{ borderLeft: "4px solid #B8960C" }}
        >
          <div className="h-12 w-12 grid place-items-center bg-gold mb-5">
            <Building2 className="h-6 w-6 text-[#0F0F0F]" />
          </div>
          <h3
            className="text-white mb-3"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800, fontSize: "24px", letterSpacing: "0.02em" }}
          >
            {t("home.cta.academyTitle")}
          </h3>
          <p className="text-[#999] text-[14px] mb-5 max-w-md" style={{ fontFamily: "DM Sans" }}>
            {t("home.cta.academyDesc")}
          </p>
          <span className="inline-flex items-center gap-2 bg-gold text-[#0F0F0F] px-5 py-2.5 text-[12px] uppercase tracking-[0.08em] font-bold group-hover:bg-gold-light transition-base">
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
    { t: "World Championship 2024 — Best Submissions", img: "https://images.unsplash.com/photo-1554482585-c2e0b6c2cf80?auto=format&fit=crop&w=700&q=70" },
    { t: "Black Belt Promotions Ceremony", img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=700&q=70" },
    { t: "Mestre Roberto — A Life on the Mat", img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=700&q=70" },
  ];
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <SectionHeading
          title={<span className="text-[#0F0F0F]">{t("home.youtube.title")}</span> as unknown as string}
          action={
            <a href="#" className="text-primary text-[13px] uppercase tracking-[0.08em] font-bold hover:text-primary-dark transition-base inline-flex items-center gap-1">
              {t("home.youtube.visit")} <ArrowRight className="h-3.5 w-3.5" />
            </a>
          }
        />
        <div className="grid md:grid-cols-3 gap-4">
          {videos.map((v, i) => (
            <a key={i} href="#" className="group bg-white border border-[#E5E5E5] hover:border-primary transition-base">
              <div className="relative aspect-video bg-[#1A1A1A] overflow-hidden">
                <img src={v.img} alt={v.t} loading="lazy" className="h-full w-full object-cover opacity-70 group-hover:opacity-90 transition-opacity" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="h-14 w-14 rounded-full bg-primary grid place-items-center group-hover:scale-110 transition-transform" style={{ borderRadius: "9999px" }}>
                    <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h4 className="text-[13px] text-[#111]" style={{ fontFamily: "DM Sans", fontWeight: 600 }}>{v.t}</h4>
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
