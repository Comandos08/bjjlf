import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export const Route = createFileRoute("/typography")({
  head: () => ({
    meta: [
      { title: "Typography Tokens — BJJLF Design System" },
      {
        name: "description",
        content:
          "Side-by-side preview of every typography token (heading, body, button, label, nav, mono) across responsive breakpoints.",
      },
      { property: "og:title", content: "Typography Tokens — BJJLF Design System" },
      {
        property: "og:description",
        content:
          "Side-by-side preview of every typography token (heading, body, button, label, nav, mono) across responsive breakpoints.",
      },
      // Internal/dev page — discourage indexing.
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: TypographyPreviewPage,
});

/* ------------------------------------------------------------------ */
/*  Live breakpoint badge                                              */
/* ------------------------------------------------------------------ */

function useBreakpoint() {
  const [bp, setBp] = useState<"xs" | "sm" | "md" | "lg" | "xl" | "2xl">("md");

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w >= 1536) return "2xl";
      if (w >= 1280) return "xl";
      if (w >= 1024) return "lg";
      if (w >= 768) return "md";
      if (w >= 640) return "sm";
      return "xs";
    };
    const update = () => setBp(calc());
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return bp;
}

function BreakpointBadge() {
  const bp = useBreakpoint();
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-gold/40 bg-background/90 px-4 py-2 backdrop-blur">
      <span className={cn(typo.label.sm, "text-gold")}>Breakpoint</span>
      <span className={cn(typo.mono.md, "text-foreground")}>{bp}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Generic token row                                                  */
/* ------------------------------------------------------------------ */

type Row = {
  name: string;
  className: string;
  sample: string;
};

function TokenRow({ name, className, sample }: Row) {
  return (
    <div className="grid grid-cols-1 gap-3 border-b border-border py-5 md:grid-cols-[200px_1fr]">
      <div className="flex flex-col gap-1">
        <code className={cn(typo.mono.sm, "text-gold")}>{name}</code>
        <span className={cn(typo.label.sm)}>token</span>
      </div>
      <div className={className}>{sample}</div>
    </div>
  );
}

function GroupCard({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Row[];
}) {
  return (
    <Card className="bg-dark-2/40 border-border">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {rows.map((r) => (
          <TokenRow key={r.name} {...r} />
        ))}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Side-by-side breakpoint comparator                                 */
/* ------------------------------------------------------------------ */

function ResponsiveScale({ name, className }: { name: string; sample?: string; className: string }) {
  // Render the same token at three forced widths so designers can compare
  // how `text-Nxl md:text-Nxl lg:text-Nxl` scaling kicks in.
  const widths = [
    { label: "Mobile (375px)", w: 375 },
    { label: "Tablet (768px)", w: 768 },
    { label: "Desktop (1280px)", w: 1280 },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <code className={cn(typo.mono.sm, "text-gold")}>{name}</code>
        <span className={cn(typo.label.sm)}>responsive scaling</span>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {widths.map((b) => (
          <div
            key={b.label}
            className="rounded-md border border-border bg-background/40 p-4 overflow-hidden"
          >
            <div className={cn(typo.label.sm, "mb-3")}>{b.label}</div>
            {/* Width-constrained preview frame — utility classes inside still
                react to the *viewport*, so the visual diff comes from the
                content reflowing at this width, not from media queries. */}
            <div
              className="mx-auto border border-dashed border-border/60 bg-dark-3/40 p-3"
              style={{ width: b.w, maxWidth: "100%" }}
            >
              <div className={className}>The quick brown fox jumps over the lazy dog</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const headingRows: Row[] = [
  { name: "typo.heading.xl", className: typo.heading.xl, sample: "Hero / Page Title" },
  { name: "typo.heading.lg", className: typo.heading.lg, sample: "Major Section Title" },
  { name: "typo.heading.md", className: typo.heading.md, sample: "In-Section Subtitle" },
  { name: "typo.heading.sm", className: typo.heading.sm, sample: "Card / List Title" },
  { name: "typo.heading.kicker", className: typo.heading.kicker, sample: "Eyebrow Kicker" },
];

const bodyRows: Row[] = [
  {
    name: "typo.body.lg",
    className: typo.body.lg,
    sample:
      "Large body text — used for lead paragraphs and intro copy that needs slightly more presence than standard body text.",
  },
  {
    name: "typo.body.md",
    className: typo.body.md,
    sample:
      "Medium body text — the default for paragraphs across most marketing and content surfaces.",
  },
  {
    name: "typo.body.sm",
    className: typo.body.sm,
    sample: "Small body text — used inside cards, sidebars, and secondary content blocks.",
  },
  {
    name: "typo.body.xs",
    className: typo.body.xs,
    sample: "Extra-small body text — disclaimers, captions, footnotes.",
  },
];

const labelRows: Row[] = [
  { name: "typo.label.md", className: typo.label.md, sample: "Form Field Label" },
  { name: "typo.label.sm", className: typo.label.sm, sample: "Meta · Date · Author" },
];

const navRows: Row[] = [
  { name: "typo.nav.link", className: typo.nav.link, sample: "Top-Level Nav Link" },
  { name: "typo.nav.sub", className: typo.nav.sub, sample: "Sub-Nav Link" },
];

const monoRows: Row[] = [
  { name: "typo.mono.md", className: typo.mono.md, sample: "CERT-2024-00042" },
  { name: "typo.mono.sm", className: typo.mono.sm, sample: "ID: 7f3a-9b21" },
];

function TypographyPreviewPage() {
  return (
    <div className="min-h-screen bg-background">
      <BreakpointBadge />

      {/* Page hero */}
      <section className="border-b border-border bg-dark-2/30">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <span className={cn(typo.heading.kicker, "block mb-4")}>Design System</span>
          <h1 className={typo.heading.xl}>Typography Tokens</h1>
          <p className={cn(typo.body.lg, "mt-4 max-w-3xl")}>
            Visual reference for every token defined in{" "}
            <code className={cn(typo.mono.sm, "text-gold")}>src/lib/typography.ts</code>. Resize
            the window to see how heading variants scale at the{" "}
            <code className={cn(typo.mono.sm, "text-gold")}>md</code> and{" "}
            <code className={cn(typo.mono.sm, "text-gold")}>lg</code> breakpoints — the live
            badge in the bottom-right shows the active breakpoint.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 py-12 md:px-8">
        {/* Token groups */}
        <GroupCard
          title="Headings"
          description="Barlow Condensed · uppercase · wider tracking. Use for page and section titles."
          rows={headingRows}
        />

        <GroupCard
          title="Body"
          description="DM Sans · sentence case. Use for paragraphs, descriptions, and general copy."
          rows={bodyRows}
        />

        <GroupCard
          title="Labels & Meta"
          description="DM Sans · uppercase · micro-tracking · semibold. Use for form labels, badges, and metadata."
          rows={labelRows}
        />

        <GroupCard
          title="Navigation"
          description="Barlow Condensed · uppercase · heaviest weights. Use for primary and secondary nav."
          rows={navRows}
        />

        <GroupCard
          title="Mono"
          description="Monospace · for IDs, certificate numbers, and inline code references."
          rows={monoRows}
        />

        {/* Buttons — sourced from the typo.button.* tokens via the Button component */}
        <Card className="bg-dark-2/40 border-border">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Sourced from <code className={cn(typo.mono.sm, "text-gold")}>typo.button.*</code> via
              the shared <code className={cn(typo.mono.sm, "text-gold")}>Button</code> component.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm" variant="primary">
                Small (button.sm)
              </Button>
              <Button variant="primary">Default (button.md)</Button>
              <Button size="lg" variant="primary">
                Large (button.lg)
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button variant="gold">Gold</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="outlineRed">Outline Red</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form pairings — Label + Input use typo.label.md / typo.body.sm */}
        <Card className="bg-dark-2/40 border-border">
          <CardHeader>
            <CardTitle>Form Controls</CardTitle>
            <CardDescription>
              <code className={cn(typo.mono.sm, "text-gold")}>Label</code> and{" "}
              <code className={cn(typo.mono.sm, "text-gold")}>Input</code> pull their typography
              from the centralized tokens by default.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tp-name">Full Name</Label>
              <Input id="tp-name" placeholder="e.g. Carlos Gracie" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tp-email">Email Address</Label>
              <Input id="tp-email" type="email" placeholder="you@academy.com" />
            </div>
          </CardContent>
        </Card>

        {/* Responsive scaling comparator for headings */}
        <Card className="bg-dark-2/40 border-border">
          <CardHeader>
            <CardTitle>Responsive Scaling</CardTitle>
            <CardDescription>
              Each heading token rendered inside a fixed-width frame so you can compare line
              breaks and rhythm at common device widths.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-10">
            <ResponsiveScale name="typo.heading.xl" className={typo.heading.xl} />
            <ResponsiveScale name="typo.heading.lg" className={typo.heading.lg} />
            <ResponsiveScale name="typo.heading.md" className={typo.heading.md} />
            <ResponsiveScale name="typo.heading.sm" className={typo.heading.sm} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
