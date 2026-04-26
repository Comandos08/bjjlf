import { Link, useLoaderData } from "@tanstack/react-router";
import { ArrowLeft, MapPin, Award, Calendar, ShieldCheck, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";

export function GraduateProfile() {
  const g = useLoaderData({ from: "/graduates/$graduateId" });

  return (
    <div>
      <section className="relative bg-navbar border-b border-border overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ background: "radial-gradient(ellipse at 30% 50%, var(--color-primary) 0%, transparent 60%)" }} />
        <div className="relative container mx-auto px-4 lg:px-6 py-12">
          <Link to="/graduates" className={cn(typo.body.sm, "inline-flex items-center gap-2 hover:text-gold mb-6")}>
            <ArrowLeft className="h-4 w-4" /> Back to registry
          </Link>
          <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-center">
            <div className="relative w-full max-w-[280px] aspect-square overflow-hidden border-4 border-gold mx-auto lg:mx-0">
              <img src={g.photo} alt={g.name} className="h-full w-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-black border-t-2 border-gold" />
            </div>
            <div>
              <p className={cn(typo.heading.kicker, "tracking-[0.3em] mb-2")}>Certified Black Belt</p>
              <h1 className={typo.heading.xl}>{g.name}</h1>
              <p className={cn(typo.heading.md, "text-primary mt-2")}>{g.beltGrade}</p>
              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 mt-6">
                <Info icon={MapPin} label="From" value={`${g.state}, ${g.country}`} />
                <Info icon={Award} label="Academy" value={g.academy} />
                <Info icon={Award} label="Professor" value={g.professor} />
                <Info icon={Calendar} label="Black belt since" value={new Date(g.graduationDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-[1fr,320px] gap-10">
          <div>
            <h2 className={cn(typo.heading.lg, "mb-6 text-gold")}>Graduation history</h2>
            <ol className="space-y-2 relative pl-10 border-l-2 border-border">
              {g.history.map((h) => (
                <li key={h.year} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[49px] top-0 h-9 w-9 grid place-items-center bg-background border-2 border-primary text-primary font-display rounded-full text-sm">{String(h.year).slice(2)}</span>
                  <div className={typo.heading.md}>
                    {h.belt} <span className="text-gold">·</span> <span className="text-foreground/60">{h.year}</span>
                  </div>
                  <p className={cn(typo.body.sm, "mt-1")}>Promoted by {h.promotedBy}</p>
                </li>
              ))}
            </ol>
          </div>

          <aside className="bg-card border border-gold/40 p-6 h-fit border-gold-hover">
            <div className="flex items-center gap-2 text-gold mb-3">
              <ShieldCheck className="h-5 w-5" />
              <span className={typo.button.md}>Verified Certificate</span>
            </div>
            <p className={cn(typo.body.xs, "mb-5")}>Scan to verify the authenticity of this graduation in the BJJLF registry.</p>
            <div className="aspect-square bg-white p-3 mb-4 grid place-items-center">
              <QrPlaceholder cert={g.certificateNo} />
            </div>
            <div className="space-y-1">
              <div className={cn(typo.body.xs, "flex justify-between")}><span className="text-muted-foreground">Certificate №</span><span className={cn(typo.mono.sm, "text-foreground")}>{g.certificateNo}</span></div>
              <div className={cn(typo.body.xs, "flex justify-between")}><span className="text-muted-foreground">Issued</span><span className="text-foreground">{new Date(g.graduationDate).toLocaleDateString()}</span></div>
              <div className={cn(typo.body.xs, "flex justify-between")}><span className="text-muted-foreground">Status</span><span className="text-gold">Active</span></div>
            </div>
            <Button variant="gold" className={cn(typo.button.md, "w-full mt-5")}>Verify Online</Button>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-gold mt-0.5 shrink-0" />
      <div>
        <div className={cn(typo.label.sm, "tracking-[0.2em]")}>{label}</div>
        <div className={cn(typo.body.sm, "text-foreground")}>{value}</div>
      </div>
    </div>
  );
}

function QrPlaceholder({ cert }: { cert: string }) {
  const grid = 12;
  const seed = cert.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const cells = Array.from({ length: grid * grid }, (_, i) => ((seed * (i + 7)) % 100) > 50);
  return (
    <div className="relative w-full h-full">
      <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${grid}, 1fr)` }}>
        {cells.map((on, i) => <div key={i} className={on ? "bg-black" : "bg-white"} />)}
      </div>
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <div className="bg-white p-1.5 border-2 border-black">
          <QrCode className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  );
}
