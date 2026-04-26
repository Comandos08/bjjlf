import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Trophy, Users, Building2, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENTS, RANKINGS } from "@/data/events";
import { NEWS } from "@/data/news";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

const SLIDES = [
  { image: hero1, kicker: "World Championship 2025", title: "The road to glory begins now", desc: "60+ countries. One mat. One legend in the making.", cta: "Register" },
  { image: hero2, kicker: "No-Gi Pan-American", title: "Pure technique, no holds barred", desc: "Watch the rising stars of no-gi grappling on the global stage.", cta: "View Events" },
  { image: hero3, kicker: "Promotions & Legacy", title: "Honoring those who paved the way", desc: "The black belt registry — a permanent record of excellence.", cta: "Browse Graduates" },
];

function HeroSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, []);
  const slide = SLIDES[i];
  return (
    <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: idx === i ? 1 : 0 }}
        >
          <img src={s.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      ))}

      <div className="relative z-10 container mx-auto h-full px-4 lg:px-6 flex items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 border border-gold/40 bg-gold/10 text-gold uppercase text-xs tracking-[0.25em] font-heading">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
            {slide.kicker}
          </div>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-wider text-foreground">
            {slide.title.split(" ").map((w, k) => (
              <span key={k} className={k % 3 === 1 ? "text-primary" : ""}>{w} </span>
            ))}
          </h1>
          <p className="mt-5 max-w-lg text-base md:text-lg text-foreground/80">{slide.desc}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" size="lg" className="font-heading uppercase tracking-wider">{slide.cta}<ArrowRight /></Button>
            <Button variant="outline" size="lg" className="font-heading uppercase tracking-wider">Learn more</Button>
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1 transition-all ${idx === i ? "w-10 bg-primary" : "w-5 bg-foreground/30"}`}
          />
        ))}
      </div>

      {/* arrows */}
      <button onClick={() => setI((p) => (p - 1 + SLIDES.length) % SLIDES.length)} className="hidden md:grid absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 place-items-center bg-navbar/60 hover:bg-primary text-foreground transition-colors" aria-label="Prev">
        <ChevronLeft />
      </button>
      <button onClick={() => setI((p) => (p + 1) % SLIDES.length)} className="hidden md:grid absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 place-items-center bg-navbar/60 hover:bg-primary text-foreground transition-colors" aria-label="Next">
        <ChevronRight />
      </button>
    </section>
  );
}

function SectionTitle({ kicker, title, action }: { kicker: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <div>
        <p className="text-gold font-heading text-xs tracking-[0.3em] uppercase mb-2">{kicker}</p>
        <h2 className="font-display text-3xl md:text-5xl tracking-wider text-foreground">{title}</h2>
      </div>
      {action}
    </div>
  );
}

function EventsRail() {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionTitle
          kicker="Calendar"
          title="Upcoming Events"
          action={
            <div className="hidden md:flex gap-2">
              <button onClick={() => scroll(-1)} className="h-10 w-10 grid place-items-center border border-border hover:border-gold hover:text-gold transition-colors"><ChevronLeft className="h-4 w-4" /></button>
              <button onClick={() => scroll(1)} className="h-10 w-10 grid place-items-center border border-border hover:border-gold hover:text-gold transition-colors"><ChevronRight className="h-4 w-4" /></button>
            </div>
          }
        />
      </div>
      <div ref={ref} className="container mx-auto px-4 lg:px-6 flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory">
        {EVENTS.map((e) => (
          <article key={e.id} className="snap-start shrink-0 w-[300px] md:w-[340px] bg-card border-gold-hover overflow-hidden group">
            <div className="relative h-44 overflow-hidden">
              <img src={e.image} alt={e.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <span className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-0.5 text-xs font-heading uppercase tracking-wider">{e.type}</span>
            </div>
            <div className="p-5 space-y-3">
              <h3 className="font-display text-2xl tracking-wider leading-tight">{e.name}</h3>
              <div className="flex items-center gap-2 text-sm text-foreground/70"><Calendar className="h-4 w-4 text-gold" /> {new Date(e.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</div>
              <div className="flex items-center gap-2 text-sm text-foreground/70"><MapPin className="h-4 w-4 text-gold" /> {e.location}</div>
              <Button variant="outline" size="sm" className="w-full font-heading uppercase tracking-wider mt-2">Details<ArrowRight className="h-4 w-4" /></Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function NewsGrid() {
  const items = NEWS.slice(0, 3);
  return (
    <section className="py-16 lg:py-20 bg-navbar/40">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionTitle
          kicker="From the Mat"
          title="Latest News"
          action={<Link to="/news"><Button variant="ghost" className="font-heading uppercase tracking-wider text-gold">All news <ArrowRight /></Button></Link>}
        />
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((n) => (
            <Link key={n.id} to="/news" className="group bg-card border-gold-hover overflow-hidden flex flex-col">
              <div className="relative aspect-[16/10] overflow-hidden">
                <img src={n.image} alt={n.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-3 left-3 bg-gold text-gold-foreground px-2 py-0.5 text-xs font-heading uppercase tracking-wider">{n.category}</span>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">{new Date(n.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {n.author}</span>
                <h3 className="font-display text-2xl tracking-wider leading-tight group-hover:text-gold transition-colors">{n.title}</h3>
                <p className="text-sm text-foreground/70 line-clamp-2">{n.excerpt}</p>
                <span className="mt-auto pt-3 inline-flex items-center gap-1 text-primary font-heading uppercase text-sm tracking-wider">Read <ArrowRight className="h-4 w-4" /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function RankingTable() {
  const [gender, setGender] = useState<"male" | "female">("male");
  const [mode, setMode] = useState<"gi" | "nogi">("gi");
  const data = RANKINGS[`${gender}-${mode}`] ?? [];
  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionTitle kicker="Official Standings" title="BJJLF World Ranking" />

        <div className="flex flex-wrap gap-3 mb-6">
          <div className="inline-flex border border-border bg-card">
            {(["male", "female"] as const).map((g) => (
              <button key={g} onClick={() => setGender(g)} className={`px-5 py-2 font-heading uppercase tracking-wider text-sm transition-colors ${gender === g ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}>
                {g === "male" ? "Male" : "Female"}
              </button>
            ))}
          </div>
          <div className="inline-flex border border-border bg-card">
            {(["gi", "nogi"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`px-5 py-2 font-heading uppercase tracking-wider text-sm transition-colors ${mode === m ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:text-foreground"}`}>
                {m === "gi" ? "Gi" : "No-Gi"}
              </button>
            ))}
          </div>
          <div className="inline-flex border border-gold/50 bg-gold/10 text-gold px-5 py-2 font-heading uppercase tracking-wider text-sm">
            Black Belt
          </div>
        </div>

        <div className="border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-navbar">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-4 w-16">#</th>
                  <th className="px-4 py-4">Athlete</th>
                  <th className="px-4 py-4 hidden sm:table-cell">Country</th>
                  <th className="px-4 py-4 hidden md:table-cell">Academy</th>
                  <th className="px-4 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r) => (
                  <tr key={r.rank} className="border-t border-border hover:bg-navbar/40 transition-colors">
                    <td className="px-4 py-4">
                      <span className={`font-display text-2xl ${r.rank === 1 ? "text-gold" : r.rank <= 3 ? "text-primary" : "text-foreground"}`}>{r.rank}</span>
                    </td>
                    <td className="px-4 py-4 font-heading text-base tracking-wider">{r.athlete}</td>
                    <td className="px-4 py-4 hidden sm:table-cell text-foreground/70">{r.country}</td>
                    <td className="px-4 py-4 hidden md:table-cell text-foreground/70">{r.academy}</td>
                    <td className="px-4 py-4 text-right font-mono text-gold">{r.points.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTACards() {
  return (
    <section className="py-16 lg:py-20">
      <div className="container mx-auto px-4 lg:px-6 grid md:grid-cols-2 gap-6">
        <Link to="/register/athlete" className="group relative overflow-hidden border border-border bg-card p-8 lg:p-10 border-gold-hover">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl group-hover:bg-primary/30 transition-colors" />
          <div className="relative">
            <div className="h-14 w-14 grid place-items-center bg-primary mb-5"><Users className="h-7 w-7 text-primary-foreground" /></div>
            <p className="text-gold font-heading text-xs tracking-[0.3em] uppercase mb-2">For Competitors</p>
            <h3 className="font-display text-3xl md:text-4xl tracking-wider mb-3">Register as an Athlete</h3>
            <p className="text-foreground/70 mb-6 max-w-md">Get your official BJJLF ID, compete in sanctioned events, and appear in the global ranking.</p>
            <Button variant="primary" className="font-heading uppercase tracking-wider">Start now <ArrowRight /></Button>
          </div>
        </Link>
        <Link to="/register/academy" className="group relative overflow-hidden border border-border bg-card p-8 lg:p-10 border-gold-hover">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gold/20 blur-3xl group-hover:bg-gold/30 transition-colors" />
          <div className="relative">
            <div className="h-14 w-14 grid place-items-center bg-gold mb-5"><Building2 className="h-7 w-7 text-gold-foreground" /></div>
            <p className="text-primary font-heading text-xs tracking-[0.3em] uppercase mb-2">For Schools</p>
            <h3 className="font-display text-3xl md:text-4xl tracking-wider mb-3">Register your Academy</h3>
            <p className="text-foreground/70 mb-6 max-w-md">Affiliate your school with BJJLF, certify your professors, and host sanctioned events.</p>
            <Button variant="gold" className="font-heading uppercase tracking-wider">Affiliate <ArrowRight /></Button>
          </div>
        </Link>
      </div>
    </section>
  );
}

function YouTubeSection() {
  return (
    <section className="py-16 lg:py-20 bg-navbar/40">
      <div className="container mx-auto px-4 lg:px-6">
        <SectionTitle
          kicker="BJJLF TV"
          title="Watch on YouTube"
          action={<Button variant="outline" className="font-heading uppercase tracking-wider hidden md:inline-flex">Subscribe<Play className="h-4 w-4" /></Button>}
        />
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 relative aspect-video bg-card border border-border overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1554482585-c2e0b6c2cf80?auto=format&fit=crop&w=1400&q=70" alt="Featured highlight" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
            <button className="absolute inset-0 grid place-items-center" aria-label="Play">
              <span className="h-20 w-20 rounded-full bg-primary grid place-items-center group-hover:scale-110 transition-transform shadow-lg shadow-primary/50">
                <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
              </span>
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs font-heading uppercase tracking-[0.25em] text-gold mb-1">Featured · 12:48</p>
              <h3 className="font-display text-2xl md:text-3xl tracking-wider">World Championship 2024 — Best Submissions</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-5">
            {[
              { t: "Black Belt Promotions Ceremony", d: "8:32" },
              { t: "Mestre Roberto Interview", d: "21:05" },
            ].map((v, i) => (
              <div key={i} className="relative aspect-video bg-card border border-border overflow-hidden group cursor-pointer">
                <img src={`https://images.unsplash.com/photo-${i === 0 ? "1571019613454-1cb2f99b2d8b" : "1517649763962-0c623066013b"}?auto=format&fit=crop&w=700&q=70`} alt="" loading="lazy" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                <div className="absolute inset-0 grid place-items-center">
                  <Play className="h-10 w-10 text-foreground" fill="currentColor" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-xs text-gold mb-1">{v.d}</p>
                  <p className="font-heading text-sm tracking-wider line-clamp-2">{v.t}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar() {
  const stats = [
    { v: "12,400+", l: "Registered Athletes", icon: Users },
    { v: "640+", l: "Affiliated Academies", icon: Building2 },
    { v: "85", l: "Countries", icon: MapPin },
    { v: "120+", l: "Sanctioned Events", icon: Trophy },
  ];
  return (
    <section className="border-y border-border bg-navbar/60">
      <div className="container mx-auto px-4 lg:px-6 grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
        {stats.map((s) => (
          <div key={s.l} className="flex items-center gap-4 py-6 px-4 first:pl-0 last:pr-0">
            <s.icon className="h-8 w-8 text-gold" />
            <div>
              <div className="font-display text-3xl tracking-wider text-foreground">{s.v}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <div>
      <HeroSlider />
      <StatsBar />
      <EventsRail />
      <NewsGrid />
      <RankingTable />
      <CTACards />
      <YouTubeSection />
    </div>
  );
}
