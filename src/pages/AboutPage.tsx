import { PageHero } from "@/components/Stepper";
import { Award, Target, Eye, HeartHandshake, Calendar } from "lucide-react";
import dragon from "@/assets/dragon-logo.png";

const VALUES = [
  { icon: Target, title: "Mission", desc: "To preserve, certify, and elevate the global art of Brazilian Jiu-Jitsu through transparent rankings and sanctioned events." },
  { icon: Eye, title: "Vision", desc: "A unified federation where every legitimate practitioner — competitor, professor, or academy — is recognized and protected." },
  { icon: HeartHandshake, title: "Values", desc: "Integrity. Lineage. Excellence. Respect for the masters who built the art and the students who carry it forward." },
];

const TIMELINE = [
  { year: "2008", event: "BJJLF founded by a council of 12 black belt masters in Rio de Janeiro." },
  { year: "2012", event: "First sanctioned World Championship hosted with athletes from 22 countries." },
  { year: "2017", event: "Global black belt registry launched, reaching 5,000 certified members." },
  { year: "2021", event: "Anti-doping protocol aligned with WADA across all sanctioned events." },
  { year: "2024", event: "Federation surpasses 12,000 athletes and 640 affiliated academies in 85 countries." },
];

const BOARD = [
  { name: "Mestre Roberto Nogueira", role: "President", img: "https://i.pravatar.cc/300?img=60" },
  { name: "Mestre Leandro Costa", role: "VP Competition", img: "https://i.pravatar.cc/300?img=53" },
  { name: "Prof. Helena Martins", role: "Head of Ethics", img: "https://i.pravatar.cc/300?img=44" },
  { name: "Prof. André Galvão", role: "Athlete Council", img: "https://i.pravatar.cc/300?img=68" },
  { name: "Prof. Hiroyuki Abe", role: "Asia Director", img: "https://i.pravatar.cc/300?img=14" },
  { name: "Prof. Tiago Barros", role: "Europe Director", img: "https://i.pravatar.cc/300?img=33" },
];

export function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-navbar border-b border-border">
        <img src={dragon} alt="" className="absolute -right-32 -top-20 h-[640px] w-[640px] opacity-[0.07] pointer-events-none select-none" />
        <div className="relative container mx-auto px-4 lg:px-6 py-24 lg:py-32 max-w-4xl">
          <p className="text-gold font-heading text-xs tracking-[0.3em] uppercase mb-3">Our Federation</p>
          <h1 className="font-display text-5xl md:text-7xl tracking-wider leading-[0.95]">
            Honoring the <span className="text-primary">legends</span>.<br />
            Building the <span className="text-gold">future</span>.
          </h1>
          <p className="mt-6 text-lg text-foreground/80 max-w-2xl">
            BJJLF — the Brazilian Jiu-Jitsu Legends Federation — exists to safeguard the lineage, integrity, and global growth of jiu-jitsu.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6 grid md:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <div key={v.title} className="bg-card border border-border p-8 border-gold-hover">
              <div className="h-12 w-12 grid place-items-center bg-primary/10 border border-primary/30 mb-5"><v.icon className="h-6 w-6 text-primary" /></div>
              <h3 className="font-display text-2xl tracking-wider mb-2 text-gold">{v.title}</h3>
              <p className="text-foreground/70">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 bg-navbar/40 border-y border-border">
        <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
          <p className="text-gold font-heading text-xs tracking-[0.3em] uppercase mb-3">History</p>
          <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-10">Our journey</h2>
          <ol className="space-y-2 relative pl-10 border-l-2 border-border">
            {TIMELINE.map((t) => (
              <li key={t.year} className="relative pb-8 last:pb-0">
                <span className="absolute -left-[49px] top-0 h-9 w-9 grid place-items-center bg-background border-2 border-primary text-primary font-display rounded-full"><Calendar className="h-4 w-4" /></span>
                <div className="font-display text-3xl tracking-wider text-gold">{t.year}</div>
                <p className="text-foreground/80 mt-1">{t.event}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[4/5] overflow-hidden border border-gold/30">
            <img src="https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=900&q=70" alt="Mestre Roberto Nogueira" className="h-full w-full object-cover grayscale" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <p className="text-xs tracking-[0.3em] uppercase text-gold mb-1">President & Founder</p>
              <h3 className="font-display text-3xl tracking-wider">Mestre Roberto Nogueira</h3>
            </div>
          </div>
          <div>
            <Award className="h-10 w-10 text-gold mb-4" />
            <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-5">A life on the mat.</h2>
            <p className="text-foreground/80 mb-4">A 7th-degree red-and-black belt with over 50 years of teaching, Mestre Roberto has trained world champions across four generations and personally graduated more than 80 black belts.</p>
            <p className="text-foreground/70">He founded BJJLF in 2008 with a clear mission: protect the art from dilution, certify only those who earn it, and ensure that no master, professor, or student is forgotten.</p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-navbar/40 border-t border-border">
        <div className="container mx-auto px-4 lg:px-6">
          <p className="text-gold font-heading text-xs tracking-[0.3em] uppercase mb-3">Leadership</p>
          <h2 className="font-display text-4xl md:text-5xl tracking-wider mb-10">Board of Directors</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {BOARD.map((m) => (
              <div key={m.name} className="text-center group">
                <div className="aspect-square overflow-hidden border-2 border-border group-hover:border-gold transition-colors">
                  <img src={m.img} alt={m.name} loading="lazy" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                </div>
                <h4 className="font-heading mt-3 text-sm uppercase tracking-wider">{m.name}</h4>
                <p className="text-xs text-gold uppercase tracking-wider">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
