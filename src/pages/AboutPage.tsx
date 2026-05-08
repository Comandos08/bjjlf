import { Target, Eye, HeartHandshake } from "lucide-react";
import dragon from "@/assets/dragon-logo.png";
import mestreMalibu from "@/assets/mestre-sergio-malibu.jpg";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export function AboutPage() {
  const { t } = useI18n();

  const VALUES = [
    { icon: Target, title: t("about.mission"), desc: t("about.mission.desc") },
    { icon: Eye, title: t("about.vision"), desc: t("about.vision.desc") },
    { icon: HeartHandshake, title: t("about.values"), desc: t("about.values.desc") },
  ];

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0F0F0F] border-b border-white/10">
        <img
          src={dragon}
          alt=""
          className="absolute -right-32 -top-20 h-[640px] w-[640px] opacity-[0.05] pointer-events-none select-none"
        />
        <div className="relative container mx-auto px-4 lg:px-6 py-24 lg:py-32 max-w-4xl">
          <p className={cn(typo.heading.kicker, "mb-4 text-[#B8960C]")}>
            {t("about.kicker")}
          </p>
          <h1 className={cn(typo.heading.xl, "text-white")}>
            {t("about.title.a")}
            <br />
            <span className="text-[#C41E3A]">{t("about.title.b")}</span>
          </h1>
          <p className="mt-8 max-w-2xl font-sans text-base md:text-lg leading-[1.75] text-gray-300">
            {t("about.intro")}
          </p>
        </div>
      </section>

      {/* MISSION / VISION / VALUES */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6 grid md:grid-cols-3 gap-6">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="bg-white border border-gray-200 p-8 transition-colors hover:border-[#B8960C]"
            >
              <div className="h-12 w-12 grid place-items-center bg-[#B8960C]/10 border border-[#B8960C]/30 mb-5">
                <v.icon className="h-6 w-6 text-[#B8960C]" />
              </div>
              <h3
                className={cn(
                  "font-heading uppercase tracking-wide leading-tight text-2xl mb-3",
                  "text-[#C41E3A]"
                )}
              >
                {v.title}
              </h3>
              <p className="font-sans text-base leading-[1.7] text-gray-700">
                {v.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FOUNDER */}
      <section className="py-20 bg-[#0F0F0F] border-y border-white/10">
        <div className="container mx-auto px-4 lg:px-6 grid lg:grid-cols-2 gap-12 items-center max-w-5xl">
          <div className="flex justify-center">
            <div className="relative h-72 w-72 rounded-full bg-black border border-[#B8960C]/40 grid place-items-center">
              <img
                src={dragon}
                alt=""
                className="h-44 w-44 object-contain opacity-90"
              />
            </div>
          </div>
          <div>
            <p className={cn(typo.heading.kicker, "mb-3 text-[#B8960C]")}>
              {t("about.founder.kicker")}
            </p>
            <h2 className={cn(typo.heading.lg, "text-white")}>
              {t("about.founder.name")}
            </h2>
            <p className="mt-2 font-heading uppercase tracking-wide text-lg text-[#C41E3A]">
              {t("about.founder.belt")}
            </p>
            <p className="mt-6 font-sans text-base md:text-lg leading-[1.75] text-gray-300">
              {t("about.founder.desc")}
            </p>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-6 max-w-3xl text-center">
          <p className={cn(typo.heading.kicker, "mb-3 text-[#B8960C]")}>
            {t("about.leadership")}
          </p>
          <h2 className={cn(typo.heading.lg, "text-gray-900 mb-10")}>
            {t("about.board")}
          </h2>
          <div className="border border-gray-200 rounded p-10 text-center text-gray-500 font-sans text-base leading-relaxed">
            {t("about.board.soon")}
          </div>
        </div>
      </section>
    </div>
  );
}
