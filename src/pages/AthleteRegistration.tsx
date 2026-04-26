import { useEffect, useState } from "react";
import { Stepper, PageHero } from "@/components/Stepper";
import { BELTS, type BeltColor } from "@/lib/belts";
import { useI18n } from "@/lib/i18n";
import { ArrowLeft, ArrowRight, CheckCircle2, Search, CreditCard, Lock, AlertTriangle } from "lucide-react";
import dragon from "@/assets/dragon-logo.png";

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
              <Field label={t("reg.email")}><TextInput type="email" value={data.email} onChange={(v) => set("email", v)} placeholder="you@email.com" /></Field>
              <Field label={t("reg.password")}><TextInput type="password" value={data.password} onChange={(v) => set("password", v)} placeholder={t("reg.password.min")} /></Field>
              <Field label={t("reg.password.confirm")}><TextInput type="password" placeholder={t("reg.password.min")} /></Field>
              <p className="text-[12px] text-[#6B7280] flex items-center gap-2" style={{ fontFamily: "DM Sans" }}>
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
                        className="px-4 py-2 text-[12px] uppercase tracking-[0.08em] font-bold transition-base"
                        style={{
                          background: b.hex,
                          color: b.text,
                          border: "1px solid " + (b.value === "white" ? "#E5E5E5" : b.hex),
                          boxShadow: selected ? "0 0 0 3px #B8960C" : "none",
                          transform: selected ? "scale(1.05)" : "scale(1)",
                          fontFamily: "Barlow Condensed",
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
                        <button key={a} type="button" onClick={() => set("academy", a)} className="w-full text-left px-3 py-2 text-[13px] text-[#0F0F0F] hover:bg-[#F7F9FC]" style={{ fontFamily: "DM Sans" }}>
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
                    <p className="text-[14px]" style={{ fontFamily: "DM Sans" }}>{t("reg.guardian.required")}</p>
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
                  <p className="text-[#0F0F0F] text-[15px]" style={{ fontFamily: "DM Sans", fontWeight: 600 }}>{t("reg.guardian.adult")}</p>
                  <p className="text-[12px] text-[#6B7280] mt-2" style={{ fontFamily: "DM Sans" }}>{t("reg.guardian.continue")}</p>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <FormSectionTitle>{t("reg.payment.title")}</FormSectionTitle>
              <div className="border border-gold p-5 flex items-center justify-between" style={{ background: "#FFFBEB" }}>
                <div>
                  <p className="text-gold text-[12px] uppercase tracking-[0.1em] font-bold" style={{ fontFamily: "Barlow Condensed" }}>{t("reg.payment.annual")}</p>
                  <p className="text-[28px] text-[#0F0F0F]" style={{ fontFamily: "Barlow Condensed", fontWeight: 900 }}>
                    $ 89.00 <span className="text-[13px] text-[#6B7280]" style={{ fontFamily: "DM Sans", fontWeight: 400 }}>{t("reg.payment.year")}</span>
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-gold" />
              </div>
              <Field label={t("reg.card.number")}><TextInput placeholder="1234 5678 9012 3456" /></Field>
              <div className="grid sm:grid-cols-3 gap-5">
                <Field label={t("reg.card.expiry")}><TextInput placeholder="MM/YY" /></Field>
                <Field label={t("reg.card.cvc")}><TextInput placeholder="123" /></Field>
                <Field label={t("reg.card.zip")}><TextInput placeholder="00000" /></Field>
              </div>
              <Field label={t("reg.card.holder")}><TextInput placeholder={t("reg.card.holder.placeholder")} /></Field>
            </div>
          )}

          {step === 5 && <MembershipCard data={data} />}

          <div className="flex justify-between mt-10 pt-6 border-t border-[#E5E5E5]">
            <button
              onClick={prev}
              disabled={step === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[12px] uppercase tracking-[0.08em] font-bold border border-[#E5E5E5] text-[#6B7280] hover:bg-[#F7F9FC] disabled:opacity-30 transition-base"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> {t("reg.back")}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="inline-flex items-center gap-2 px-6 py-3 text-[12px] uppercase tracking-[0.08em] font-bold bg-primary text-white hover:bg-primary-dark transition-base"
              >
                {step === 4 ? t("reg.payConfirm") : t("reg.next")} <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button className="inline-flex items-center gap-2 px-6 py-3 text-[12px] uppercase tracking-[0.08em] font-bold bg-gold text-[#0F0F0F] hover:bg-gold-light transition-base">
                {t("reg.download")}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function FormSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[#0F0F0F] text-[20px] uppercase tracking-[0.04em] mb-2" style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}>
      {children}
    </h2>
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
    <label className="block text-[11px] uppercase tracking-[0.06em] text-[#374151]" style={{ fontFamily: "DM Sans", fontWeight: 600 }}>
      {children}
    </label>
  );
}

function TextInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { value?: string; onChange?: (v: string) => void }) {
  const { onChange, ...rest } = props;
  return (
    <input
      {...rest}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full h-10 px-3.5 border border-[#E5E5E5] bg-white text-[14px] text-[#0F0F0F] focus:outline-none focus:border-primary transition-base ${className}`}
      style={{ fontFamily: "DM Sans", boxShadow: "none" }}
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
      className="w-full h-10 px-3.5 border border-[#E5E5E5] bg-white text-[14px] text-[#0F0F0F] focus:outline-none focus:border-primary transition-base cursor-pointer"
      style={{ fontFamily: "DM Sans" }}
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
      <h2 className="text-[#0F0F0F] text-[28px] uppercase" style={{ fontFamily: "Barlow Condensed", fontWeight: 900, letterSpacing: "0.02em" }}>
        {t("reg.confirm.welcome")}
      </h2>
      <p className="text-[#6B7280] mb-8 text-[14px]" style={{ fontFamily: "DM Sans" }}>{t("reg.confirm.cardReady")}</p>

      <div className="mx-auto max-w-md aspect-[1.6/1] relative overflow-hidden border border-gold shadow-2xl shadow-primary/30" style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2a0a0e 50%, #1a1a1a 100%)" }}>
        <img src={dragon} alt="" className="absolute -right-8 -top-8 h-48 w-48 opacity-15" />
        <div className="absolute inset-0 p-5 flex flex-col text-left">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gold text-[20px]" style={{ fontFamily: "Barlow Condensed", fontWeight: 900, letterSpacing: "0.05em" }}>BJJLF</div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-white/60" style={{ fontFamily: "DM Sans" }}>Legends Federation</div>
            </div>
            <div className="text-[9px] uppercase tracking-[0.2em] text-white/60" style={{ fontFamily: "DM Sans" }}>{t("reg.athleteId")}</div>
          </div>
          <div className="mt-auto">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/60" style={{ fontFamily: "DM Sans" }}>{t("reg.member")}</div>
            <div className="text-white text-[22px] leading-tight" style={{ fontFamily: "Barlow Condensed", fontWeight: 800, letterSpacing: "0.02em" }}>
              {data.fullName || "Your Name"}
            </div>
            <div className="flex items-end justify-between mt-2">
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-white/60" style={{ fontFamily: "DM Sans" }}>Academy</div>
                <div className="text-white text-[13px]" style={{ fontFamily: "DM Sans", fontWeight: 600 }}>{data.academy || "Your Academy"}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-white/60" style={{ fontFamily: "DM Sans" }}>Belt</div>
                  <div className="text-white text-[13px]" style={{ fontFamily: "DM Sans", fontWeight: 600 }}>{belt?.label}</div>
                </div>
                <div className="h-8 w-3" style={{ background: belt?.hex }} />
              </div>
            </div>
            <div className="mt-2 text-[10px] text-white/50" style={{ fontFamily: "ui-monospace, monospace" }}>{memberId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
