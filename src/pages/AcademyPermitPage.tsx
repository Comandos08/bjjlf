/**
 * Public Academy Permit (Alvará Digital) request form.
 * Route: /academy/permit
 *
 * Flow:
 * 1. User fills the form (academy, responsible, address).
 * 2. Insert into academy_permits with status='pending_payment'.
 * 3. Show confirmation screen — payment instructions sent later by admin/email.
 *    Stripe is wired but not active yet (see create-permit-checkout edge fn).
 */
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Award,
  Building2,
  CheckCircle2,
  FileCheck,
  Globe,
  Loader2,
  QrCode,
  Shield,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";

type FormState = {
  academy_name: string;
  responsible_name: string;
  email: string;
  phone: string;
  website: string;
  city: string;
  state: string;
  country: string;
  address: string;
};

const EMPTY: FormState = {
  academy_name: "",
  responsible_name: "",
  email: "",
  phone: "",
  website: "",
  city: "",
  state: "",
  country: "Brasil",
  address: "",
};

const AMOUNT_CENTS = 30000;

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function AcademyPermitPage() {
  const { user } = useAthleteAuth();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const insertRow = {
        academy_name: form.academy_name.trim(),
        responsible_name: form.responsible_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        website: form.website.trim() || null,
        city: form.city.trim(),
        state: form.state.trim() || null,
        country: form.country.trim() || "Brasil",
        address: form.address.trim() || null,
        user_id: user?.id ?? null,
        amount_cents: AMOUNT_CENTS,
        status: "pending_payment" as const,
      };
      const { error: insertErr } = await supabase
        .from("academy_permits")
        .insert(insertRow);
      if (insertErr) throw insertErr;
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar a solicitação.");
    } finally {
      setSubmitting(false);
    }
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
              Solicitação Recebida!
            </h1>
            <p
              className="mt-3 text-gray-500"
              style={{ fontFamily: "Barlow", fontWeight: 400 }}
            >
              Sua solicitação foi registrada. Em breve você receberá as instruções
              de pagamento por email.
            </p>
            <p
              className="mt-2 text-sm text-gray-400"
              style={{ fontFamily: "Barlow", fontWeight: 400 }}
            >
              Nossa equipe entrará em contato em até 24h.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/academies"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-2.5 text-sm uppercase tracking-widest text-gray-700 hover:border-gray-900 hover:text-gray-900 transition"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                <ArrowLeft className="h-4 w-4" /> Voltar às academias
              </Link>
              {user && (
                <Link
                  to="/my-permits"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest transition"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                >
                  <Building2 className="h-4 w-4" /> Meus alvarás
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <section className="bg-gray-900 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <span
            className="inline-block bg-[#C8A84B] text-white px-3 py-1.5 rounded-full text-[10px] uppercase tracking-widest mb-4"
            style={{ fontFamily: "Barlow", fontWeight: 700 }}
          >
            Renovação Anual
          </span>
          <h1
            className="text-white text-4xl md:text-5xl uppercase tracking-wide leading-tight"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            Alvará de Academia
          </h1>
          <p
            className="mt-3 text-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "Barlow", fontWeight: 400 }}
          >
            Certifique sua academia como afiliada oficial da BJJLF por 1 ano.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Benefits */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h2
            className="text-xl uppercase text-gray-900 tracking-wide mb-5"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            O que está incluído
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Benefit
              icon={<Award className="h-5 w-5 text-[#C8A84B]" />}
              title="Selo BJJLF Oficial"
              desc="Use em materiais e redes"
            />
            <Benefit
              icon={<QrCode className="h-5 w-5 text-[#C8A84B]" />}
              title="QR Code de Validação"
              desc="Verificação pública"
            />
            <Benefit
              icon={<Globe className="h-5 w-5 text-[#C8A84B]" />}
              title="Listagem no Site"
              desc="Apareça no diretório"
            />
            <Benefit
              icon={<Users className="h-5 w-5 text-[#C8A84B]" />}
              title="Suporte da Federação"
              desc="Acesso direto"
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-8">
          <Section title="Dados da Academia">
            <Field label="Nome da academia" required>
              <Input
                value={form.academy_name}
                onChange={(v) => setForm({ ...form, academy_name: v })}
                required
              />
            </Field>
            <Field label="Nome do responsável / professor" required>
              <Input
                value={form.responsible_name}
                onChange={(v) => setForm({ ...form, responsible_name: v })}
                required
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Email de contato" required>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(v) => setForm({ ...form, email: v })}
                  required
                />
              </Field>
              <Field label="Telefone / WhatsApp" required>
                <Input
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  required
                />
              </Field>
            </div>
            <Field label="Website (opcional)">
              <Input
                value={form.website}
                onChange={(v) => setForm({ ...form, website: v })}
                placeholder="https://..."
              />
            </Field>
          </Section>

          <Section title="Endereço">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Cidade" required>
                <Input
                  value={form.city}
                  onChange={(v) => setForm({ ...form, city: v })}
                  required
                />
              </Field>
              <Field label="Estado / Região">
                <Input
                  value={form.state}
                  onChange={(v) => setForm({ ...form, state: v })}
                />
              </Field>
            </div>
            <Field label="País">
              <Input
                value={form.country}
                onChange={(v) => setForm({ ...form, country: v })}
              />
            </Field>
            <Field label="Endereço completo (opcional)">
              <Input
                value={form.address}
                onChange={(v) => setForm({ ...form, address: v })}
              />
            </Field>
          </Section>

          <Section title="Resumo e Pagamento">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p
                className="text-sm uppercase tracking-widest text-gray-500"
                style={{ fontFamily: "Barlow", fontWeight: 600 }}
              >
                Alvará Anual BJJLF
              </p>
              <p
                className="mt-2 text-3xl text-[#C8211A]"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
              >
                {formatBRL(AMOUNT_CENTS)}
              </p>
              <p
                className="mt-1 text-xs text-gray-500"
                style={{ fontFamily: "Barlow", fontWeight: 400 }}
              >
                Válido por 12 meses a partir da aprovação
              </p>
              <ul
                className="mt-4 space-y-2 text-sm text-gray-600"
                style={{ fontFamily: "Barlow", fontWeight: 500 }}
              >
                <IncludedItem>Documento digital com QR code</IncludedItem>
                <IncludedItem>Verificação pública /verify/academy/&#123;ID&#125;</IncludedItem>
                <IncludedItem>Listagem no diretório de academias</IncludedItem>
                <IncludedItem>Renovação com desconto no próximo ano</IncludedItem>
              </ul>
            </div>
          </Section>

          {error && (
            <div
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
              style={{ fontFamily: "Barlow", fontWeight: 500 }}
            >
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white py-4 uppercase tracking-widest transition disabled:opacity-60"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              {submitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
              Solicitar Alvará
            </button>
            <p
              className="mt-3 text-center text-xs text-gray-400"
              style={{ fontFamily: "Barlow" }}
            >
              Pagamento via Stripe — ambiente seguro
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Primitives ---------- */

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div>
        <p
          className="text-sm text-gray-900"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          {title}
        </p>
        <p
          className="text-xs text-gray-500"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          {desc}
        </p>
      </div>
    </div>
  );
}

function IncludedItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <FileCheck className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
      <span>{children}</span>
    </li>
  );
}

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
        {label} {required && <span className="text-[#C8211A]">*</span>}
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
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      required={required}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 px-3 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#C8211A] focus:ring-1 focus:ring-[#C8211A]"
      style={{ fontFamily: "Barlow", fontWeight: 400 }}
    />
  );
}
