# Build Public /rules Page

Replace `ComingSoon` in `src/pages/Rules.tsx` with a static bilingual rulebook page using the existing `PageHero`, `SectionHeading`, `Accordion` components and `typo` tokens.

## Page structure (`src/pages/Rules.tsx`)

1. **Hero** — `<PageHero kicker="BJJLF" title={t("rules.title")} desc={t("rules.subtitle")} />` (matches Rankings/Athletes pattern; dark bg already provided).

2. **Intro block** — White section, max-w-3xl centered, single paragraph using `typo.body.lg`. Key: `rules.intro`.

3. **Accordion** — `<Accordion type="single" collapsible>` from `@/components/ui/accordion` with 5 items. Each `AccordionTrigger` uses `typo.heading.sm`, each `AccordionContent` renders structured bilingual copy:
   - `rules.cat.title` / `rules.cat.body` — Categories & Divisions. Body rendered as two subsections: "Faixas etárias" (Infantil 4-13, Juvenil 14-17, Adulto 18-29, Master 30+) and "Divisões de peso" (Gi & No-Gi tables: galo/pluma/pena/leve/médio/meio-pesado/pesado/super-pesado/pesadíssimo + open class).
   - `rules.scoring.title` / `rules.scoring.body` — list of scoring values: takedown 2, sweep 2, knee on belly 2, guard pass 3, mount 4, back control 4, plus advantages and submission.
   - `rules.fouls.title` / `rules.fouls.body` — illegal techniques per belt level (white/blue: no heel hooks, reaping, neck cranks; brown/black: most leg locks allowed in no-gi only) + unsportsmanlike conduct.
   - `rules.equipment.title` / `rules.equipment.body` — gi (IBJJF-compliant cotton, color white/blue/black, A0–A5), no-gi attire (rashguard ranked color, board shorts), belt requirements.
   - `rules.format.title` / `rules.format.body` — single-elimination brackets, time limits per category (Infantil 3 min, Juvenil 4 min, Adulto faixa branca/azul 5 min, roxa 6 min, marrom 7 min, preta 10 min).

   Lists are arrays of strings stored as separate i18n keys (one per bullet) OR a single multiline key split by `\n`. Plan uses **arrays of i18n keys** (one bullet = one key) for clean translation parity, e.g. `rules.scoring.item.takedown`, `rules.scoring.item.sweep`, etc. Items rendered with `<ul className="space-y-2 list-disc pl-5">`.

4. **Download CTA block** — Full-width dark section, centered. Headline `typo.heading.md` (`rules.cta.title`), small subtitle (`rules.cta.subtitle`), then a primary-red button `bg-primary text-primary-foreground` with `borderRadius: 0`, `typo.button` styling, label `rules.cta.button`, `href="#"`, `download` attribute hint removed (placeholder).

## i18n keys (`src/lib/i18n.tsx`)

Add to both PT and EN dictionaries (after the rankings block) under `rules.*`:

- Top-level: `rules.title`, `rules.subtitle`, `rules.intro`
- Per accordion section (5 sections): `.title`, plus per-bullet item keys
  - `rules.cat.title`, `rules.cat.ages.title`, `rules.cat.ages.item.{infantil,juvenil,adulto,master}`, `rules.cat.weights.title`, `rules.cat.weights.item.{galo,pluma,pena,leve,medio,meioPesado,pesado,superPesado,pesadissimo,open}`
  - `rules.scoring.title`, `rules.scoring.intro`, `rules.scoring.item.{takedown,sweep,knee,pass,mount,back,advantage,submission}`
  - `rules.fouls.title`, `rules.fouls.byBelt.title`, `rules.fouls.item.{whiteBlue,purple,brownBlack,conduct1,conduct2}`
  - `rules.equipment.title`, `rules.equipment.item.{gi1,gi2,nogi1,nogi2,belt}`
  - `rules.format.title`, `rules.format.intro`, `rules.format.item.{infantil,juvenil,whiteBlue,purple,brown,black}`
- CTA: `rules.cta.title`, `rules.cta.subtitle`, `rules.cta.button`

Roughly ~50 keys × 2 languages.

## Files touched

- `src/pages/Rules.tsx` — full rewrite (no new components)
- `src/lib/i18n.tsx` — add `rules.*` block (PT + EN)

No DB changes, no new dependencies, no router changes (route already wired to `RulesPage`).
