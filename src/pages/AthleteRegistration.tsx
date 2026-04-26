import { useState } from "react";
import { Stepper, PageHero } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BELTS, type BeltColor } from "@/lib/belts";
import { ArrowLeft, ArrowRight, CheckCircle2, Search, CreditCard, Lock, QrCode } from "lucide-react";
import dragon from "@/assets/dragon-logo.png";

const STEPS = ["Account", "Personal", "Sport", "Guardian", "Payment", "Confirm"];

export function AthleteRegistration() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    email: "",
    password: "",
    fullName: "",
    birthDate: "",
    gender: "male",
    nationality: "Brazil",
    document: "",
    phone: "",
    belt: "white" as BeltColor,
    academy: "",
    professor: "",
    weight: "",
    guardianName: "",
    guardianRelation: "Parent",
    guardianDoc: "",
    guardianPhone: "",
  });
  const set = <K extends keyof typeof data>(k: K, v: (typeof data)[K]) => setData((d) => ({ ...d, [k]: v }));

  const isMinor = data.birthDate ? (new Date().getFullYear() - new Date(data.birthDate).getFullYear()) < 18 : false;
  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div>
      <PageHero kicker="Membership" title="Register as Athlete" desc="Become an officially registered BJJLF competitor in 6 simple steps." />

      <section className="container mx-auto px-4 lg:px-6 py-12 max-w-4xl">
        <Stepper steps={STEPS} current={step} />

        <div className="bg-card border border-border p-6 md:p-10 border-gold-hover">
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl tracking-wider text-gold">Create your account</h2>
              <Field label="Email"><Input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" /></Field>
              <Field label="Password"><Input type="password" value={data.password} onChange={(e) => set("password", e.target.value)} placeholder="At least 8 characters" /></Field>
              <Field label="Confirm password"><Input type="password" placeholder="Repeat password" /></Field>
              <p className="text-xs text-muted-foreground flex items-center gap-2"><Lock className="h-3 w-3 text-gold" /> Your data is encrypted and never shared without consent.</p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl tracking-wider text-gold">Personal information</h2>
              <Field label="Full name"><Input value={data.fullName} onChange={(e) => set("fullName", e.target.value)} /></Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Date of birth"><Input type="date" value={data.birthDate} onChange={(e) => set("birthDate", e.target.value)} /></Field>
                <Field label="Gender">
                  <select className="h-9 w-full bg-input border border-border px-3 text-sm rounded-md" value={data.gender} onChange={(e) => set("gender", e.target.value)}>
                    <option value="male">Male</option><option value="female">Female</option>
                  </select>
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Nationality"><Input value={data.nationality} onChange={(e) => set("nationality", e.target.value)} /></Field>
                <Field label="Document / ID"><Input value={data.document} onChange={(e) => set("document", e.target.value)} /></Field>
              </div>
              <Field label="Phone"><Input value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+55 ..." /></Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl tracking-wider text-gold">Sport information</h2>

              <div>
                <Label className="mb-3 block uppercase tracking-wider text-xs text-muted-foreground">Current belt</Label>
                <div className="grid grid-cols-5 gap-3">
                  {BELTS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => set("belt", b.value)}
                      className={`group flex flex-col items-center gap-2 p-3 border-2 transition-all ${data.belt === b.value ? "border-primary bg-primary/5" : "border-border hover:border-gold"}`}
                    >
                      <div className="w-full h-10 rounded-sm flex items-center justify-end pr-2 relative" style={{ background: b.hex, color: b.text }}>
                        <span className="absolute right-1 top-1 bottom-1 w-3 bg-black/70 rounded-sm" />
                      </div>
                      <span className="font-heading text-xs uppercase tracking-wider">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Academy">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Search affiliated academy..." value={data.academy} onChange={(e) => set("academy", e.target.value)} />
                </div>
                {data.academy.length > 1 && (
                  <div className="mt-2 border border-border bg-background max-h-40 overflow-auto">
                    {["Gracie Legacy — Rio", "Checkmat HQ", "Atos San Diego", "Alliance Lisbon"].filter((a) => a.toLowerCase().includes(data.academy.toLowerCase())).map((a) => (
                      <button key={a} type="button" onClick={() => set("academy", a)} className="w-full text-left px-3 py-2 text-sm hover:bg-navbar">{a}</button>
                    ))}
                  </div>
                )}
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Professor"><Input value={data.professor} onChange={(e) => set("professor", e.target.value)} placeholder="Your instructor" /></Field>
                <Field label="Weight (kg)"><Input value={data.weight} onChange={(e) => set("weight", e.target.value)} type="number" /></Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl tracking-wider text-gold">Guardian information</h2>
              {isMinor ? (
                <>
                  <p className="text-sm text-foreground/70 border-l-2 border-primary pl-3">Athlete is under 18. Guardian information is required.</p>
                  <Field label="Guardian full name"><Input value={data.guardianName} onChange={(e) => set("guardianName", e.target.value)} /></Field>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label="Relationship">
                      <select className="h-9 w-full bg-input border border-border px-3 text-sm rounded-md" value={data.guardianRelation} onChange={(e) => set("guardianRelation", e.target.value)}>
                        <option>Parent</option><option>Legal guardian</option><option>Other</option>
                      </select>
                    </Field>
                    <Field label="Document"><Input value={data.guardianDoc} onChange={(e) => set("guardianDoc", e.target.value)} /></Field>
                  </div>
                  <Field label="Guardian phone"><Input value={data.guardianPhone} onChange={(e) => set("guardianPhone", e.target.value)} /></Field>
                </>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-gold mx-auto mb-3" />
                  <p className="text-foreground/80">Athlete is of legal age — no guardian required.</p>
                  <p className="text-xs text-muted-foreground mt-2">You can continue to the next step.</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl tracking-wider text-gold">Payment</h2>
              <div className="border border-gold/40 bg-gold/5 p-5 flex items-center justify-between">
                <div>
                  <p className="font-heading uppercase tracking-wider text-sm text-gold">Annual Membership</p>
                  <p className="text-2xl font-display tracking-wider">$ 89.00 <span className="text-sm text-muted-foreground">/ year</span></p>
                </div>
                <CreditCard className="h-8 w-8 text-gold" />
              </div>
              <Field label="Card number"><Input placeholder="1234 5678 9012 3456" /></Field>
              <div className="grid sm:grid-cols-3 gap-5">
                <Field label="Expiry"><Input placeholder="MM/YY" /></Field>
                <Field label="CVC"><Input placeholder="123" /></Field>
                <Field label="ZIP"><Input placeholder="00000" /></Field>
              </div>
              <Field label="Cardholder name"><Input placeholder="As shown on card" /></Field>
            </div>
          )}

          {step === 5 && <MembershipCard data={data} />}

          <div className="flex justify-between mt-10 pt-6 border-t border-border">
            <Button variant="outline" onClick={prev} disabled={step === 0}><ArrowLeft /> Back</Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={next} className="font-heading uppercase tracking-wider">{step === 4 ? "Pay & Confirm" : "Next"} <ArrowRight /></Button>
            ) : (
              <Button variant="gold" className="font-heading uppercase tracking-wider">Download Card</Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-2 block uppercase tracking-wider text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function MembershipCard({ data }: { data: { fullName: string; belt: BeltColor; academy: string; nationality: string } }) {
  const belt = BELTS.find((b) => b.value === data.belt);
  return (
    <div className="text-center">
      <CheckCircle2 className="h-14 w-14 text-gold mx-auto mb-3" />
      <h2 className="font-display text-3xl tracking-wider">Welcome to BJJLF!</h2>
      <p className="text-muted-foreground mb-8">Your digital membership card is ready.</p>

      <div className="mx-auto max-w-md aspect-[1.6/1] relative overflow-hidden rounded-xl border border-gold/40 shadow-2xl shadow-primary/30" style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a0a0e 50%, #1a1a1a 100%)" }}>
        <img src={dragon} alt="" className="absolute -right-8 -top-8 h-48 w-48 opacity-15" />
        <div className="absolute inset-0 p-5 flex flex-col text-left">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-xl tracking-wider text-gold">BJJLF</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/60">Legends Federation</div>
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/60">Athlete ID</div>
          </div>
          <div className="mt-auto">
            <div className="text-[10px] uppercase tracking-[0.2em] text-foreground/60">Member</div>
            <div className="font-display text-2xl tracking-wider text-foreground leading-tight">{data.fullName || "Your Name"}</div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/60">Academy</div>
                <div className="font-heading text-sm">{data.academy || "Your Academy"}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-foreground/60">Belt</div>
                  <div className="font-heading text-sm">{belt?.label}</div>
                </div>
                <div className="h-8 w-3 rounded-sm" style={{ background: belt?.hex }} />
              </div>
            </div>
            <div className="mt-2 font-mono text-[10px] text-foreground/50">BJJLF-{new Date().getFullYear()}-{(Math.random() * 9999).toFixed(0).padStart(4, "0")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
