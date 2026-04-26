import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageHero } from "@/components/Stepper";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Award, ArrowRight } from "lucide-react";
import { GRADUATES } from "@/data/graduates";

const GRADES = ["All", "1st Degree", "2nd Degree", "3rd Degree", "4th Degree"];

export function GraduatesPage() {
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("All");
  const [country, setCountry] = useState("All");
  const [academy, setAcademy] = useState("All");

  const countries = useMemo(() => ["All", ...Array.from(new Set(GRADUATES.map((g) => g.country)))], []);
  const academies = useMemo(() => ["All", ...Array.from(new Set(GRADUATES.map((g) => g.academy)))], []);

  const list = GRADUATES.filter((g) =>
    (q === "" || g.name.toLowerCase().includes(q.toLowerCase())) &&
    (grade === "All" || g.beltGrade === grade) &&
    (country === "All" || g.country === country) &&
    (academy === "All" || g.academy === academy),
  );

  return (
    <div>
      <PageHero kicker="Black Belt Registry" title="Certified Graduates" desc="The official BJJLF directory of certified black belts. Every entry is verified and traceable to its lineage." />

      <section className="py-10 border-b border-border bg-navbar/40">
        <div className="container mx-auto px-4 lg:px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name..." className="pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Select label="Belt grade" value={grade} onChange={setGrade} options={GRADES} />
          <Select label="Country" value={country} onChange={setCountry} options={countries} />
          <Select label="Academy" value={academy} onChange={setAcademy} options={academies} />
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 lg:px-6">
          <p className="text-sm text-muted-foreground mb-6"><span className="text-gold font-heading">{list.length}</span> graduate{list.length === 1 ? "" : "s"} found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map((g) => (
              <Link key={g.id} to="/graduates/$graduateId" params={{ graduateId: g.id }} className="group block bg-card border-l-4 border border-border hover:border-gold transition-all hover:-translate-y-1" style={{ borderLeftColor: "#0A0A0A" }}>
                <div className="p-5 flex gap-4">
                  <img src={g.photo} alt={g.name} loading="lazy" className="h-20 w-20 object-cover border-2 border-gold/40 grayscale group-hover:grayscale-0 transition-all" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl tracking-wider leading-tight">{g.name}</h3>
                    <p className="text-xs text-gold uppercase tracking-wider mt-0.5">{g.beltGrade} Black Belt</p>
                    <div className="text-xs text-foreground/60 mt-2 flex items-center gap-1"><MapPin className="h-3 w-3" />{g.state}, {g.country}</div>
                    <div className="text-xs text-foreground/60 flex items-center gap-1"><Award className="h-3 w-3" />{g.academy}</div>
                  </div>
                </div>
                <div className="px-5 pb-4 flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-mono">{g.certificateNo}</span>
                  <span className="font-heading uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">View <ArrowRight className="h-3 w-3" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</label>
      <select className="h-9 w-full bg-input border border-border px-3 text-sm rounded-md" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
