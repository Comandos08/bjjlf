import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Award,
  User,
  FileText,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";

export type ComingSoonPage =
  | "rankings"
  | "black-belts"
  | "athletes"
  | "rules";

type Config = {
  title: string;
  highlight: string;
  subtitle: string;
  icon: LucideIcon;
  features: string[];
  progress: number;
};

const CONFIG: Record<ComingSoonPage, Config> = {
  rankings: {
    title: "RANK",
    highlight: "INGS",
    subtitle: "O ranking oficial dos atletas BJJLF está em construção.",
    icon: BarChart3,
    features: ["Por Faixa", "Por Região", "Histórico"],
    progress: 40,
  },
  "black-belts": {
    title: "FAIXAS ",
    highlight: "PRETAS",
    subtitle: "O registro mundial das faixas pretas chega em breve.",
    icon: Award,
    features: ["Mestres", "Academias", "Certificados"],
    progress: 55,
  },
  athletes: {
    title: "ATLE",
    highlight: "TAS",
    subtitle: "Perfis completos dos atletas filiados à BJJLF.",
    icon: User,
    features: ["Perfil", "Títulos", "Cartel"],
    progress: 30,
  },
  rules: {
    title: "REGULA",
    highlight: "MENTO",
    subtitle: "O regulamento oficial BJJLF estará disponível em breve.",
    icon: FileText,
    features: ["Regras", "Pontuação", "Download PDF"],
    progress: 80,
  },
};

export function ComingSoon({ page }: { page: ComingSoonPage }) {
  const cfg = CONFIG[page];
  const Icon = cfg.icon;
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <section className="relative overflow-hidden bg-gray-50 text-[#1a1a1a]">
      {/* Decorative orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "#C8211A", opacity: 0.06 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full blur-3xl"
        style={{ background: "#C8A84B", opacity: 0.08 }}
      />

      <div className="relative mx-auto flex min-h-[80vh] max-w-3xl flex-col items-center px-4 py-16 text-center md:py-24">
        {/* Logo */}
        <div className="mb-10">
          <Logo />
        </div>

        {/* Icon square */}
        <div
          className="mb-6 grid h-20 w-20 place-items-center rounded-2xl text-white shadow-lg"
          style={{
            background: "linear-gradient(135deg, #C8211A 0%, #8B1612 100%)",
          }}
        >
          <Icon size={40} strokeWidth={2.2} />
        </div>

        {/* "EM BREVE" badge */}
        <span
          className="mb-6 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-4 py-1 text-xs uppercase tracking-widest text-red-600"
          style={{ fontFamily: "Barlow", fontWeight: 700 }}
        >
          Em breve
        </span>

        {/* Title */}
        <h1
          className="text-6xl uppercase leading-[0.95] tracking-tight text-gray-900 md:text-7xl"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
        >
          {cfg.title}
          <span style={{ color: "#C8A84B" }}>{cfg.highlight}</span>
        </h1>

        {/* Divider */}
        <div className="mt-3 h-1 w-12 rounded bg-[#C8211A]" />

        {/* Subtitle */}
        <p
          className="mt-6 max-w-xl text-base text-gray-500 md:text-lg"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          {cfg.subtitle}
        </p>

        {/* Feature chips */}
        <div className="mt-10 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
          {cfg.features.map((f) => (
            <div
              key={f}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              {f}
            </div>
          ))}
        </div>

        {/* Email form */}
        <div className="mt-12 w-full max-w-md">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            Receba um aviso no lançamento
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-sm focus-within:border-gray-400"
          >
            <div className="grid place-items-center pl-4 text-gray-400">
              <Mail size={16} />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="flex-1 bg-transparent px-3 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none"
            />
            <button
              type="submit"
              className="px-5 text-xs font-bold uppercase tracking-[0.15em] text-white transition-opacity hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, #C8211A 0%, #8B1612 100%)",
              }}
            >
              Avisar
            </button>
          </form>
          {submitted && (
            <p className="mt-3 text-sm font-medium text-green-600">
              ✓ Pronto! Avisaremos você assim que estiver no ar.
            </p>
          )}
        </div>

        {/* Progress */}
        <div className="mt-12 w-full max-w-md">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="text-gray-400">Progresso</span>
            <span style={{ color: "#C8A84B" }} className="font-semibold">
              {cfg.progress}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${cfg.progress}%`,
                background:
                  "linear-gradient(90deg, #C8211A 0%, #C8A84B 100%)",
              }}
            />
          </div>
        </div>

        {/* Back link */}
        <Link
          to="/"
          className="mt-12 text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          ← Voltar para o início
        </Link>
      </div>
    </section>
  );
}
