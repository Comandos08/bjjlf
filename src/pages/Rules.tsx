import { useI18n } from "@/lib/i18n";
import { PageHero } from "@/components/Stepper";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { typo } from "@/lib/typography";
import { Download } from "lucide-react";

type Section = {
  value: string;
  titleKey: string;
  blocks: Array<
    | { kind: "intro"; key: string }
    | { kind: "subtitle"; key: string }
    | { kind: "list"; items: string[] }
  >;
};

const SECTIONS: Section[] = [
  {
    value: "categories",
    titleKey: "rules.cat.title",
    blocks: [
      { kind: "subtitle", key: "rules.cat.ages.title" },
      {
        kind: "list",
        items: [
          "rules.cat.ages.item.infantil",
          "rules.cat.ages.item.juvenil",
          "rules.cat.ages.item.adulto",
          "rules.cat.ages.item.master",
        ],
      },
      { kind: "subtitle", key: "rules.cat.weights.title" },
      {
        kind: "list",
        items: [
          "rules.cat.weights.item.galo",
          "rules.cat.weights.item.pluma",
          "rules.cat.weights.item.pena",
          "rules.cat.weights.item.leve",
          "rules.cat.weights.item.medio",
          "rules.cat.weights.item.meioPesado",
          "rules.cat.weights.item.pesado",
          "rules.cat.weights.item.superPesado",
          "rules.cat.weights.item.pesadissimo",
          "rules.cat.weights.item.open",
        ],
      },
    ],
  },
  {
    value: "scoring",
    titleKey: "rules.scoring.title",
    blocks: [
      { kind: "intro", key: "rules.scoring.intro" },
      {
        kind: "list",
        items: [
          "rules.scoring.item.takedown",
          "rules.scoring.item.sweep",
          "rules.scoring.item.knee",
          "rules.scoring.item.pass",
          "rules.scoring.item.mount",
          "rules.scoring.item.back",
          "rules.scoring.item.advantage",
          "rules.scoring.item.submission",
        ],
      },
    ],
  },
  {
    value: "fouls",
    titleKey: "rules.fouls.title",
    blocks: [
      { kind: "subtitle", key: "rules.fouls.byBelt.title" },
      {
        kind: "list",
        items: [
          "rules.fouls.item.whiteBlue",
          "rules.fouls.item.purple",
          "rules.fouls.item.brownBlack",
          "rules.fouls.item.conduct1",
          "rules.fouls.item.conduct2",
        ],
      },
    ],
  },
  {
    value: "equipment",
    titleKey: "rules.equipment.title",
    blocks: [
      {
        kind: "list",
        items: [
          "rules.equipment.item.gi1",
          "rules.equipment.item.gi2",
          "rules.equipment.item.nogi1",
          "rules.equipment.item.nogi2",
          "rules.equipment.item.belt",
        ],
      },
    ],
  },
  {
    value: "format",
    titleKey: "rules.format.title",
    blocks: [
      { kind: "intro", key: "rules.format.intro" },
      {
        kind: "list",
        items: [
          "rules.format.item.infantil",
          "rules.format.item.juvenil",
          "rules.format.item.whiteBlue",
          "rules.format.item.purple",
          "rules.format.item.brown",
          "rules.format.item.black",
        ],
      },
    ],
  },
];

export function RulesPage() {
  const { t } = useI18n();

  return (
    <>
      <PageHero
        kicker="BJJLF"
        title={t("rules.title")}
        desc={t("rules.subtitle")}
      />

      {/* Intro */}
      <section className="bg-background py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 lg:px-6">
          <p className={typo.body.lg + " text-center"}>{t("rules.intro")}</p>
        </div>
      </section>

      {/* Accordion */}
      <section className="bg-background pb-16">
        <div className="max-w-3xl mx-auto px-4 lg:px-6">
          <Accordion type="single" collapsible className="border-t border-white/10">
            {SECTIONS.map((s) => (
              <AccordionItem
                key={s.value}
                value={s.value}
                className="border-b border-white/10"
              >
                <AccordionTrigger
                  className={`${typo.heading.sm} text-white py-5 hover:no-underline hover:text-gold`}
                >
                  {t(s.titleKey)}
                </AccordionTrigger>
                <AccordionContent className="pb-6 space-y-4">
                  {s.blocks.map((block, i) => {
                    if (block.kind === "intro") {
                      return (
                        <p
                          key={i}
                          className="text-gray-300"
                          style={{ fontFamily: "Barlow", lineHeight: 1.7 }}
                        >
                          {t(block.key)}
                        </p>
                      );
                    }
                    if (block.kind === "subtitle") {
                      return (
                        <h4
                          key={i}
                          className="text-gold uppercase tracking-widest text-sm pt-2"
                          style={{
                            fontFamily: "Barlow Condensed",
                            fontWeight: 700,
                          }}
                        >
                          {t(block.key)}
                        </h4>
                      );
                    }
                    return (
                      <ul
                        key={i}
                        className="list-disc pl-5 space-y-2 text-gray-300"
                        style={{ fontFamily: "Barlow", lineHeight: 1.7 }}
                      >
                        {block.items.map((k) => (
                          <li key={k}>{t(k)}</li>
                        ))}
                      </ul>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-dark-2 py-16 border-t border-white/10">
        <div className="max-w-2xl mx-auto px-4 lg:px-6 text-center">
          <h2
            className="text-white mb-3"
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 900,
              fontSize: "2rem",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
            }}
          >
            {t("rules.cta.title")}
          </h2>
          <p
            className="text-gray-400 mb-7"
            style={{ fontFamily: "Barlow", lineHeight: 1.7 }}
          >
            {t("rules.cta.subtitle")}
          </p>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 uppercase tracking-widest hover:bg-primary/90 transition-colors"
            style={{
              borderRadius: 0,
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            <Download className="w-4 h-4" />
            {t("rules.cta.button")}
          </a>
        </div>
      </section>
    </>
  );
}
