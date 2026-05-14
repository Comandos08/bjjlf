import { useMemo, useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useSearch } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import {
  ALL_BELTS,
  BELT_SWATCH,
  CURRENCY_SYMBOL,
  PRICES,
  priceFor,
  type BeltKey,
  type Currency,
} from "@/lib/diploma-pricing";
import { I18N, LOCALES, type Locale } from "@/lib/diploma-i18n";
import { submitDiplomaRequest } from "@/server/diploma.functions";
import { createStripeCheckout } from "@/server/stripe.functions";

type FormState = {
  email: string;
  whatsapp: string;
  affiliateCode: string;
  firstName: string;
  lastName: string;
  dob: string;
  documentNumber: string;
  sex: "" | "male" | "female";
  fatherName: string;
  motherName: string;
  belt: "" | BeltKey;
  currency: Currency;
};

const REQUIRED_KEYS: (keyof FormState)[] = [
  "email",
  "whatsapp",
  "affiliateCode",
  "firstName",
  "lastName",
  "dob",
  "documentNumber",
  "sex",
  "belt",
];

const initial: FormState = {
  email: "",
  whatsapp: "",
  affiliateCode: "",
  firstName: "",
  lastName: "",
  dob: "",
  documentNumber: "",
  sex: "",
  fatherName: "",
  motherName: "",
  belt: "",
  currency: "EUR",
};

// PayPal removed — payments now via Stripe.

const GOLD = "#B8960C";
const RED = "#C41E3A";
const BG = "#0F0F0F";
const INPUT_BG = "#111111";
const BORDER = "#2A2A2A";

export function DiplomaRequestPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [form, setForm] = useState<FormState>(initial);
  const [touched, setTouched] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [affiliateLocked, setAffiliateLocked] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  const t = I18N[locale];
  const submit = useServerFn(submitDiplomaRequest);
  const search = useSearch({ strict: false });

  useEffect(() => {
    const ref = (search as Record<string, unknown>)?.ref;
    if (typeof ref === "string" && ref.trim()) {
      setForm((s) => ({ ...s, affiliateCode: ref.trim().toUpperCase() }));
      setAffiliateLocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof FormState, true>> = {};
    for (const k of REQUIRED_KEYS) {
      if (!String(form[k]).trim()) e[k] = true;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = true;
    return e;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const beltLabel = form.belt ? t.belts[form.belt] : "";
  const price = form.belt ? priceFor(form.belt, form.currency) : 0;

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((s) => ({ ...s, [k]: v }));
  };

  const inputCls = (k: keyof FormState) =>
    `w-full px-4 py-3 bg-[${INPUT_BG}] text-white border outline-none transition-colors`;

  const inputStyle = (k: keyof FormState): React.CSSProperties => ({
    backgroundColor: INPUT_BG,
    color: "#fff",
    borderRadius: 0,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: touched && errors[k] ? RED : BORDER,
    fontFamily: "DM Sans, sans-serif",
  });

  const labelStyle: React.CSSProperties = {
    color: GOLD,
    fontFamily: "DM Sans, sans-serif",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    display: "block",
    marginBottom: 6,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: "Barlow Condensed, sans-serif",
    fontWeight: 900,
    fontSize: 28,
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
    borderBottom: `2px solid ${RED}`,
    paddingBottom: 8,
    marginBottom: 20,
  };

  const checkout = useServerFn(createStripeCheckout);
  const [paying, setPaying] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leadSavedFor, setLeadSavedFor] = useState<string | null>(null);

  // Detect return from Stripe
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") {
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  // Signature of the persisted order — re-save if belt/currency/price/email changed.
  const orderSignature = `${form.belt}|${form.currency}|${price}|${form.email.trim().toLowerCase()}`;

  const persistLead = async (): Promise<boolean> => {
    if (leadSavedFor === orderSignature) return true;
    const leadRes = await submit({
      data: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        affiliateCode: form.affiliateCode.trim(),
        affiliateSource: affiliateLocked ? "url" : "manual",
        dob: form.dob,
        sex: form.sex,
        documentNumber: form.documentNumber.trim(),
        fatherName: form.fatherName.trim(),
        motherName: form.motherName.trim(),
        belt: t.belts[form.belt as BeltKey],
        martialArt: "Brazilian Jiu-Jitsu",
        language: locale,
        currency: form.currency,
        price,
      },
    });
    if (!leadRes.ok) {
      setError(leadRes.error || "Error saving request.");
      return false;
    }
    setLeadSavedFor(orderSignature);
    return true;
  };

  const openConfirm = async () => {
    setError(null);
    if (!form.belt || !form.sex || !isValid) {
      setTouched(true);
      return;
    }
    setSavingLead(true);
    try {
      const ok = await persistLead();
      if (!ok) return;
      setConfirmOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving request.");
    } finally {
      setSavingLead(false);
    }
  };

  const startCheckout = async () => {
    setError(null);
    if (!form.belt || !form.sex || !isValid) {
      setTouched(true);
      return;
    }
    setPaying(true);
    try {
      // Ensure the lead is persisted (no-op if already saved for this order).
      const ok = await persistLead();
      if (!ok) {
        setPaying(false);
        return;
      }

      // Create Stripe Checkout session and redirect.
      const res = await checkout({
        data: {
          kind: "diploma",
          amountCents: Math.round(price * 100),
          currency: form.currency,
          description: `BJJLF Diploma — ${t.belts[form.belt as BeltKey]}`,
          customerEmail: form.email.trim(),
          origin: window.location.origin,
          successPath: `/diploma-request?paid=1`,
          cancelPath: `/diploma-request?canceled=1`,
          metadata: {
            belt: form.belt,
            affiliate: form.affiliateCode.trim(),
          },
        },
      });
      if (!res.ok || !res.url) {
        setError(res.ok ? "Stripe URL missing" : res.error);
        setPaying(false);
        return;
      }
      window.location.href = res.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment error");
      setPaying(false);
    }
  };

  const required = (
    <span style={{ color: RED, marginLeft: 4 }}>*</span>
  );

  return (
    <div
      style={{
        backgroundColor: BG,
        minHeight: "100vh",
        color: "#fff",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      <div className="mx-auto max-w-3xl px-4 py-10 md:py-16">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1
            style={{
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(32px, 6vw, 52px)",
              textTransform: "uppercase",
              letterSpacing: "0.02em",
              color: "#fff",
              lineHeight: 1.05,
            }}
          >
            {t.pageTitle}
          </h1>
          <p
            style={{
              color: GOLD,
              marginTop: 12,
              fontSize: 15,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            {t.subtitle}
          </p>
        </header>

        {/* Language bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {LOCALES.map((l) => {
            const active = l.code === locale;
            return (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                style={{
                  borderRadius: 0,
                  padding: "8px 14px",
                  border: `1px solid ${active ? GOLD : BORDER}`,
                  backgroundColor: active ? GOLD : "transparent",
                  color: active ? "#000" : "#fff",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <span style={{ marginRight: 6 }}>{l.flag}</span>
                {l.label}
              </button>
            );
          })}
        </div>

        {success ? (
          <SuccessBlock title={t.successTitle} body={t.successBody} />
        ) : (
          <>
            {/* Price table */}
            <PriceTable t={t} currency={form.currency} />

            <div ref={formRef} className="mt-10">
              {/* Section 1 — Contact */}
              <h2 style={sectionTitleStyle}>{t.sectionContact}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                <Field label={t.email} required>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    style={inputStyle("email")}
                    className={inputCls("email")}
                  />
                </Field>
                <Field label={t.whatsapp} required>
                  <input
                    type="tel"
                    placeholder="+55 11 9 9999 9999"
                    value={form.whatsapp}
                    onChange={(e) => update("whatsapp", e.target.value)}
                    style={inputStyle("whatsapp")}
                    className={inputCls("whatsapp")}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label={t.affiliateCode} required help={t.affiliateHelp}>
                    <input
                      type="text"
                      value={form.affiliateCode}
                      readOnly={affiliateLocked}
                      onChange={(e) =>
                        !affiliateLocked &&
                        update("affiliateCode", e.target.value.toUpperCase())
                      }
                      style={{
                        ...inputStyle("affiliateCode"),
                        backgroundColor: affiliateLocked ? "#1A1A0A" : INPUT_BG,
                        cursor: affiliateLocked ? "not-allowed" : "text",
                        borderColor: affiliateLocked
                          ? GOLD
                          : touched && errors.affiliateCode
                            ? RED
                            : BORDER,
                      }}
                      className={inputCls("affiliateCode")}
                    />
                    {affiliateLocked && (
                      <div
                        style={{
                          marginTop: 6,
                          color: GOLD,
                          fontSize: 12,
                          letterSpacing: "0.04em",
                        }}
                      >
                        🔒 {form.affiliateCode}
                      </div>
                    )}
                  </Field>
                </div>
              </div>

              {/* Section 2 — Personal */}
              <h2 style={sectionTitleStyle}>{t.sectionPersonal}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
                <Field label={t.firstName} required>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={(e) => update("firstName", e.target.value)}
                    style={inputStyle("firstName")}
                    className={inputCls("firstName")}
                  />
                </Field>
                <Field label={t.lastName} required>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={(e) => update("lastName", e.target.value)}
                    style={inputStyle("lastName")}
                    className={inputCls("lastName")}
                  />
                </Field>
                <Field label={t.dob} required>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => update("dob", e.target.value)}
                    style={inputStyle("dob")}
                    className={inputCls("dob")}
                  />
                </Field>
                <Field label={t.documentNumber} required>
                  <input
                    type="text"
                    value={form.documentNumber}
                    onChange={(e) => update("documentNumber", e.target.value)}
                    style={inputStyle("documentNumber")}
                    className={inputCls("documentNumber")}
                  />
                </Field>
                <div className="md:col-span-2">
                  <span style={labelStyle}>
                    {t.sex} {required}
                  </span>
                  <div className="flex gap-4 mt-1">
                    {(["male", "female"] as const).map((opt) => {
                      const active = form.sex === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => update("sex", opt)}
                          style={{
                            borderRadius: 0,
                            padding: "10px 20px",
                            border: `1px solid ${
                              touched && errors.sex
                                ? RED
                                : active
                                  ? GOLD
                                  : BORDER
                            }`,
                            background: active ? GOLD : "transparent",
                            color: active ? "#000" : "#fff",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            fontSize: 13,
                            cursor: "pointer",
                            minWidth: 130,
                          }}
                        >
                          {opt === "male" ? t.male : t.female}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <Field label={`${t.fatherName} ${t.optional}`}>
                  <input
                    type="text"
                    value={form.fatherName}
                    onChange={(e) => update("fatherName", e.target.value)}
                    style={inputStyle("fatherName")}
                    className={inputCls("fatherName")}
                  />
                </Field>
                <Field label={`${t.motherName} ${t.optional}`}>
                  <input
                    type="text"
                    value={form.motherName}
                    onChange={(e) => update("motherName", e.target.value)}
                    style={inputStyle("motherName")}
                    className={inputCls("motherName")}
                  />
                </Field>
              </div>

              {/* Section 3 — Jiu-Jitsu */}
              <h2 style={sectionTitleStyle}>{t.sectionJiuJitsu}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                <Field label={t.martialArt} required>
                  <select
                    value="bjj"
                    disabled
                    style={{ ...inputStyle("belt"), opacity: 0.85 }}
                    className={inputCls("belt")}
                  >
                    <option value="bjj">Brazilian Jiu-Jitsu</option>
                  </select>
                </Field>
                <Field label={t.belt} required>
                  <select
                    value={form.belt}
                    onChange={(e) =>
                      update("belt", e.target.value as BeltKey)
                    }
                    style={inputStyle("belt")}
                    className={inputCls("belt")}
                  >
                    <option value="">—</option>
                    {ALL_BELTS.map((b) => (
                      <option key={b} value={b} style={{ background: BG }}>
                        {t.belts[b]}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="md:col-span-2">
                  <Field label={t.currency} required>
                    <div className="flex gap-2">
                      {(["BRL", "EUR", "USD"] as Currency[]).map((c) => {
                        const active = form.currency === c;
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => update("currency", c)}
                            style={{
                              borderRadius: 0,
                              padding: "10px 22px",
                              border: `1px solid ${active ? GOLD : BORDER}`,
                              background: active ? GOLD : "transparent",
                              color: active ? "#000" : "#fff",
                              fontWeight: 700,
                              fontSize: 14,
                              cursor: "pointer",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {CURRENCY_SYMBOL[c]} {c}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </div>
              </div>

              {/* Selected belt indicator */}
              {form.belt && (
                <div
                  style={{
                    border: `1px solid ${GOLD}`,
                    background: "#161616",
                    padding: 18,
                    marginBottom: 24,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      background: BELT_SWATCH[form.belt as BeltKey],
                      border: "1px solid #000",
                    }}
                  />
                  <div className="flex-1">
                    <div
                      style={{
                        color: GOLD,
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {t.selectedBeltLabel}
                    </div>
                    <div
                      style={{
                        fontFamily: "Barlow Condensed, sans-serif",
                        fontWeight: 900,
                        fontSize: 24,
                        textTransform: "uppercase",
                        color: "#fff",
                      }}
                    >
                      {beltLabel}
                    </div>
                  </div>
                  <div
                    style={{
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 900,
                      fontSize: 36,
                      color: GOLD,
                    }}
                  >
                    {CURRENCY_SYMBOL[form.currency]}
                    {price}
                  </div>
                </div>
              )}

              <p
                style={{
                  fontSize: 12,
                  color: "#888",
                  marginBottom: 24,
                  fontStyle: "italic",
                }}
              >
                {t.privacyNote}
              </p>

              {/* Payment */}
              <div
                style={{
                  border: `1px solid ${BORDER}`,
                  background: "#0A0A0A",
                  padding: 24,
                }}
              >
                {!isValid && (
                  <div
                    onClick={() => setTouched(true)}
                    style={{
                      color: RED,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 12,
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    {t.fillRequired}
                  </div>
                )}
                {error && (
                  <div
                    style={{
                      color: RED,
                      fontSize: 13,
                      marginBottom: 12,
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </div>
                )}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!isValid) {
                        setTouched(true);
                        return;
                      }
                      setConfirmOpen(true);
                    }}
                    disabled={paying}
                    style={{
                      width: "100%",
                      padding: "16px 24px",
                      backgroundColor: isValid ? GOLD : "#444",
                      color: "#000",
                      border: "none",
                      borderRadius: 0,
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 900,
                      fontSize: 18,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      cursor: isValid && !paying ? "pointer" : "not-allowed",
                      opacity: paying ? 0.6 : 1,
                      transition: "all .15s",
                    }}
                  >
                    {`${locale === "pt" ? "Revisar e pagar" : "Review and pay"} — ${CURRENCY_SYMBOL[form.currency]} ${price.toFixed(2)}`}
                  </button>
                  <p
                    style={{
                      fontSize: 11,
                      color: "#888",
                      marginTop: 10,
                      textAlign: "center",
                    }}
                  >
                    {locale === "pt"
                      ? "Pagamento seguro processado pelo Stripe."
                      : "Secure payment processed by Stripe."}
                  </p>
                </div>
              </div>
            </div>

            {confirmOpen && form.belt && (
              <ConfirmModal
                locale={locale}
                belt={beltLabel}
                beltSwatch={BELT_SWATCH[form.belt as BeltKey]}
                currency={form.currency}
                price={price}
                paying={paying}
                onCancel={() => !paying && setConfirmOpen(false)}
                onConfirm={() => void startCheckout()}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "block" }}>
      <span
        style={{
          color: "#B8960C",
          fontFamily: "DM Sans, sans-serif",
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
        {required && <span style={{ color: "#C41E3A", marginLeft: 4 }}>*</span>}
      </span>
      {children}
      {help && (
        <span
          style={{
            fontSize: 11,
            color: "#888",
            marginTop: 4,
            display: "block",
          }}
        >
          {help}
        </span>
      )}
    </label>
  );
}

function PriceTable({
  t,
  currency,
}: {
  t: (typeof I18N)["en"];
  currency: Currency;
}) {
  const rows: { label: string; group: keyof typeof PRICES }[] = [
    { label: t.groupPreta, group: "preta" },
    { label: t.groupMarromRoxa, group: "marromRoxa" },
    { label: t.groupAzulVerde, group: "azulVerde" },
    { label: t.groupAteLaranja, group: "ateLaranja" },
  ];
  const currencies: Currency[] = ["BRL", "EUR", "USD"];
  return (
    <div style={{ border: "1px solid #B8960C", background: "#0A0A0A" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #B8960C",
          color: "#B8960C",
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 900,
          fontSize: 18,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {t.priceTableTitle}
      </div>
      <div className="overflow-x-auto">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 16px",
                  fontSize: 12,
                  color: "#888",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #2A2A2A",
                }}
              />
              {currencies.map((c) => (
                <th
                  key={c}
                  style={{
                    padding: "10px 16px",
                    fontSize: 12,
                    color: c === currency ? "#B8960C" : "#888",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #2A2A2A",
                    fontWeight: 700,
                  }}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.group}>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    color: "#fff",
                    borderBottom: "1px solid #1F1F1F",
                  }}
                >
                  {r.label}
                </td>
                {currencies.map((c) => (
                  <td
                    key={c}
                    style={{
                      padding: "12px 16px",
                      textAlign: "center",
                      fontFamily: "Barlow Condensed, sans-serif",
                      fontWeight: 900,
                      fontSize: 18,
                      color: c === currency ? "#B8960C" : "#fff",
                      borderBottom: "1px solid #1F1F1F",
                    }}
                  >
                    {CURRENCY_SYMBOL[c]}
                    {PRICES[r.group][c]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuccessBlock({ title, body }: { title: string; body: string }) {
  return (
    <div
      style={{
        border: `2px solid ${GOLD}`,
        background: "#0A0A0A",
        padding: 40,
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          margin: "0 auto 24px",
          border: `3px solid ${GOLD}`,
          color: GOLD,
          fontSize: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
        }}
      >
        ✓
      </div>
      <h2
        style={{
          fontFamily: "Barlow Condensed, sans-serif",
          fontWeight: 900,
          fontSize: 32,
          textTransform: "uppercase",
          color: "#fff",
          letterSpacing: "0.03em",
        }}
      >
        {title}
      </h2>
      <p
        style={{
          marginTop: 16,
          color: "#CCC",
          lineHeight: 1.7,
          fontSize: 15,
        }}
      >
        {body}
      </p>
    </div>
  );
}

function ConfirmModal({
  locale,
  belt,
  beltSwatch,
  currency,
  price,
  paying,
  onCancel,
  onConfirm,
}: {
  locale: Locale;
  belt: string;
  beltSwatch: string;
  currency: Currency;
  price: number;
  paying: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isPt = locale === "pt";
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 50,
        display: "grid",
        placeItems: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 460,
          background: "#0F0F0F",
          border: `1px solid ${GOLD}`,
          padding: 28,
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        <h3
          style={{
            fontFamily: "Barlow Condensed, sans-serif",
            fontWeight: 900,
            fontSize: 26,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            color: "#fff",
            borderBottom: `2px solid ${RED}`,
            paddingBottom: 8,
            marginBottom: 18,
          }}
        >
          {isPt ? "Confirmar pedido" : "Confirm order"}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <div style={{ width: 48, height: 48, background: beltSwatch, border: "1px solid #000" }} />
          <div>
            <div style={{ color: GOLD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {isPt ? "Faixa" : "Belt"}
            </div>
            <div style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 22, color: "#fff", textTransform: "uppercase" }}>
              {belt}
            </div>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14, marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ color: "#bbb", fontSize: 14, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {isPt ? "Total" : "Total"}
          </span>
          <span style={{ fontFamily: "Barlow Condensed, sans-serif", fontWeight: 900, fontSize: 34, color: GOLD }}>
            {CURRENCY_SYMBOL[currency]} {price.toFixed(2)} {currency}
          </span>
        </div>

        <p style={{ fontSize: 12, color: "#888", marginBottom: 18 }}>
          {isPt
            ? "Você será redirecionado ao Stripe para concluir o pagamento de forma segura."
            : "You will be redirected to Stripe to complete the payment securely."}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={paying}
            style={{
              flex: 1,
              padding: "12px 16px",
              background: "transparent",
              color: "#fff",
              border: `1px solid ${BORDER}`,
              borderRadius: 0,
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: paying ? "not-allowed" : "pointer",
              opacity: paying ? 0.5 : 1,
            }}
          >
            {isPt ? "Cancelar" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={paying}
            style={{
              flex: 2,
              padding: "12px 16px",
              background: GOLD,
              color: "#000",
              border: "none",
              borderRadius: 0,
              fontFamily: "Barlow Condensed, sans-serif",
              fontWeight: 900,
              fontSize: 15,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: paying ? "not-allowed" : "pointer",
              opacity: paying ? 0.6 : 1,
            }}
          >
            {paying
              ? isPt ? "Redirecionando..." : "Redirecting..."
              : isPt ? `Confirmar e pagar — ${CURRENCY_SYMBOL[currency]} ${price.toFixed(2)}` : `Confirm and pay — ${CURRENCY_SYMBOL[currency]} ${price.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// suppress unused-import warning for useEffect (kept for future hooks)
void useEffect;
void PRICES;
