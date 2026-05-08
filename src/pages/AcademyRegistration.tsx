import { useState } from "react";
import { Stepper, PageHero } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, CheckCircle2, Plus, Trash2, Award } from "lucide-react";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { useI18n } from "@/lib/i18n";

export function AcademyRegistration() {
  const { t } = useI18n();
  const STEPS = [
    t("reg.academy.step1"),
    t("reg.academy.step2"),
    t("reg.academy.step3"),
    t("reg.academy.step4"),
    t("reg.academy.step5"),
  ];
  const [step, setStep] = useState(0);
  const [profs, setProfs] = useState<{ name: string; belt: string }[]>([]);
  const [academy, setAcademy] = useState({ name: "", country: "", city: "", address: "", logo_url: "" });
  const [head, setHead] = useState({ name: "", belt: "Preta · 1º Grau", years: "" });

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div>
      <PageHero kicker={t("reg.academy.kicker")} title={t("reg.academy.title")} desc={t("reg.academy.subtitle")} />

      <section className="container mx-auto px-4 lg:px-6 py-12 max-w-4xl">
        <Stepper steps={STEPS} current={step} />

        <div className="bg-card border border-border p-6 md:p-10 border-gold-hover">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className={cn(typo.heading.md, "text-gold")}>{t("reg.academy.head.title")}</h2>
              <Field label={t("reg.fullName")}><Input value={head.name} onChange={(e) => setHead({ ...head, name: e.target.value })} /></Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t("reg.academy.belt")}>
                  <select className="h-9 w-full bg-input border border-border px-3 text-sm rounded-md" value={head.belt} onChange={(e) => setHead({ ...head, belt: e.target.value })}>
                    <option>Preta Lisa</option><option>Preta · 1º Grau</option><option>Preta · 2º Grau</option><option>Preta · 3º Grau</option><option>Preta · 4º Grau</option><option>Preta · 5º Grau</option><option>Preta · 6º Grau</option><option>Vermelha e Preta · 7º Grau</option><option>Vermelha e Branca · 8º Grau</option><option>Vermelha · 9º Grau</option>
                  </select>
                </Field>
                <Field label={t("reg.academy.years")}><Input type="number" value={head.years} onChange={(e) => setHead({ ...head, years: e.target.value })} /></Field>
              </div>
              <Field label={t("reg.academy.bjjlfId")}><Input placeholder="BJJLF-YYYY-XXXX" /></Field>
              <Field label={t("reg.email")}><Input type="email" /></Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className={cn(typo.heading.md, "text-gold")}>{t("reg.academy.data.title")}</h2>
              <Field label={t("reg.academy.name")}><Input value={academy.name} onChange={(e) => setAcademy({ ...academy, name: e.target.value })} /></Field>
              <div>
                <Label className="mb-2 block uppercase tracking-wider text-xs text-muted-foreground">{t("reg.academy.logo")}</Label>
                <ImageUploader
                  folder="academies"
                  label=""
                  value={academy.logo_url}
                  onChange={(url) => setAcademy((a) => ({ ...a, logo_url: url }))}
                  previewClassName="mt-2 h-20 w-20 object-cover border"
                />
                <p className="mt-1 text-xs text-muted-foreground">{t("reg.academy.logo.help")}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t("reg.academy.country")}><Input value={academy.country} onChange={(e) => setAcademy({ ...academy, country: e.target.value })} /></Field>
                <Field label={t("reg.academy.city")}><Input value={academy.city} onChange={(e) => setAcademy({ ...academy, city: e.target.value })} /></Field>
              </div>
              <Field label={t("reg.academy.address")}><Input value={academy.address} onChange={(e) => setAcademy({ ...academy, address: e.target.value })} /></Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t("reg.phone")}><Input /></Field>
                <Field label={t("reg.academy.website")}><Input placeholder="https://" /></Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className={cn(typo.heading.md, "text-gold")}>{t("reg.academy.others.title")}</h2>
              <p className="text-sm text-muted-foreground">{t("reg.academy.others.desc")}</p>

              <div className="space-y-3">
                {profs.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border border-border bg-background">
                    <Award className="h-5 w-5 text-gold" />
                    <div className="flex-1">
                      <div className={cn(typo.heading.sm, "text-base")}>{p.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.belt}</div>
                    </div>
                    <button onClick={() => setProfs((arr) => arr.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-primary"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <ProfessorAdd onAdd={(p) => setProfs((arr) => [...arr, p])} nameLabel={t("reg.academy.profName")} beltLabel={t("reg.academy.belt")} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className={cn(typo.heading.md, "text-gold")}>{t("reg.academy.payment.title")}</h2>
              <div className="border border-gold/40 bg-gold/5 p-5 flex items-center justify-between">
                <div>
                  <p className={cn(typo.button.md, "text-gold")}>{t("reg.academy.payment.label")}</p>
                  <p className={typo.heading.md}>$ 240.00 <span className={cn(typo.body.sm, "text-muted-foreground")}>{t("reg.payment.year")}</span></p>
                </div>
              </div>
              <Field label={t("reg.card.number")}><Input placeholder="1234 5678 9012 3456" /></Field>
              <div className="grid sm:grid-cols-3 gap-5">
                <Field label={t("reg.card.expiry")}><Input placeholder="MM/AA" /></Field>
                <Field label={t("reg.card.cvc")}><Input placeholder="123" /></Field>
                <Field label={t("reg.card.zip")}><Input placeholder="00000" /></Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-5">
              <CheckCircle2 className="h-14 w-14 text-gold mx-auto" />
              <h2 className={typo.heading.lg}>{t("reg.academy.cert.title")}</h2>
              <p className="text-muted-foreground">{t("reg.academy.cert.ready")}</p>

              <div className="mx-auto max-w-xl border-4 border-double border-gold p-8 bg-gradient-to-b from-card to-navbar text-center">
                <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-2">{t("reg.academy.cert.label")}</div>
                <h3 className={cn(typo.heading.lg, "mb-1")}>{academy.name || "—"}</h3>
                <p className="text-sm text-foreground/60 mb-6">{academy.city}{academy.city && academy.country ? ", " : ""}{academy.country}</p>
                <p className="text-sm text-foreground/80 max-w-md mx-auto">{t("reg.academy.cert.officially")}</p>
                <div className="mt-6 flex justify-between text-xs uppercase tracking-wider text-foreground/60">
                  <div>
                    <div className="text-gold">{t("reg.academy.cert.head")}</div>
                    <div className="text-foreground">{head.name || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gold">{t("reg.academy.cert.no")}</div>
                    <div className={cn(typo.mono.sm, "text-foreground")}>BJJLF-AC-{new Date().getFullYear()}-{(Math.random() * 999).toFixed(0).padStart(3, "0")}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            <Button variant="outline" onClick={prev} disabled={step === 0}><ArrowLeft /> {t("reg.back")}</Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={next} className={typo.button.md}>{step === 3 ? t("reg.payment.confirm") : t("reg.next")} <ArrowRight /></Button>
            ) : (
              <Button variant="gold" className={typo.button.md}>{t("reg.academy.downloadCert")}</Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfessorAdd({ onAdd, nameLabel, beltLabel }: { onAdd: (p: { name: string; belt: string }) => void; nameLabel: string; beltLabel: string }) {
  const [n, setN] = useState("");
  const [b, setB] = useState("Preta · 1º Grau");
  return (
    <div className="flex gap-3 items-end p-3 border border-dashed border-border">
      <div className="flex-1"><Label className="mb-2 block uppercase tracking-wider text-xs text-muted-foreground">{nameLabel}</Label><Input value={n} onChange={(e) => setN(e.target.value)} /></div>
      <div className="w-44"><Label className="mb-2 block uppercase tracking-wider text-xs text-muted-foreground">{beltLabel}</Label>
        <select className="h-9 w-full bg-input border border-border px-3 text-sm rounded-md" value={b} onChange={(e) => setB(e.target.value)}>
          <option>Marrom</option><option>Preta Lisa</option><option>Preta · 1º Grau</option><option>Preta · 2º Grau</option><option>Preta · 3º Grau</option><option>Preta · 4º Grau</option><option>Preta · 5º Grau</option><option>Preta · 6º Grau</option><option>Vermelha e Preta · 7º Grau</option><option>Vermelha e Branca · 8º Grau</option><option>Vermelha · 9º Grau</option>
        </select>
      </div>
      <Button variant="outline" onClick={() => { if (n.trim()) { onAdd({ name: n, belt: b }); setN(""); } }}><Plus className="h-4 w-4" /></Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-2 block uppercase tracking-wider text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
