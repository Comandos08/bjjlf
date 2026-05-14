import { useEffect, useState } from "react";
import { Stepper, PageHero } from "@/components/Stepper";
import { BELTS, type BeltColor } from "@/lib/belts";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, CheckCircle2, Search, CreditCard, Lock, AlertTriangle, Loader2 } from "lucide-react";
import dragon from "@/assets/dragon-logo.png";
import { typo } from "@/lib/typography";
import { cn } from "@/lib/utils";
import { useServerFn } from "@tanstack/react-start";
import { createStripeCheckout } from "@/server/stripe.functions";

type AthleteCurrency = "BRL" | "EUR" | "USD";
const ATHLETE_PRICES: Record<AthleteCurrency, { cents: number; label: string }> = {
  BRL: { cents: 5000, label: "R$ 50,00" },
  EUR: { cents: 1000, label: "€ 10,00" },
  USD: { cents: 1000, label: "$ 10,00" },
};

export function AthleteRegistration() {
  const { t } = useI18n();
  const STEPS = [
    t("reg.step.account"),
    t("reg.step.personal"),
    t("reg.step.sport"),
    t("reg.step.guardian"),
    t("reg.step.payment"),
    t("reg.step.confirm"),
  ];

  const [step, setStep] = useState(0);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const checkout = useServerFn(createStripeCheckout);
  const [currency, setCurrency] = useState<AthleteCurrency>("BRL");
  const priceInfo = ATHLETE_PRICES[currency];

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") setStep(5);
  }, []);

  const startStripeCheckout = async () => {
    setPayError(null);
    setPaying(true);
    try {
      const res = await checkout({
        data: {
          kind: "event_registration", // reused billing kind; no internal record yet
          amountCents: priceInfo.cents,
          currency,
          description: `BJJLF Annual Membership — ${data.fullName || data.email || "Athlete"}`,
          customerEmail: data.email || undefined,
          origin: window.location.origin,
          successPath: `/register/athlete?paid=1`,
          cancelPath: `/register/athlete?canceled=1`,
          metadata: {
            purpose: "athlete_membership",
            email: data.email,
            full_name: data.fullName,
          },
        },
      });
      if (!res.ok || !res.url) throw new Error(res.ok ? "Stripe URL ausente" : res.error);
      window.location.href = res.url;
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment error");
      setPaying(false);
    }
  };

  const [data, setData] = useState({
    email: "",
    password: "",
    fullName: "",
    birthDate: "",
    gender: "male",
    nationality: "Brasil",
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

  const isMinor = data.birthDate ? new Date().getFullYear() - new Date(data.birthDate).getFullYear() < 18 : false;
  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="bg-[#F7F9FC] min-h-screen">
      <PageHero
        breadcrumb={[{ label: t("home.cta.athleteBtn") }]}
        kicker={t("reg.athlete.kicker")}
        title={t("reg.athlete.title").toUpperCase()}
        desc={t("reg.athlete.subtitle")}
      />

      <section className="max-w-[920px] mx-auto px-4 lg:px-6 py-12">
        <Stepper steps={STEPS} current={step} />

        <div className="bg-white border border-[#E5E5E5] p-6 md:p-10">
          {step === 0 && (
            <div className="space-y-5">
              <FormSectionTitle>{t("reg.account.title")}</FormSectionTitle>
              <Field label={t("reg.email")}><TextInput type="email" value={data.email} onChange={(v) => set("email", v)} placeholder="" /></Field>
              <Field label={t("reg.password")}><TextInput type="password" value={data.password} onChange={(v) => set("password", v)} placeholder={t("reg.password.min")} /></Field>
              <Field label={t("reg.password.confirm")}><TextInput type="password" placeholder={t("reg.password.min")} /></Field>
              <p className={cn(typo.body.xs, "text-[#6B7280] flex items-center gap-2")}>
                <Lock className="h-3 w-3 text-gold" /> {t("reg.encrypted")}
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <FormSectionTitle>{t("reg.personal.title")}</FormSectionTitle>
              <Field label={t("reg.fullName")}><TextInput value={data.fullName} onChange={(v) => set("fullName", v)} /></Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t("reg.dob")}><TextInput type="date" value={data.birthDate} onChange={(v) => set("birthDate", v)} /></Field>
                <Field label={t("reg.gender")}>
                  <SelectInput value={data.gender} onChange={(v) => set("gender", v)} options={[
                    { v: "male", l: t("reg.male") },
                    { v: "female", l: t("reg.female") },
                  ]} />
                </Field>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t("reg.nationality")}><TextInput value={data.nationality} onChange={(v) => set("nationality", v)} /></Field>
                <Field label={t("reg.document")}><TextInput value={data.document} onChange={(v) => set("document", v)} /></Field>
              </div>
              <Field label={t("reg.phone")}><TextInput value={data.phone} onChange={(v) => set("phone", v)} placeholder="+55 ..." /></Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <FormSectionTitle>{t("reg.sport.title")}</FormSectionTitle>

              <div>
                <FieldLabel>{t("reg.belt.current")}</FieldLabel>
                <div className="flex flex-wrap gap-2 mt-2">
                  {BELTS.map((b) => {
                    const selected = data.belt === b.value;
                    return (
                      <button
                        key={b.value}
                        type="button"
                        onClick={() => set("belt", b.value)}
                        className={cn(typo.button.md, "px-4 py-2 transition-base")}
                        style={{
                          background: b.hex,
                          color: b.text,
                          border: "1px solid " + (b.value === "white" ? "#E5E5E5" : b.hex),
                          boxShadow: selected ? "0 0 0 3px #B8960C" : "none",
                          transform: selected ? "scale(1.05)" : "scale(1)",
                        }}
                      >
                        {b.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label={t("reg.academy")}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                  <TextInput className="pl-9" placeholder={t("reg.academy.search")} value={data.academy} onChange={(v) => set("academy", v)} />
                </div>
                {data.academy.length > 1 && (
                  <div className="mt-1 border border-[#E5E5E5] bg-white max-h-40 overflow-auto">
                    {["Gracie Legacy — Rio", "Checkmat HQ", "Atos San Diego", "Alliance Lisbon"]
                      .filter((a) => a.toLowerCase().includes(data.academy.toLowerCase()))
                      .map((a) => (
                        <button key={a} type="button" onClick={() => set("academy", a)} className={cn(typo.body.sm, "w-full text-left px-3 py-2 text-[#0F0F0F] hover:bg-[#F7F9FC]")}>
                          {a}
                        </button>
                      ))}
                  </div>
                )}
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={t("reg.professor")}><TextInput value={data.professor} onChange={(v) => set("professor", v)} placeholder={t("reg.professor.placeholder")} /></Field>
                <Field label={t("reg.weight")}><TextInput value={data.weight} onChange={(v) => set("weight", v)} type="number" /></Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <FormSectionTitle>{t("reg.guardian.title")}</FormSectionTitle>
              {isMinor ? (
                <>
                  <div
                    className="p-4 flex items-start gap-3"
                    style={{ borderLeft: "4px solid #B8960C", background: "#FFFBEB", color: "#92400E" }}
                  >
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                    <p className={typo.body.sm}>{t("reg.guardian.required")}</p>
                  </div>
                  <Field label={t("reg.guardian.name")}><TextInput value={data.guardianName} onChange={(v) => set("guardianName", v)} /></Field>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field label={t("reg.guardian.relation")}>
                      <SelectInput value={data.guardianRelation} onChange={(v) => set("guardianRelation", v)} options={[
                        { v: "Parent", l: t("reg.guardian.parent") },
                        { v: "Legal", l: t("reg.guardian.legal") },
                        { v: "Other", l: t("reg.guardian.other") },
                      ]} />
                    </Field>
                    <Field label={t("reg.guardian.doc")}><TextInput value={data.guardianDoc} onChange={(v) => set("guardianDoc", v)} /></Field>
                  </div>
                  <Field label={t("reg.guardian.phone")}><TextInput value={data.guardianPhone} onChange={(v) => set("guardianPhone", v)} /></Field>
                </>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-gold mx-auto mb-3" />
                  <p className={cn(typo.body.md, "text-[#0F0F0F] font-semibold")}>{t("reg.guardian.adult")}</p>
                  <p className={cn(typo.body.xs, "text-[#6B7280] mt-2")}>{t("reg.guardian.continue")}</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <FormSectionTitle>{t("reg.payment.title")}</FormSectionTitle>
              <div className="border border-gold p-5" style={{ background: "#FFFBEB" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(typo.button.md, "text-gold")}>{t("reg.payment.annual")}</p>
                    <p className={cn(typo.heading.md, "text-[#0F0F0F]")}>
                      {priceInfo.label} <span className={cn(typo.body.sm, "text-[#6B7280] font-normal")}>{t("reg.payment.year")}</span>
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-gold" />
                </div>
                <div className="mt-4 flex gap-2">
                  {(["BRL", "EUR", "USD"] as AthleteCurrency[]).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCurrency(c)}
                      className={cn(typo.button.sm, "flex-1 px-3 py-2 border transition-base", currency === c ? "bg-primary text-white border-primary" : "bg-white text-[#0F0F0F] border-[#E5E5E5] hover:border-primary")}
                    >
                      {c} — {ATHLETE_PRICES[c].label}
                    </button>
                  ))}
                </div>
              </div>
              {payError && (
                <div className="border border-red-300 bg-red-50 text-red-700 text-sm p-3">{payError}</div>
              )}
              <button
                onClick={() => void startStripeCheckout()}
                disabled={paying}
                className={cn(typo.button.md, "w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary-dark transition-base disabled:opacity-60")}
              >
                {paying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Redirecionando...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Pagar com Stripe — {priceInfo.label}
                  </>
                )}
              </button>
              <p className={cn(typo.body.xs, "text-[#6B7280] text-center")}>
                Pagamento seguro processado pelo Stripe.
              </p>
            </div>
          )}

          {step === 5 && <MembershipCard data={data} />}

          <div className="flex justify-between mt-10 pt-6 border-t border-[#E5E5E5]">
            <button
              onClick={prev}
              disabled={step === 0}
              className={cn(typo.button.md, "inline-flex items-center gap-2 px-5 py-2.5 border border-[#E5E5E5] text-[#6B7280] hover:bg-[#F7F9FC] disabled:opacity-30 transition-base")}
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("reg.back")}
            </button>
            {step < 4 ? (
              <button
                onClick={next}
                className={cn(typo.button.md, "inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary-dark transition-base")}
              >
                {t("reg.next")} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : step === 5 ? (
              <button className={cn(typo.button.md, "inline-flex items-center gap-2 px-6 py-3 bg-gold text-[#0F0F0F] hover:bg-gold-light transition-base")}>
                {t("reg.download")}
              </button>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function FormSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={cn(typo.heading.sm, "text-[#0F0F0F] mb-2")}>{children}</h2>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className={cn(typo.label.md, "block text-[#374151]")}>{children}</label>
  );
}

type TextInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  onChange?: (v: string) => void;
};

function TextInput({ className = "", onChange, ...rest }: TextInputProps) {
  return (
    <input
      {...rest}
      onChange={(e) => onChange?.(e.target.value)}
      className={cn(typo.body.sm, "w-full h-10 px-3.5 border border-[#E5E5E5] bg-white text-[#0F0F0F] focus:outline-none focus:border-primary transition-base", className)}
      onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(196, 30, 58, 0.1)")}
      onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
    />
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(typo.body.sm, "w-full h-10 px-3.5 border border-[#E5E5E5] bg-white text-[#0F0F0F] focus:outline-none focus:border-primary transition-base cursor-pointer")}
    >
      {options.map((o) => (
        <option key={o.v} value={o.v}>{o.l}</option>
      ))}
    </select>
  );
}

function MembershipCard({ data }: { data: { fullName: string; belt: BeltColor; academy: string; nationality: string } }) {
  const { t } = useI18n();
  const belt = BELTS.find((b) => b.value === data.belt);
  // Generate ID only on client to avoid SSR hydration mismatch
  const [memberId, setMemberId] = useState("BJJLF-2025-0000");
  useEffect(() => {
    setMemberId(`BJJLF-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`);
  }, []);

  return (
    <div className="text-center">
      <CheckCircle2 className="h-14 w-14 text-gold mx-auto mb-3" />
      <h2 className={cn(typo.heading.lg, "text-[#0F0F0F]")}>{t("reg.confirm.welcome")}</h2>
      <p className={cn(typo.body.sm, "text-[#6B7280] mb-8")}>{t("reg.confirm.cardReady")}</p>

      <div className="mx-auto max-w-md aspect-[1.6/1] relative overflow-hidden border border-gold shadow-2xl shadow-primary/30" style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a0a0e 50%, #1a1a1a 100%)" }}>
        <img src={dragon} alt="" className="absolute -right-8 -top-8 h-48 w-48 opacity-15" />
        <div className="absolute inset-0 p-5 flex flex-col text-left">
          <div className="flex items-center justify-between">
            <div>
              <div className={cn(typo.heading.md, "text-gold tracking-[0.05em]")}>BJJLF</div>
              <div className={cn(typo.label.sm, "text-white/60 tracking-[0.2em] text-[9px]")}>Legends Federation</div>
            </div>
            <div className={cn(typo.label.sm, "text-white/60 tracking-[0.2em] text-[9px]")}>{t("reg.athleteId")}</div>
          </div>
          <div className="mt-auto">
            <div className={cn(typo.label.sm, "text-white/60 tracking-[0.2em]")}>{t("reg.member")}</div>
            <div className={cn(typo.heading.sm, "text-white text-[22px] leading-tight")}>
              {data.fullName || "Your Name"}
            </div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <div className={cn(typo.label.sm, "text-white/60 tracking-[0.2em] text-[9px]")}>Academy</div>
                <div className={cn(typo.body.sm, "text-white font-semibold")}>{data.academy || "Your Academy"}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={cn(typo.label.sm, "text-white/60 tracking-[0.2em] text-[9px]")}>Belt</div>
                  <div className={cn(typo.body.sm, "text-white font-semibold")}>{belt?.label}</div>
                </div>
                <div className="h-8 w-3" style={{ background: belt?.hex }} />
              </div>
            </div>
            <div className={cn(typo.mono.sm, "mt-2 text-white/50 text-[10px]")}>{memberId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
