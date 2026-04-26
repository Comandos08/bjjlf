import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageHero } from "@/components/Stepper";
import { Search, MapPin } from "lucide-react";
import { GRADUATES } from "@/data/graduates";
import { useI18n } from "@/lib/i18n";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";

const GRADES = ["All", "1st Degree", "2nd Degree", "3rd Degree", "4th Degree"];

const beltBg = "#0A0A0A";

export function GraduatesPage() {
  const { t } = useI18n();
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
                  {g.name.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
              </div>
              <h3 className={cn(typo.body.sm, "text-[#0F0F0F] mt-3 font-semibold")}>{g.name}</h3>
              <span
                className={cn(typo.label.sm, "mt-1.5 px-2.5 py-0.5 text-white")}
                style={{ background: beltBg, borderRadius: "9999px" }}
              >
                {g.beltGrade}
              </span>
              <p className={cn(typo.body.xs, "text-[#9CA3AF] mt-2")}>{g.academy}</p>
              <p className={cn(typo.body.xs, "text-[#6B7280] mt-1 inline-flex items-center gap-1")}>
                <MapPin className="h-3 w-3" /> {g.state}, {g.country}
              </p>
              <span className={cn(typo.button.sm, "mt-3 w-full text-center py-2 border border-primary text-primary hover:bg-primary hover:text-white transition-base")}>
                {t("grad.viewProfile")}
              </span>
            </Link>
          ))}
        </div>
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
