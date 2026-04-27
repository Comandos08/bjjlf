import { useState } from "react";
import { PageHero } from "@/components/Stepper";
import { NEWS, type NewsItem } from "@/data/news";
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { useI18n, formatDateShort, type Lang } from "@/lib/i18n";

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

  const filtered = cat === "All" ? NEWS : NEWS.filter((n) => n.category === cat);
  const featured = filtered.find((n) => n.featured) ?? filtered[0];
  const rest = filtered.filter((n) => n.id !== featured?.id);
  const pages = Math.max(1, Math.ceil(rest.length / perPage));
  const visible = rest.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <PageHero kicker={t("news.kicker")} title={t("news.title")} desc={t("news.subtitle")} />

      {featured && (
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-6">
            <article className="grid lg:grid-cols-2 gap-8 items-stretch bg-card border border-border overflow-hidden border-gold-hover">
              <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                <img src={featured.image} alt={translateTitle(featured)} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className={cn(typo.label.sm, "self-start bg-primary text-primary-foreground px-3 py-1 mb-4")}>
                  {t("news.featured")} · {translateCategory(featured.category)}
                </span>
                <h2 className={cn(typo.heading.lg, "mb-4")}>{translateTitle(featured)}</h2>
                <p className={cn(typo.body.md, "mb-5")}>{featured.excerpt}</p>
                <div className={cn(typo.label.sm, "mb-6 flex items-center gap-2")}>
                  <Calendar className="h-3 w-3 text-gold" /> {formatDateShort(featured.date, lang)} · {featured.author}
                </div>
                <Button variant="primary" className={cn(typo.button.md, "self-start")}>
                  {t("news.readStory")} <ArrowRight />
                </Button>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => { setCat(c); setPage(1); }}
                className={cn(
                  typo.button.sm,
                  "px-4 py-2 border transition-colors",
                  cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:border-gold hover:text-foreground",
                )}
              >
                {translateCategory(c)}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-10 w-10 grid place-items-center border border-border disabled:opacity-30 hover:border-gold"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={cn(typo.button.md, "h-10 w-10", p === page ? "bg-primary text-primary-foreground" : "border border-border hover:border-gold")}>{p}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="h-10 w-10 grid place-items-center border border-border disabled:opacity-30 hover:border-gold"><ChevronRight className="h-4 w-4" /></button>
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
    <article className="bg-card border border-border overflow-hidden border-gold-hover group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={n.image} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className={cn(typo.label.sm, "absolute top-3 left-3 bg-gold text-gold-foreground px-2 py-0.5")}>{categoryLabel}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-3">
        <span className={typo.label.sm}>{formatDateShort(n.date, lang)} · {n.author} · 4 {t("home.news.minRead")}</span>
        <h3 className={cn(typo.heading.sm, "group-hover:text-gold transition-colors")}>{title}</h3>
        <p className={cn(typo.body.sm, "line-clamp-3")}>{n.excerpt}</p>
        <span className={cn(typo.button.md, "mt-auto inline-flex items-center gap-1 text-primary")}>{t("news.read")} <ArrowRight className="h-4 w-4" /></span>
      </div>
    </article>
  );
}
