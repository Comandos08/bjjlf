import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageHero } from "@/components/Stepper";
import { Search, MapPin, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";

const GRADES = ["All", "1st Degree", "2nd Degree", "3rd Degree", "4th Degree"];

const beltBg = "#0A0A0A";

type Row = {
  id: string;
  athlete_name: string;
  belt_degree: number;
  academy: string | null;
  city: string | null;
  country_code: string;
  flag_emoji: string | null;
};

function gradeLabel(d: number): string {
  if (d === 1) return "1st Degree";
  if (d === 2) return "2nd Degree";
  if (d === 3) return "3rd Degree";
  if (d === 4) return "4th Degree";
  return `${d}th Degree`;
}

export function GraduatesPage() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("All");
  const [country, setCountry] = useState("All");
  const [academy, setAcademy] = useState("All");
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("certified_black_belts")
        .select("id, athlete_name, belt_degree, academy, city, country_code, flag_emoji")
        .eq("is_active", true);
      if (!cancelled) setRows((data ?? []) as Row[]);
    })();
    return () => { cancelled = true; };
  }, []);

  const all = rows ?? [];
  const countries = useMemo(() => ["All", ...Array.from(new Set(all.map((g) => g.country_code).filter(Boolean)))], [all]);
  const academies = useMemo(() => ["All", ...Array.from(new Set(all.map((g) => g.academy).filter(Boolean) as string[]))], [all]);

  const list = all.filter((g) =>
    (q === "" || g.athlete_name.toLowerCase().includes(q.toLowerCase())) &&
    (grade === "All" || gradeLabel(g.belt_degree) === grade) &&
    (country === "All" || g.country_code === country) &&
    (academy === "All" || g.academy === academy),
  );

  return (
    <div className="bg-[#F7F9FC] min-h-screen">
      <PageHero
        breadcrumb={[{ label: t("grad.breadcrumb") }]}
        title={t("grad.title").toUpperCase()}
        desc={t("grad.subtitle")}
      />

      <section className="max-w-[1280px] mx-auto px-4 lg:px-6 py-8">
        <div className="bg-white border border-[#E5E5E5] p-5 grid md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input
              placeholder={t("grad.search")}
              className={cn(typo.body.sm, "w-full h-10 pl-9 pr-3 border border-[#E5E5E5] bg-white text-[#0F0F0F] focus:outline-none focus:border-primary transition-base")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <FilterSelect label={t("grad.degree")} value={grade} onChange={setGrade} options={GRADES} />
          <FilterSelect label={t("grad.country")} value={country} onChange={setCountry} options={countries} />
          <FilterSelect label={t("grad.academy")} value={academy} onChange={setAcademy} options={academies} />
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-4 lg:px-6 pb-16">
        {rows !== null && rows.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] py-16 text-center">
            <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className={cn(typo.heading.sm, "text-gray-700")}>
              {lang === "pt"
                ? "Em breve, a lista oficial de faixas pretas BJJLF."
                : "Coming soon: the official BJJLF black belt list."}
            </p>
          </div>
        ) : (
          <>
            <p className={cn(typo.body.sm, "text-[#6B7280] mb-5")}>
              <span className="text-primary font-bold">{list.length}</span> {list.length === 1 ? t("grad.foundOne") : t("grad.found")}
            </p>
            <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
              {list.map((g) => (
                <Link
                  key={g.id}
                  to="/graduates/$graduateId"
                  params={{ graduateId: g.id }}
                  className="bg-white border border-[#E5E5E5] hover:border-primary transition-base p-4 flex flex-col items-center text-center"
                >
                  <div className="relative">
                    <div
                      className={cn(typo.heading.sm, "h-[72px] w-[72px] grid place-items-center rounded-full text-white text-[20px]")}
                      style={{ background: beltBg, border: `3px solid ${beltBg}`, borderRadius: "9999px" }}
                    >
                      {g.athlete_name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                    </div>
                  </div>
                  <h3 className={cn(typo.body.sm, "text-[#0F0F0F] mt-3 font-semibold")}>{g.athlete_name}</h3>
                  <span
                    className={cn(typo.label.sm, "mt-1.5 px-2.5 py-0.5 text-white")}
                    style={{ background: beltBg, borderRadius: "9999px" }}
                  >
                    {gradeLabel(g.belt_degree)}
                  </span>
                  {g.academy && <p className={cn(typo.body.xs, "text-[#9CA3AF] mt-2")}>{g.academy}</p>}
                  <p className={cn(typo.body.xs, "text-[#6B7280] mt-1 inline-flex items-center gap-1")}>
                    <MapPin className="h-3 w-3" /> {g.flag_emoji ? `${g.flag_emoji} ` : ""}{g.city ?? ""}{g.city ? ", " : ""}{g.country_code}
                  </p>
                  <span className={cn(typo.button.sm, "mt-3 w-full text-center py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-base")}>
                    {t("grad.viewProfile")}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className={cn(typo.label.md, "block text-[#374151] mb-1")}>{label}</label>
      <select
        className={cn(typo.body.sm, "h-10 w-full bg-white border border-[#E5E5E5] px-3 text-[#0F0F0F] focus:outline-none focus:border-primary transition-base cursor-pointer")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
