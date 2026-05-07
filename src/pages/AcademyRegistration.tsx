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

const STEPS = ["Head Professor", "Academy", "Other Professors", "Payment", "Certificate"];

export function AcademyRegistration() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [profs, setProfs] = useState<{ name: string; belt: string }[]>([]);
  const [academy, setAcademy] = useState({ name: "", country: "", city: "", address: "", logo_url: "" });
  const [head, setHead] = useState({ name: "", belt: "Black", years: "" });

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div>
      <PageHero kicker="Affiliation" title="Register your Academy" desc="Affiliate your school with BJJLF in 5 simple steps and get your official certificate." />

      <section className="container mx-auto px-4 lg:px-6 py-12 max-w-4xl">
        <Stepper steps={STEPS} current={step} />

        <div className="bg-card border border-border p-6 md:p-10 border-gold-hover">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className={cn(typo.heading.md, "text-gold")}>Head Professor</h2>
              <Field label="Full name"><Input value={head.name} onChange={(e) => setHead({ ...head, name: e.target.value })} /></Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Belt grade">
                  <select className="h-9 w-full bg-input border border-border px-3 text-sm rounded-md" value={head.belt} onChange={(e) => setHead({ ...head, belt: e.target.value })}>
                    <option>Preta · 1º Grau</option><option>Preta · 2º Grau</option><option>Preta · 3º Grau</option><option>Preta · 4º Grau</option><option>Vermelha e Preta · 7º Dan</option><option>Vermelha e Branca · 8º Dan</option><option>Vermelha · 9º Dan</option>
                  </select>
                </Field>
                <Field label="Years teaching"><Input type="number" value={head.years} onChange={(e) => setHead({ ...head, years: e.target.value })} /></Field>
              </div>
              <Field label="BJJLF Athlete ID"><Input placeholder="BJJLF-YYYY-XXXX" /></Field>
              <Field label="Email"><Input type="email" /></Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className={cn(typo.heading.md, "text-gold")}>Academy data</h2>
              <Field label="Academy name"><Input value={academy.name} onChange={(e) => setAcademy({ ...academy, name: e.target.value })} /></Field>
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
                <Field label="Country"><Input value={academy.country} onChange={(e) => setAcademy({ ...academy, country: e.target.value })} /></Field>
                <Field label="City"><Input value={academy.city} onChange={(e) => setAcademy({ ...academy, city: e.target.value })} /></Field>
              </div>
              <Field label="Full address"><Input value={academy.address} onChange={(e) => setAcademy({ ...academy, address: e.target.value })} /></Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Phone"><Input /></Field>
                <Field label="Website"><Input placeholder="https://" /></Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className={cn(typo.heading.md, "text-gold")}>Additional professors</h2>
              <p className="text-sm text-muted-foreground">Add other professors that should be linked to this academy.</p>

              <div className="space-y-3">
                {profs.map((p, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 border border-border bg-background">
                    <Award className="h-5 w-5 text-gold" />
                    <div className="flex-1">
                      <div className={cn(typo.heading.sm, "text-base")}>{p.name || "Unnamed"}</div>
                      <div className="text-xs text-muted-foreground">{p.belt}</div>
                    </div>
                    <button onClick={() => setProfs((arr) => arr.filter((_, i) => i !== idx))} className="text-muted-foreground hover:text-primary"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <ProfessorAdd onAdd={(p) => setProfs((arr) => [...arr, p])} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className={cn(typo.heading.md, "text-gold")}>Payment</h2>
              <div className="border border-gold/40 bg-gold/5 p-5 flex items-center justify-between">
                <div>
                  <p className={cn(typo.button.md, "text-gold")}>Academy Affiliation</p>
                  <p className={typo.heading.md}>$ 240.00 <span className={cn(typo.body.sm, "text-muted-foreground")}>/ year</span></p>
                </div>
              </div>
              <Field label="Card number"><Input placeholder="1234 5678 9012 3456" /></Field>
              <div className="grid sm:grid-cols-3 gap-5">
                <Field label="Expiry"><Input placeholder="MM/YY" /></Field>
                <Field label="CVC"><Input placeholder="123" /></Field>
                <Field label="ZIP"><Input placeholder="00000" /></Field>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center space-y-5">
              <CheckCircle2 className="h-14 w-14 text-gold mx-auto" />
              <h2 className={typo.heading.lg}>Affiliation Complete</h2>
              <p className="text-muted-foreground">Your official affiliation certificate is ready.</p>

              <div className="mx-auto max-w-xl border-4 border-double border-gold p-8 bg-gradient-to-b from-card to-navbar text-center">
                <div className="text-[10px] uppercase tracking-[0.4em] text-gold mb-2">Certificate of Affiliation</div>
                <h3 className={cn(typo.heading.lg, "mb-1")}>{academy.name || "Your Academy"}</h3>
                <p className="text-sm text-foreground/60 mb-6">{academy.city}{academy.city && academy.country ? ", " : ""}{academy.country}</p>
                <p className="text-sm text-foreground/80 max-w-md mx-auto">Officially recognized as an affiliated academy of the Brazilian Jiu-Jitsu Legends Federation.</p>
                <div className="mt-6 flex justify-between text-xs uppercase tracking-wider text-foreground/60">
                  <div>
                    <div className="text-gold">Head Professor</div>
                    <div className="text-foreground">{head.name || "—"}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-gold">Certificate №</div>
                    <div className={cn(typo.mono.sm, "text-foreground")}>BJJLF-AC-{new Date().getFullYear()}-{(Math.random() * 999).toFixed(0).padStart(3, "0")}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            <Button variant="outline" onClick={prev} disabled={step === 0}><ArrowLeft /> Back</Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={next} className={typo.button.md}>{step === 3 ? "Pay & Confirm" : "Next"} <ArrowRight /></Button>
            ) : (
              <Button variant="gold" className={typo.button.md}>Download Certificate</Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfessorAdd({ onAdd }: { onAdd: (p: { name: string; belt: string }) => void }) {
  const [n, setN] = useState("");
  const [b, setB] = useState("Black 1st Degree");
  return (
    <div className="flex gap-3 items-end p-3 border border-dashed border-border">
      <div className="flex-1"><Label className="mb-2 block uppercase tracking-wider text-xs text-muted-foreground">Name</Label><Input value={n} onChange={(e) => setN(e.target.value)} /></div>
      <div className="w-44"><Label className="mb-2 block uppercase tracking-wider text-xs text-muted-foreground">Belt</Label>
        <select className="h-9 w-full bg-input border border-border px-3 text-sm rounded-md" value={b} onChange={(e) => setB(e.target.value)}>
          <option>Brown</option><option>Black 1st Degree</option><option>Black 2nd Degree</option><option>Black 3rd Degree</option>
        </select>
      </div>
      <Button variant="outline" onClick={() => { if (n.trim()) { onAdd({ name: n, belt: b }); setN(""); } }}><Plus className="h-4 w-4" /></Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label className="mb-2 block uppercase tracking-wider text-xs text-muted-foreground">{label}</Label>{children}</div>;
}
