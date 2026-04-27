import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Play, ArrowRight, Users, Building2 } from "lucide-react";

import { useEvents, useNews, useRankings } from "@/lib/queries";
import { useI18n, formatDateShort } from "@/lib/i18n";
import { SafeImage } from "@/components/SafeImage";
import { EventBadge } from "@/components/EventBadge";
import { HomeStats } from "@/components/HomeStats";
import { LazyYouTube } from "@/components/LazyYouTube";
// FIX A + FIX C: pin BJJ images locally so the Unsplash CDN can't swap them
// for unrelated photos (tennis, gym, photographer) the way it has been doing
// when the same photo ID is requested at different sizes.
import heroBlackBeltUrl from "@/assets/hero-3-bjj.jpg";
import youtubeBlackBeltImg from "@/assets/youtube-black-belt-promotions.jpg";
import youtubeMestreRobertoImg from "@/assets/youtube-mestre-roberto.jpg";

const SLIDES: ReadonlyArray<{
  image: string;
  thumb: string;
  titleKey: string;
  subKey: string;
  badge: string;
  event_id?: string;
}> = [
  {
    image: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=1440&h=600",
    thumb: "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=80&h=50",
    titleKey: "slide.1.title",
    subKey: "slide.1.sub",
    badge: "BJJLF World Championship 2025",
    event_id: "wc25",
  },
  {
    image: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=1440&h=600",
    thumb: "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?auto=format&fit=crop&w=80&h=50",
    titleKey: "slide.2.title",
    subKey: "slide.2.sub",
    badge: "No-Gi Pan-American",
    event_id: "eu25",
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
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [paused]);
  const slide = SLIDES[i];

  return (
    <section
      className="relative w-full overflow-hidden bg-black group/hero"
      style={{ height: "560px" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((s, idx) => (
        <div key={idx} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: idx === i ? 1 : 0 }}>
          <SafeImage src={s.image} alt={s.badge} fallbackLabel={s.badge} source="hero" wrapperClassName="absolute inset-0" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.85) 40%, rgba(0,0,0,0.3) 100%)" }} />
        </div>
      ))}

      {/* Setas laterais (visíveis no hover desktop, sempre no mobile) */}
      <button
        onClick={() => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 grid place-items-center rounded-full bg-black/50 text-white border border-white/30 hover:bg-[#C8211A] hover:border-[#C8211A] transition md:opacity-0 md:group-hover/hero:opacity-100"
        aria-label="Anterior"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => setI((p) => (p + 1) % SLIDES.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-11 w-11 grid place-items-center rounded-full bg-black/50 text-white border border-white/30 hover:bg-[#C8211A] hover:border-[#C8211A] transition md:opacity-0 md:group-hover/hero:opacity-100"
        aria-label="Próxima"
      >
        <ChevronRight className="h-5 w-5" />
      </button>


      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 lg:px-12 flex items-center pb-32">
        <div className="max-w-2xl">
          <span
            className="inline-block bg-[#C8211A] text-white px-3 py-1.5 mb-5 text-xs uppercase tracking-widest rounded-md"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            {t("hero.featured")}
          </span>
          <h1
            className="font-display tracking-wider leading-[0.95] text-white"
            style={{ fontSize: "clamp(48px, 7vw, 96px)", letterSpacing: "0.04em" }}
          >
            {SLIDE_TEXT[slide.titleKey]?.[lang]}
          </h1>
          <p
            className="mt-4 max-w-xl text-lg leading-[1.6] text-gray-300"
            style={{ fontFamily: "Barlow", fontWeight: 400 }}
          >
            {SLIDE_TEXT[slide.subKey]?.[lang]}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {["BJJLF", slide.badge].map((b, k) => (
              <span
                key={k}
                className="px-3 py-1.5 bg-white/10 backdrop-blur border border-white/20 text-white text-xs uppercase tracking-widest rounded-md"
                style={{ fontFamily: "Barlow", fontWeight: 600 }}
              >
                {b}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {slide.event_id ? (
              <Link
                to="/events/$eventId"
                params={{ eventId: slide.event_id }}
                search={((prev: unknown) => prev) as never}
                className="inline-flex items-center justify-center rounded-md bg-white text-black hover:bg-gray-100 px-5 py-2.5 text-sm uppercase tracking-widest no-underline transition-base"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {t("hero.cta.learnMore")}
              </Link>
            ) : (
              <Link
                to="/events"
                search={((prev: unknown) => prev) as never}
                className="inline-flex items-center justify-center rounded-md bg-white text-black hover:bg-gray-100 px-5 py-2.5 text-sm uppercase tracking-widest no-underline transition-base"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {t("hero.cta.learnMore")}
              </Link>
            )}
            {slide.event_id ? (
              <Link
                to="/register/event/$eventId"
                params={{ eventId: slide.event_id }}
                className="inline-flex items-center justify-center rounded-md bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest no-underline transition-base"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {t("hero.cta.register")}
              </Link>
            ) : (
              <Link
                to="/events"
                search={((prev: unknown) => prev) as never}
                className="inline-flex items-center justify-center rounded-md bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest no-underline transition-base"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {t("hero.cta.register")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dots indicators (acima da barra de thumbs) */}
      <div className="absolute bottom-[88px] left-0 right-0 z-20 flex justify-center gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Ir para slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all ${
              idx === i ? "w-8 bg-[#C8211A]" : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ background: "rgba(0,0,0,0.4)" }}>
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-3 flex items-center gap-3">
          <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-hide">
            {SLIDES.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`flex items-center gap-3 px-3 py-2 shrink-0 transition-base text-left ${
                  idx === i ? "border-l-[3px] border-[#C8A84B] bg-black/40" : "border-l-[3px] border-transparent hover:bg-black/30"
                }`}
              >
                <SafeImage src={s.thumb} alt={s.badge} fallbackLabel={s.badge} source="hero-thumb" hideFallbackIcon wrapperClassName="h-10 w-16 shrink-0" />
                <div>
                  <div
                    className={`text-xs uppercase tracking-widest ${idx === i ? "text-white" : "text-gray-400"}`}
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
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

/**
 * Section header used across all light sections.
 * - Title: Barlow Condensed 700 uppercase, text-4xl md:text-5xl, gray-900
 * - Decorative red line below: 4px tall, 48px wide
 * - Optional "VER TODOS →" action: Barlow 600, text-sm, primary red
 */
function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { label: string; to?: string; href?: string };
}) {
  return (
    <div className="mb-12 flex items-end justify-between gap-4">
      <div>
        <h2
          className="text-4xl md:text-5xl uppercase tracking-wide text-gray-900"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          {title}
        </h2>
        <div className="mt-3 h-1 w-12 rounded bg-[#C8211A]" />
      </div>
      {action && (
        action.to ? (
          <Link
            to={action.to}
            className="inline-flex items-center gap-1 text-sm tracking-wide text-[#C8211A] hover:text-[#8B1612] transition-base"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            {action.label} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <a
            href={action.href ?? "#"}
            className="inline-flex items-center gap-1 text-sm tracking-wide text-[#C8211A] hover:text-[#8B1612] transition-base"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            {action.label} <ArrowRight className="h-3.5 w-3.5" />
          </a>
        )
      )}
    </div>
  );
}

function EventsSection() {
  const { t, lang } = useI18n();
  const { data: events = [] } = useEvents();
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title={t("home.events.title")}
          action={{ label: t("home.events.viewAll"), to: "/events" }}
        />
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 6).map((e) => (
            <article
              key={e.id}
              className="group flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-base overflow-hidden"
            >
              <Link
                to="/events/$eventId"
                params={{ eventId: e.id }}
                search={((prev: unknown) => prev) as never}
                className="block no-underline"
                aria-label={e.name}
              >
                <div className="relative">
                  <SafeImage
                    src={e.image}
                    alt={`${e.name} — Brazilian Jiu-Jitsu event`}
                    fallbackLabel={e.name}
                    source="event"
                    wrapperClassName="h-44 bg-gray-50"
                  />
                  <EventBadge badge={e.badge} />
                </div>
              </Link>
              <div className="p-5 space-y-3 flex-1 flex flex-col">
                <Link
                  to="/events/$eventId"
                  params={{ eventId: e.id }}
                  search={((prev: unknown) => prev) as never}
                  className="no-underline"
                >
                  <h3
                    className="text-xl uppercase text-gray-900 leading-tight hover:text-[#C8211A] transition-base"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    {e.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-1.5 text-sm text-gray-500" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
                  <Calendar className="h-3.5 w-3.5" /> {formatDateShort(e.date, lang)}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-500" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
                  <MapPin className="h-3.5 w-3.5" /> {e.location}
                </div>
                <div className="mt-auto flex flex-col gap-2">
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: e.id }}
                    search={((prev: unknown) => prev) as never}
                    className="w-full inline-flex items-center justify-center rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white text-sm uppercase tracking-widest py-3 transition-base no-underline"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    {t("home.events.details")}
                  </Link>
                  <Link
                    to="/register/event/$eventId"
                    params={{ eventId: e.id }}
                    className="w-full inline-flex items-center justify-center rounded-lg border border-[#C8211A] text-[#C8211A] hover:bg-[#C8211A] hover:text-white text-xs uppercase tracking-widest py-2 transition no-underline"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    Inscrever-se
                  </Link>
                </div>
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
  const { data: news = [] } = useNews();
  const items = news.slice(0, 3);

  const categoryKey = (c: string) => `news.cat.${c.toLowerCase()}.label`;
  const titleKey = (id: string) => `news.item.${id}.title`;

  return (
    <section className="bg-[#F2F2F2] border-t border-gray-200 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title={t("home.news.title")}
          action={{ label: t("home.news.viewAll"), to: "/news" }}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((n) => {
            const translatedCategory = t(categoryKey(n.category));
            const translatedTitle = t(titleKey(n.id));
            return (
              <Link
                key={n.id}
                to="/news"
                className="group flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-gray-300 transition-base overflow-hidden"
              >
                <SafeImage
                  src={n.image}
                  alt={translatedTitle === titleKey(n.id) ? n.title : translatedTitle}
                  fallbackLabel={n.title}
                  source="news"
                  wrapperClassName="h-[180px]"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-5 flex-1 flex flex-col gap-2">
                  <span
                    className="text-xs uppercase tracking-widest text-[#C8211A]"
                    style={{ fontFamily: "Barlow", fontWeight: 700 }}
                  >
                    {translatedCategory === categoryKey(n.category) ? n.category.toUpperCase() : translatedCategory}
                  </span>
                  <h3
                    className="text-lg leading-tight text-gray-900"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    {translatedTitle === titleKey(n.id) ? n.title : translatedTitle}
                  </h3>
                  <div className="text-xs text-gray-400 mt-auto" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
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

  const { data: rankings = {} } = useRankings();
  const giData = rankings[`${gender}-gi`] ?? [];
  const nogiData = rankings[`${gender}-nogi`] ?? [];

  const beltLabel = t(`home.ranking.belt${belt[0].toUpperCase()}${belt.slice(1)}`);
  const categoryLabel = t(`home.ranking.${category}`);
  const genderLabel = t(`home.ranking.${gender}`);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader title={t("home.ranking.title")} />

        <div className="flex flex-wrap gap-8 mb-8 border-b border-gray-200 pb-5">
          <FilterGroup
            label={t("home.ranking.gender")}
            options={[
              { v: "male", l: t("home.ranking.male") },
              { v: "female", l: t("home.ranking.female") },
            ]}
            value={gender}
            onChange={(v) => setGender(v as "male" | "female")}
          />
          <FilterGroup
            label={t("home.ranking.belt")}
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
            label={t("home.ranking.category")}
            options={[
              { v: "adult", l: t("home.ranking.adult") },
              { v: "master", l: t("home.ranking.master") },
              { v: "juvenile", l: t("home.ranking.juvenile") },
            ]}
            value={category}
            onChange={(v) => setCategory(v as typeof category)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <RankingPanel title={`${genderLabel} · ${categoryLabel} · ${beltLabel}`} data={giData} mode="gi" t={t} />
          <RankingPanel title={`${genderLabel} · ${categoryLabel} · ${beltLabel}`} data={nogiData} mode="nogi" t={t} />
        </div>
      </div>
    </section>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { v: string; l: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span
        className="text-xs uppercase tracking-widest text-gray-500"
        style={{ fontFamily: "Barlow", fontWeight: 600 }}
      >
        {label}
      </span>
      <div className="flex gap-4">
        {options.map((o) => (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={`pb-1 text-sm transition-base ${
              value === o.v
                ? "text-[#C8211A] font-semibold border-b-2 border-[#C8211A]"
                : "text-gray-500 hover:text-gray-900"
            }`}
            style={{ fontFamily: "Barlow", fontWeight: value === o.v ? 600 : 500 }}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function RankingPanel({
  title,
  data,
  mode,
  t,
}: {
  title: string;
  data: { rank: number; athlete: string; country: string; academy: string; points: number }[];
  mode: "gi" | "nogi";
  t: (k: string) => string;
}) {
  const [activeMode, setActiveMode] = useState<"gi" | "nogi">(mode);
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="bg-gray-50 px-5 py-4 flex items-center justify-between border-b border-gray-200">
        <h3
          className="text-sm uppercase tracking-wide text-gray-900"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          {title}
        </h3>
        <div className="flex gap-1">
          {(["gi", "nogi"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`px-3 py-1 text-xs uppercase tracking-widest rounded transition-base ${
                activeMode === m
                  ? "bg-[#C8211A] text-white"
                  : "border border-gray-300 text-gray-500 hover:text-gray-900 hover:border-gray-400"
              }`}
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              {m === "gi" ? t("home.ranking.gi") : t("home.ranking.nogi")}
            </button>
          ))}
        </div>
      </div>

      <div>
        {data.map((r) => (
          <div key={r.rank} className="px-5 py-4 flex items-center gap-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-base">
            <div
              className="w-8 text-center text-2xl text-gray-300"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
            >
              {r.rank}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 truncate" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
                {flagEmoji(r.country)} {r.athlete}
              </div>
              <div className="text-sm text-gray-500 truncate" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
                {r.academy}
              </div>
            </div>
            <div
              className="text-xl text-[#C8A84B] text-right"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
            >
              {r.points.toLocaleString("en-US")}
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/rankings"
        className="block bg-gray-50 hover:bg-gray-100 text-center py-3 text-sm text-[#C8211A] transition-base"
        style={{ fontFamily: "Barlow", fontWeight: 600 }}
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
    <section className="bg-[#F2F2F2] border-t border-gray-200 py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6">
        <Link
          to="/register/athlete"
          className="group bg-white border border-gray-200 rounded-xl p-8 transition-base hover:shadow-md"
          style={{ borderLeft: "4px solid #C8211A" }}
        >
          <div className="h-12 w-12 grid place-items-center bg-[#C8211A] mb-5 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <h3
            className="text-2xl uppercase text-gray-900 mb-3"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            {t("home.cta.athleteTitle")}
          </h3>
          <p className="text-base text-gray-600 mb-5 max-w-md leading-[1.7]" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
            {t("home.cta.athleteDesc")}
          </p>
          <span
            className="inline-flex items-center gap-2 bg-[#C8211A] group-hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest rounded-lg transition-base"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            {t("home.cta.athleteBtn")} <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          to="/register/academy"
          className="group bg-white border border-gray-200 rounded-xl p-8 transition-base hover:shadow-md"
          style={{ borderLeft: "4px solid #C8A84B" }}
        >
          <div className="h-12 w-12 grid place-items-center bg-[#C8A84B] mb-5 rounded-lg">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h3
            className="text-2xl uppercase text-gray-900 mb-3"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            {t("home.cta.academyTitle")}
          </h3>
          <p className="text-base text-gray-600 mb-5 max-w-md leading-[1.7]" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
            {t("home.cta.academyDesc")}
          </p>
          <span
            className="inline-flex items-center gap-2 bg-[#C8A84B] group-hover:bg-[#D4B962] text-white px-5 py-2.5 text-sm uppercase tracking-widest rounded-lg transition-base"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
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
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          title={t("home.youtube.title")}
          action={{ label: t("home.youtube.visit"), href: "#" }}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {videos.map((v, i) => (
            <a
              key={i}
              href="#"
              className="group flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-base overflow-hidden"
            >
              <div className="relative aspect-video bg-gray-900 overflow-hidden">
                <SafeImage src={v.img} alt={v.t} fallbackLabel={v.t} source="video" wrapperClassName="absolute inset-0" className="opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 grid place-items-center">
                  <span className="h-14 w-14 rounded-full bg-[#C8211A] grid place-items-center group-hover:scale-110 transition-transform" style={{ borderRadius: "9999px" }}>
                    <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h4
                  className="text-base text-gray-900 leading-tight"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                >
                  {v.t}
                </h4>
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
