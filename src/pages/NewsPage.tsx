import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Calendar, ChevronLeft, ChevronRight, ArrowRight, Newspaper } from "lucide-react";
import { PageHero } from "@/components/Stepper";
import { type NewsItem } from "@/data/news";
import { useNews } from "@/lib/queries";
import { useI18n, formatDateShort, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Tournaments", "Promotions", "Athletes", "Federation"] as const;

function useTranslateNews() {
  const { t, lang } = useI18n();

  const translateCategory = (c: string) => {
    if (c === "All") return t("news.cat.all");
    const key = `news.cat.${c.toLowerCase()}.label`;
    const translated = t(key);
    return translated === key ? c.toUpperCase() : translated;
  };

  const translateTitle = (n: NewsItem) => {
    const key = `news.item.${n.id}.title`;
    const translated = t(key);
    return translated === key ? n.title : translated;
  };

  return { t, lang, translateCategory, translateTitle };
}

export function NewsPage() {
  const { t, lang, translateCategory, translateTitle } = useTranslateNews();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const { data: news = [], isLoading } = useNews();
  const filtered = cat === "All" ? news : news.filter((n) => n.category === cat);
  const featured = filtered.find((n) => n.featured) ?? filtered[0];
  const rest = filtered.filter((n) => n.id !== featured?.id);
  const pages = Math.max(1, Math.ceil(rest.length / perPage));
  const visible = rest.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-white min-h-screen">
      <PageHero
        kicker={t("news.kicker")}
        title={t("news.title")}
        desc={t("news.subtitle")}
        breadcrumb={[
          { label: t("nav.news") },
        ]}
      />

      {/* Sticky white category filter bar */}
      <div
        className="sticky z-40 bg-white border-b border-gray-200"
        style={{ top: "64px" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-x-6 gap-y-2 items-center">
          {CATEGORIES.map((c) => {
            const active = cat === c;
            return (
              <button
                key={c}
                onClick={() => {
                  setCat(c);
                  setPage(1);
                }}
                className={cn(
                  "py-1 text-sm uppercase tracking-widest transition-base border-b-2",
                  active
                    ? "text-[#C8211A] border-[#C8211A]"
                    : "text-gray-400 border-transparent hover:text-gray-900",
                )}
                style={{ fontFamily: "Barlow", fontWeight: 600 }}
              >
                {translateCategory(c)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured */}
      {featured && (
        <section className="bg-white py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-6">
            <article className="grid lg:grid-cols-[3fr,2fr] gap-0 items-stretch bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-base overflow-hidden">
              <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-gray-100">
                <img
                  src={featured.image}
                  alt={translateTitle(featured)}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className="bg-[#C8211A] text-white px-2 py-0.5 rounded text-xs uppercase tracking-widest"
                    style={{ fontFamily: "Barlow", fontWeight: 700 }}
                  >
                    {t("news.featured")}
                  </span>
                  <span
                    className="text-xs uppercase tracking-widest text-[#C8211A]"
                    style={{ fontFamily: "Barlow", fontWeight: 700 }}
                  >
                    {translateCategory(featured.category)}
                  </span>
                </div>
                <h2
                  className="mb-4 text-2xl md:text-3xl text-gray-900 leading-tight"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                >
                  {translateTitle(featured)}
                </h2>
                <p
                  className="mb-5 text-base text-gray-600 leading-[1.7]"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  {featured.excerpt}
                </p>
                <div
                  className="mb-6 flex items-center gap-2 text-sm text-gray-500"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  <Calendar className="h-3.5 w-3.5 text-[#C8A84B]" /> {formatDateShort(featured.date, lang)} · {featured.author}
                </div>
                <span
                  className="self-start inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest transition-base"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                >
                  {t("news.readStory")} <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-6">
          {visible.length === 0 ? (
            <div className="bg-white rounded-xl py-16 px-6 text-center flex flex-col items-center justify-center">
              <Newspaper
                className="text-[#C8211A]"
                style={{ width: 64, height: 64 }}
                aria-hidden
              />
              <h3
                className="mt-5 text-[#1A1A1A]"
                style={{ fontFamily: "Bebas Neue, Barlow Condensed, sans-serif", fontSize: "24px", letterSpacing: "0.04em" }}
              >
                Nenhuma notícia disponível
              </h3>
              <p
                className="mt-2 max-w-md mx-auto text-[#666666]"
                style={{ fontFamily: "Barlow", fontSize: "14px", fontWeight: 400, lineHeight: 1.6 }}
              >
                Em breve novidades da federação por aqui.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visible.map((n) => (
                <NewsCard
                  key={n.id}
                  n={n}
                  lang={lang}
                  t={t}
                  title={translateTitle(n)}
                  categoryLabel={translateCategory(n.category)}
                />
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-10 w-10 grid place-items-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-[#C8211A] hover:text-[#C8211A] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-base"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-10 w-10 rounded-md text-sm transition-base",
                    p === page
                      ? "bg-[#C8211A] text-white border border-[#C8211A]"
                      : "border border-gray-200 bg-white text-gray-700 hover:border-[#C8211A] hover:text-[#C8211A]",
                  )}
                  style={{ fontFamily: "Barlow", fontWeight: 600 }}
                >
                  {p}
                </button>
              ))}
              <button
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
                className="h-10 w-10 grid place-items-center rounded-md border border-gray-200 bg-white text-gray-700 hover:border-[#C8211A] hover:text-[#C8211A] disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-base"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function NewsCard({
  n,
  lang,
  t,
  title,
  categoryLabel,
}: {
  n: NewsItem;
  lang: Lang;
  t: (k: string) => string;
  title: string;
  categoryLabel: string;
}) {
  return (
    <Link
      to="/news"
      className="group flex flex-col bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-base overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={n.image}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex-1 flex flex-col">
        <span
          className="px-5 mt-4 text-xs uppercase tracking-widest text-[#C8211A]"
          style={{ fontFamily: "Barlow", fontWeight: 700 }}
        >
          {categoryLabel}
        </span>
        <h3
          className="px-5 mt-1 text-xl text-gray-900 leading-tight"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          {title}
        </h3>
        <p
          className="px-5 mt-2 text-sm text-gray-500 line-clamp-2 leading-[1.6]"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          {n.excerpt}
        </p>
        <div
          className="mt-3 mx-5 mb-5 pt-3 border-t border-gray-100 text-xs text-gray-400"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          {formatDateShort(n.date, lang)} · 4 {t("home.news.minRead")}
        </div>
      </div>
    </Link>
  );
}
