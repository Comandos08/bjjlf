import { useState } from "react";
import { PageHero } from "@/components/Stepper";
import { NEWS, type NewsItem } from "@/data/news";
import { Calendar, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Tournaments", "Promotions", "Athletes", "Federation"] as const;

export function NewsPage() {
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
      <PageHero kicker="Newsroom" title="News & Updates" desc="Tournament results, promotions, athlete spotlights, and federation announcements." />

      {featured && (
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-6">
            <article className="grid lg:grid-cols-2 gap-8 items-stretch bg-card border border-border overflow-hidden border-gold-hover">
              <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
                <img src={featured.image} alt={featured.title} className="h-full w-full object-cover" loading="lazy" />
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <span className="self-start bg-primary text-primary-foreground px-3 py-1 text-xs font-heading uppercase tracking-wider mb-4">Featured · {featured.category}</span>
                <h2 className="font-display text-3xl md:text-5xl tracking-wider leading-tight mb-4">{featured.title}</h2>
                <p className="text-foreground/70 mb-5">{featured.excerpt}</p>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2"><Calendar className="h-3 w-3 text-gold" /> {fmt(featured.date)} · {featured.author}</div>
                <Button variant="primary" className="self-start font-heading uppercase tracking-wider">Read story <ArrowRight /></Button>
              </div>
            </article>
          </div>
        </section>
      )}

      <section className="py-8">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => { setCat(c); setPage(1); }} className={`px-4 py-2 font-heading uppercase tracking-wider text-xs border transition-colors ${cat === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-foreground/70 hover:border-gold hover:text-foreground"}`}>{c}</button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visible.map((n) => <NewsCard key={n.id} n={n} />)}
          </div>

          {pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="h-10 w-10 grid place-items-center border border-border disabled:opacity-30 hover:border-gold"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`h-10 w-10 font-heading ${p === page ? "bg-primary text-primary-foreground" : "border border-border hover:border-gold"}`}>{p}</button>
              ))}
              <button disabled={page === pages} onClick={() => setPage((p) => p + 1)} className="h-10 w-10 grid place-items-center border border-border disabled:opacity-30 hover:border-gold"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function NewsCard({ n }: { n: NewsItem }) {
  return (
    <article className="bg-card border border-border overflow-hidden border-gold-hover group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img src={n.image} alt={n.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute top-3 left-3 bg-gold text-gold-foreground px-2 py-0.5 text-xs font-heading uppercase tracking-wider">{n.category}</span>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-3">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{fmt(n.date)} · {n.author}</span>
        <h3 className="font-display text-xl md:text-2xl tracking-wider leading-tight group-hover:text-gold transition-colors">{n.title}</h3>
        <p className="text-sm text-foreground/70 line-clamp-3">{n.excerpt}</p>
        <span className="mt-auto inline-flex items-center gap-1 text-primary font-heading uppercase text-sm tracking-wider">Read <ArrowRight className="h-4 w-4" /></span>
      </div>
    </article>
  );
}

const fmt = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
