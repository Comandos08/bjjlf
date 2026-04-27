/**
 * Public event registration form.
 *
 * Route: /register/event/$eventId
 *
 * - Reads the event from the static EVENTS list (events live in code).
 * - Pre-fills fields when an active athlete is signed in.
 * - Looks up an event_prices row matching event/category/modality and
 *   uses its amount_cents when found; otherwise falls back to R$ 150,00.
 * - Inserts into event_registrations with status 'pending_payment'.
 * - Stripe is not wired yet: success view shows "Aguardando Pagamento".
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";
import { useEvents } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { BeltSelector } from "@/components/BeltSelector";
import { defaultDegreeForBelt, type BeltName } from "@/lib/belts-ibjjf";

const MODALITIES = ["GI", "NO-GI", "GI & NO-GI"];
const CATEGORIES = [
  "Infanto-Juvenil",
  "Juvenil",
  "Adulto",
  "Master 1",
  "Master 2",
  "Master 3",
  "Master 4",
];
const WEIGHTS = [
  "Pluma",
  "Leve",
  "Médio",
  "Meio-Pesado",
  "Pesado",
  "Super-Pesado",
  "Pesadíssimo",
  "Absoluto",
];

const DEFAULT_AMOUNT_CENTS = 15000;

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  country: string;
  belt: string;
  degree: number;
  academy: string;
  professor: string;
  modality: string;
  category: string;
  weight_class: string;
};

const EMPTY: FormState = {
  full_name: "",
  email: "",
  phone: "",
  country: "Brasil",
  belt: "Branca",
  degree: 0,
  academy: "",
  professor: "",
  modality: "GI",
  category: "Adulto",
  weight_class: "Leve",
};

export function EventRegistrationPage() {
  const { eventId } = useParams({ from: "/register/event/$eventId" });
  const { user, profile, isActive } = useAthleteAuth();
  const { data: events = [], isLoading: eventsLoading } = useEvents();
  const event = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [amountCents, setAmountCents] = useState<number>(DEFAULT_AMOUNT_CENTS);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | {
    full_name: string;
    category: string;
    weight_class: string;
    modality: string;
    amount_cents: number;
  }>(null);

  // Pre-fill from profile
  useEffect(() => {
    if (!isActive || !profile || !user) return;
    setForm((f) => ({
      ...f,
      full_name: profile.full_name ?? f.full_name,
      email: user.email ?? f.email,
      country: profile.country ?? f.country,
      belt: profile.belt ?? f.belt,
      degree: profile.degree ?? f.degree,
      academy: profile.academy ?? f.academy,
      professor: profile.professor ?? f.professor,
      modality: profile.modality ?? f.modality,
      category: profile.category ?? f.category,
    }));
  }, [isActive, profile, user]);

  // Lookup price (event + category + modality). Falls back to default.
  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    void (async () => {
      const { data } = await supabase
        .from("event_prices")
        .select("amount_cents, early_bird_cents, early_bird_until")
        .eq("event_id", eventId)
        .eq("category", form.category)
        .eq("modality", form.modality)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const today = new Date().toISOString().slice(0, 10);
        const useEarly =
          data.early_bird_cents != null &&
          data.early_bird_until != null &&
          today <= data.early_bird_until;
        setAmountCents(useEarly ? (data.early_bird_cents as number) : data.amount_cents);
      } else {
        setAmountCents(DEFAULT_AMOUNT_CENTS);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [eventId, form.category, form.modality]);

  if (!event) {
    if (eventsLoading) {
      return (
        <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      );
    }
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h1
            className="text-3xl text-gray-900 uppercase"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            Evento não encontrado
          </h1>
          <Link
            to="/events" search={((prev: unknown) => prev) as never}
            className="mt-4 inline-block text-[#C8211A] hover:underline"
          >
            Voltar aos eventos
          </Link>
        </div>
      </div>
    );
  }

  const dateFmt = new Date(event.date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const insertRow = {
        event_id: eventId,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        belt: form.belt,
        degree: form.degree,
        academy: form.academy.trim() || null,
        professor: form.professor.trim() || null,
        country: form.country.trim() || "Brasil",
        category: form.category,
        weight_class: form.weight_class,
        modality: form.modality,
        athlete_id: profile?.id ?? null,
        user_id: user?.id ?? null,
        amount_cents: amountCents,
        status: "pending_payment",
      };

      const { error: insertError } = await supabase
        .from("event_registrations")
        .insert(insertRow);

      if (insertError) throw insertError;

      setSuccess({
        full_name: insertRow.full_name,
        category: form.category,
        weight_class: form.weight_class,
        modality: form.modality,
        amount_cents: amountCents,
      });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Falha ao enviar a inscrição.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h1
              className="text-3xl text-gray-900 uppercase"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
            >
              Inscrição Recebida!
            </h1>
            <p
              className="mt-2 text-gray-500 max-w-md mx-auto"
              style={{ fontFamily: "Barlow", fontWeight: 400 }}
            >
              Sua inscrição foi registrada com sucesso. Em breve você receberá
              as instruções de pagamento por email.
            </p>

            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-5 text-left">
              <SummaryRow label="Nome" value={success.full_name} />
              <SummaryRow label="Evento" value={event.name} />
              <SummaryRow
                label="Categoria"
                value={`${success.category} · ${success.modality}`}
              />
              <SummaryRow label="Peso" value={success.weight_class} />
              <SummaryRow label="Valor" value={formatBRL(success.amount_cents)} />
            </div>

            <span
              className="mt-5 inline-block px-3 py-1.5 text-xs uppercase tracking-wider rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              Aguardando Pagamento
            </span>

            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/events" search={((prev: unknown) => prev) as never}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm uppercase tracking-widest text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                <ArrowLeft className="h-4 w-4" /> Voltar aos eventos
              </Link>
              {user && (
                <Link
                  to="/my-competitions"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest transition"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                >
                  <ClipboardList className="h-4 w-4" /> Ver minhas inscrições
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
          {/* Header */}
          <div className="text-center">
            <span
              className="inline-block px-3 py-1.5 text-[11px] uppercase tracking-widest rounded-full bg-gray-100 text-gray-600"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              {event.name} · {dateFmt}
            </span>
            <h1
              className="mt-3 text-3xl text-gray-900 uppercase"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
            >
              Inscrição
            </h1>
            <div className="h-1 w-12 bg-[#C8211A] rounded mx-auto mt-3" />
            <p
              className="mt-3 text-gray-500"
              style={{ fontFamily: "Barlow", fontWeight: 400 }}
            >
              Preencha os dados abaixo para se inscrever no evento.
            </p>
          </div>

          {isActive && (
            <div
              className="mt-6 bg-blue-50 border border-blue-100 text-blue-700 text-sm rounded-lg px-4 py-3"
              style={{ fontFamily: "Barlow", fontWeight: 500 }}
            >
              Seus dados foram pré-preenchidos do seu perfil.
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-8">
            <Section title="Dados Pessoais">
              <Field label="Nome completo" required>
                <Input
                  value={form.full_name}
                  onChange={(v) => setForm({ ...form, full_name: v })}
                  required
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Email" required>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    required
                  />
                </Field>
                <Field label="Telefone / WhatsApp">
                  <Input
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                  />
                </Field>
              </div>
              <Field label="País">
                <Input
                  value={form.country}
                  onChange={(v) => setForm({ ...form, country: v })}
                />
              </Field>
            </Section>

            <Section title="Dados Esportivos">
              <BeltSelector
                belt={form.belt}
                degree={form.degree}
                onBeltChange={(b: BeltName) =>
                  setForm({ ...form, belt: b, degree: defaultDegreeForBelt(b) })
                }
                onDegreeChange={(d) => setForm({ ...form, degree: d })}
                className="grid sm:grid-cols-2 gap-4"
                selectClassName="h-11 w-full px-3 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:border-[#C8211A] focus:ring-1 focus:ring-[#C8211A]"
                labelClassName="block text-xs uppercase tracking-wider text-gray-500 mb-1.5"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Academia">
                  <Input
                    value={form.academy}
                    onChange={(v) => setForm({ ...form, academy: v })}
                  />
                </Field>
                <Field label="Professor / Mestre">
                  <Input
                    value={form.professor}
                    onChange={(v) => setForm({ ...form, professor: v })}
                  />
                </Field>
              </div>
            </Section>

            {(() => {
              const isCompetition =
                event.badge !== "SEMINÁRIO" && event.badge !== "CURSO";
              if (!isCompetition) {
                return (
                  <Section title="Inscrição">
                    <p className="text-sm text-gray-600" style={{ fontFamily: "Barlow" }}>
                      Este evento ({event.badge.toLowerCase()}) não exige
                      categoria nem peso. Confirme seus dados e prossiga para o
                      pagamento.
                    </p>
                  </Section>
                );
              }
              return (
                <Section title="Categoria">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <Field label="Modalidade" required>
                      <Select
                        value={form.modality}
                        onChange={(v) => setForm({ ...form, modality: v })}
                        options={MODALITIES}
                      />
                    </Field>
                    <Field label="Categoria" required>
                      <Select
                        value={form.category}
                        onChange={(v) => setForm({ ...form, category: v })}
                        options={CATEGORIES}
                      />
                    </Field>
                    <Field label="Peso" required>
                      <Select
                        value={form.weight_class}
                        onChange={(v) => setForm({ ...form, weight_class: v })}
                        options={WEIGHTS}
                      />
                    </Field>
                  </div>
                </Section>
              );
            })()}

            <Section title="Resumo">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
                <SummaryRow label="Evento" value={event.name} />
                <SummaryRow
                  label="Categoria"
                  value={`${form.category} · ${form.modality}`}
                />
                <SummaryRow label="Peso" value={form.weight_class} />
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span
                    className="text-sm uppercase tracking-widest text-gray-500"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    Valor
                  </span>
                  <span
                    className="text-2xl text-[#C8211A]"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
                  >
                    {formatBRL(amountCents)}
                  </span>
                </div>
              </div>
            </Section>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={submitting}
                className={cn(
                  "w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white py-4 uppercase tracking-widest transition disabled:opacity-60",
                )}
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                Confirmar Inscrição
              </button>
              <p className="mt-3 text-center text-xs text-gray-400">
                O pagamento será processado via Stripe. Você receberá as
                instruções por email.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small primitives ---------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend
        className="text-sm uppercase tracking-widest text-gray-900 mb-1"
        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
      >
        {title}
      </legend>
      {children}
    </fieldset>
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
      <span
        className="block text-xs uppercase tracking-widest text-gray-500 mb-1.5"
        style={{ fontFamily: "Barlow", fontWeight: 600 }}
      >
        {label}
        {required && <span className="text-[#C8211A] ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = "text",
  required,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <input
      type={type}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-[#C8211A] focus:ring-2 focus:ring-[#C8211A]/20 outline-none transition"
      style={{ fontFamily: "Barlow" }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-[#C8211A] focus:ring-2 focus:ring-[#C8211A]/20 outline-none transition"
      style={{ fontFamily: "Barlow" }}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
        {label}
      </span>
      <span className="text-gray-900" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}
