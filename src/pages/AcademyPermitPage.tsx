/**
 * /academy/permit — Authenticated multi-step academy affiliation flow.
 *
 * Absorbs the legacy /register/academy form. The logged-in athlete acts as
 * the responsible professor; their data is auto-filled and read-only. On
 * submit, a row is inserted into academy_permits with status='pending'.
 * The admin "Alvarás" panel is the single approval point.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  UserPlus,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";
import { useI18n } from "@/lib/i18n";
import { Stepper } from "@/components/Stepper";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { BeltSelector } from "@/components/BeltSelector";
import { formatBeltLine, type BeltName } from "@/lib/belts-ibjjf";
import { useServerFn } from "@tanstack/react-start";
import { createStripeCheckout } from "@/server/stripe.functions";

const PERMIT_AMOUNT_CENTS = 30000;

type AddProf = { name: string; belt: string; degree: number; years: string };

type AcademyForm = {
  academy_name: string;
  academy_logo_url: string;
  city: string;
  state: string;
  country: string;
  country_code: string;
  phone: string;
  website: string;
  instagram: string;
  notes: string;
};

const EMPTY_ACADEMY: AcademyForm = {
  academy_name: "",
  academy_logo_url: "",
  city: "",
  state: "",
  country: "Brasil",
  country_code: "BR",
  phone: "",
  website: "",
  instagram: "",
  notes: "",
};

const COUNTRIES: { code: string; name: string; flag: string }[] = [
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "ES", name: "Espanha", flag: "🇪🇸" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "FR", name: "França", flag: "🇫🇷" },
  { code: "DE", name: "Alemanha", flag: "🇩🇪" },
  { code: "IT", name: "Itália", flag: "🇮🇹" },
  { code: "JP", name: "Japão", flag: "🇯🇵" },
  { code: "AU", name: "Austrália", flag: "🇦🇺" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "OTHER", name: "Outro", flag: "🏳️" },
];

export function AcademyPermitPage() {
  const { t } = useI18n();
  const auth = useAthleteAuth();
  const navigate = useNavigate();

  // Auth gate
  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.user) {
      window.location.replace("/athlete/login?redirect=/academy/permit");
    }
  }, [auth.isLoading, auth.user]);

  const [step, setStep] = useState(0);
  const [academy, setAcademy] = useState<AcademyForm>(EMPTY_ACADEMY);
  const [profs, setProfs] = useState<AddProf[]>([]);
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const checkout = useServerFn(createStripeCheckout);

  // Show success view when returning from Stripe ?paid=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "1") setSuccess(true);
  }, []);

  const STEPS = [
    t("academyPermit.step1"),
    t("academyPermit.step2"),
    t("academyPermit.step3"),
    t("academyPermit.step4"),
  ];

  const profile = auth.profile;
  const profileBeltLine = useMemo(
    () => formatBeltLine(profile?.belt ?? "", profile?.degree ?? 0) ?? "—",
    [profile?.belt, profile?.degree],
  );

  if (auth.isLoading) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-[#C8211A]" />
      </div>
    );
  }

  // Active athlete profile required
  if (!profile || profile.status !== "active") {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white border border-yellow-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-yellow-50 border-4 border-yellow-100 grid place-items-center mx-auto">
              <AlertTriangle className="h-7 w-7 text-yellow-600" />
            </div>
            <h1
              className="mt-5 text-2xl text-gray-900 uppercase"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
            >
              {t("academyPermit.needAthlete.title")}
            </h1>
            <p className="mt-3 text-gray-700" style={{ fontFamily: "Barlow" }}>
              {t("academyPermit.needAthlete.desc")}
            </p>
            <Link
              to="/register/athlete"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest transition"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              {t("academyPermit.needAthlete.cta")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-100 grid place-items-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1
              className="mt-5 text-3xl text-gray-900 uppercase"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
            >
              {t("academyPermit.success.title")}
            </h1>
            <p className="mt-3 text-gray-700" style={{ fontFamily: "Barlow" }}>
              {t("academyPermit.success.desc")}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/academies"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm uppercase tracking-widest text-gray-800 hover:border-gray-900 hover:text-gray-900 transition"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                <ArrowLeft className="h-4 w-4" /> {t("academyPermit.success.toAcademies")}
              </Link>
              <Link
                to="/my-permits"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest transition"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {t("academyPermit.success.toMyPermits")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Validation per step
  const canNext = (() => {
    if (step === 0) return true; // read-only
    if (step === 1) return academy.academy_name.trim() && academy.city.trim() && academy.country.trim();
    if (step === 2) return true; // optional
    if (step === 3) return terms;
    return false;
  })();

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  function setCountryByCode(code: string) {
    const c = COUNTRIES.find((x) => x.code === code);
    setAcademy((a) => ({
      ...a,
      country_code: code,
      country: c?.name ?? a.country,
    }));
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const insertRow = {
        // Academy
        academy_name: academy.academy_name.trim(),
        academy_logo_url: academy.academy_logo_url || null,
        city: academy.city.trim(),
        state: academy.state.trim() || null,
        country: academy.country.trim() || "Brasil",
        country_code: academy.country_code || null,
        phone: academy.phone.trim() || null,
        website: academy.website.trim() || null,
        instagram: academy.instagram.trim() || null,
        notes: academy.notes.trim() || null,
        // Responsible professor (from athlete profile)
        responsible_name: profile!.full_name,
        email: auth.user?.email ?? "",
        user_id: auth.user?.id ?? null,
        athlete_id: profile!.id,
        // Additional professors
        additional_professors: profs.map((p) => ({
          name: p.name,
          belt: p.belt,
          degree: p.degree,
          years: p.years,
        })),
        amount_cents: 0,
        status: "pending" as const,
      };
      const { error: insertErr } = await supabase
        .from("academy_permits")
        .insert(insertRow);
      if (insertErr) throw insertErr;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("academyPermit.error.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span
            className="inline-block bg-[#C8A84B] text-white px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest mb-4"
            style={{ fontFamily: "Barlow", fontWeight: 700 }}
          >
            {t("academyPermit.kicker")}
          </span>
          <h1
            className="text-white text-4xl md:text-5xl uppercase tracking-wide leading-tight"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            {t("academyPermit.title")}
          </h1>
          <p
            className="mt-3 text-gray-300 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "Barlow", fontWeight: 400 }}
          >
            {t("academyPermit.subtitle")}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Stepper steps={STEPS} current={step} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
          {step === 0 && (
            <div className="space-y-5">
              <SectionTitle>{t("academyPermit.s1.title")}</SectionTitle>
              <p className="text-sm text-gray-700" style={{ fontFamily: "Barlow" }}>
                {t("academyPermit.s1.note")}
              </p>
              <ReadOnlyField label={t("academyPermit.s1.fullName")} value={profile.full_name} />
              <div className="grid sm:grid-cols-2 gap-4">
                <ReadOnlyField label={t("academyPermit.s1.belt")} value={profileBeltLine} />
                <ReadOnlyField
                  label={t("academyPermit.s1.athleteId")}
                  value={profile.registration_number ?? "—"}
                />
              </div>
              <ReadOnlyField label={t("academyPermit.s1.email")} value={auth.user?.email ?? "—"} />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <SectionTitle>{t("academyPermit.s2.title")}</SectionTitle>
              <Field label={t("academyPermit.s2.name")} required>
                <Input
                  value={academy.academy_name}
                  onChange={(v) => setAcademy({ ...academy, academy_name: v })}
                />
              </Field>
              <div>
                <Label>{t("academyPermit.s2.logo")}</Label>
                <ImageUploader
                  folder="academies"
                  label=""
                  value={academy.academy_logo_url}
                  onChange={(url) => setAcademy((a) => ({ ...a, academy_logo_url: url }))}
                  previewClassName="mt-2 h-20 w-20 object-cover rounded-lg border"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("academyPermit.s2.city")} required>
                  <Input value={academy.city} onChange={(v) => setAcademy({ ...academy, city: v })} />
                </Field>
                <Field label={t("academyPermit.s2.state")}>
                  <Input value={academy.state} onChange={(v) => setAcademy({ ...academy, state: v })} />
                </Field>
              </div>
              <Field label={t("academyPermit.s2.country")} required>
                <select
                  value={academy.country_code}
                  onChange={(e) => setCountryByCode(e.target.value)}
                  className="w-full h-11 px-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:border-[#C8211A] focus:ring-1 focus:ring-[#C8211A]"
                  style={{ fontFamily: "Barlow" }}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label={t("academyPermit.s2.phone")}>
                  <Input value={academy.phone} onChange={(v) => setAcademy({ ...academy, phone: v })} />
                </Field>
                <Field label={t("academyPermit.s2.website")}>
                  <Input
                    value={academy.website}
                    onChange={(v) => setAcademy({ ...academy, website: v })}
                    placeholder="https://"
                  />
                </Field>
              </div>
              <Field label={t("academyPermit.s2.instagram")}>
                <Input
                  value={academy.instagram}
                  onChange={(v) => setAcademy({ ...academy, instagram: v })}
                  placeholder="@suaacademia"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <SectionTitle>{t("academyPermit.s3.title")}</SectionTitle>
              <p className="text-sm text-gray-700" style={{ fontFamily: "Barlow" }}>
                {t("academyPermit.s3.desc")}
              </p>
              <div className="space-y-3">
                {profs.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-gray-900 truncate" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
                        {p.name || "—"}
                      </div>
                      <div className="text-xs text-gray-700">
                        {formatBeltLine(p.belt, p.degree) ?? p.belt}
                        {p.years ? ` · ${p.years} ${t("academyPermit.s3.yearsShort")}` : ""}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProfs((arr) => arr.filter((_, idx) => idx !== i))}
                      className="text-gray-500 hover:text-[#C8211A]"
                      aria-label="remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <ProfessorAdd onAdd={(p) => setProfs((arr) => [...arr, p])} t={t} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <SectionTitle>{t("academyPermit.s4.title")}</SectionTitle>
              <ReviewBlock title={t("academyPermit.s1.title")}>
                <ReviewRow label={t("academyPermit.s1.fullName")} value={profile.full_name} />
                <ReviewRow label={t("academyPermit.s1.belt")} value={profileBeltLine} />
                <ReviewRow label={t("academyPermit.s1.email")} value={auth.user?.email ?? "—"} />
              </ReviewBlock>
              <ReviewBlock title={t("academyPermit.s2.title")}>
                <ReviewRow label={t("academyPermit.s2.name")} value={academy.academy_name || "—"} />
                <ReviewRow
                  label={t("academyPermit.s2.location")}
                  value={[academy.city, academy.state, academy.country].filter(Boolean).join(", ")}
                />
                {academy.phone && <ReviewRow label={t("academyPermit.s2.phone")} value={academy.phone} />}
                {academy.website && <ReviewRow label={t("academyPermit.s2.website")} value={academy.website} />}
                {academy.instagram && (
                  <ReviewRow label={t("academyPermit.s2.instagram")} value={academy.instagram} />
                )}
              </ReviewBlock>
              {profs.length > 0 && (
                <ReviewBlock title={t("academyPermit.s3.title")}>
                  {profs.map((p, i) => (
                    <ReviewRow
                      key={i}
                      label={p.name}
                      value={`${formatBeltLine(p.belt, p.degree) ?? p.belt}${p.years ? ` · ${p.years} ${t("academyPermit.s3.yearsShort")}` : ""}`}
                    />
                  ))}
                </ReviewBlock>
              )}

              <label className="flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[#C8211A]"
                />
                <span className="text-sm text-gray-800" style={{ fontFamily: "Barlow" }}>
                  {t("academyPermit.s4.terms")}
                </span>
              </label>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Footer nav */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prev}
              disabled={step === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase tracking-widest text-gray-800 hover:border-gray-900 hover:text-gray-900 transition disabled:opacity-40"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              <ArrowLeft className="h-4 w-4" /> {t("academyPermit.back")}
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canNext}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2 text-sm uppercase tracking-widest transition disabled:opacity-50"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {t("academyPermit.next")} <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void submit()}
                disabled={!canNext || submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2 text-sm uppercase tracking-widest transition disabled:opacity-60"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {t("academyPermit.submit")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-components ---------- */

function ProfessorAdd({
  onAdd,
  t,
}: {
  onAdd: (p: AddProf) => void;
  t: (k: string) => string;
}) {
  const [name, setName] = useState("");
  const [belt, setBelt] = useState<BeltName>("Preta" as BeltName);
  const [degree, setDegree] = useState(1);
  const [years, setYears] = useState("");

  return (
    <div className="border border-dashed border-gray-300 rounded-lg p-4 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label={t("academyPermit.s3.profName")}>
          <Input value={name} onChange={setName} />
        </Field>
        <Field label={t("academyPermit.s3.years")}>
          <Input value={years} onChange={setYears} type="number" />
        </Field>
      </div>
      <BeltSelector
        belt={belt}
        degree={degree}
        adultOnly
        onBeltChange={setBelt}
        onDegreeChange={setDegree}
      />
      <button
        type="button"
        onClick={() => {
          if (!name.trim()) return;
          onAdd({ name: name.trim(), belt, degree, years: years.trim() });
          setName("");
          setYears("");
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm uppercase tracking-widest text-gray-800 hover:border-[#C8211A] hover:text-[#C8211A] transition"
        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
      >
        <Plus className="h-4 w-4" /> {t("academyPermit.s3.add")}
      </button>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xl uppercase text-gray-900 tracking-wide"
      style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
    >
      {children}
    </h2>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="block text-xs uppercase tracking-widest text-gray-700 mb-1.5"
      style={{ fontFamily: "Barlow", fontWeight: 600 }}
    >
      {children}
    </span>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <Label>
        {label} {required && <span className="text-[#C8211A]">*</span>}
      </Label>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C8211A] focus:ring-1 focus:ring-[#C8211A]"
      style={{ fontFamily: "Barlow", fontWeight: 400 }}
    />
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div
        className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-900 flex items-center"
        style={{ fontFamily: "Barlow" }}
      >
        {value}
      </div>
    </div>
  );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div
        className="text-xs uppercase tracking-widest text-[#C8211A] mb-3"
        style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
      >
        {title}
      </div>
      <dl className="space-y-1.5">{children}</dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-gray-700" style={{ fontFamily: "Barlow" }}>
        {label}
      </dt>
      <dd className="text-gray-900 text-right" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
        {value}
      </dd>
    </div>
  );
}

// Unused but exported for compatibility: prevents breaking type imports if any.
export type { AddProf };
const _UnusedIcon = UserPlus;
void _UnusedIcon;
