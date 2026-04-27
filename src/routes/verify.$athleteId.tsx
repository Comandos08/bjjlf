import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, XCircle } from "lucide-react";
import dragon from "@/assets/dragon-logo.png";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/typography";

// Mock verification database — UI-only.
const MOCK_DB: Record<
  string,
  { full_name: string; belt: string; academy: string; valid_until: string }
> = {
  "04872": {
    full_name: "João da Silva",
    belt: "Roxa — 2º Grau",
    academy: "Gracie Legacy — Rio",
    valid_until: "2025-12-31",
  },
};

export const Route = createFileRoute("/verify/$athleteId")({
  head: ({ params }) => ({
    meta: [
      { title: `Verificar Atleta ${params.athleteId} — BJJLF` },
      {
        name: "description",
        content: "Verificação oficial de atleta BJJLF.",
      },
    ],
  }),
  component: VerifyAthletePage,
});

function VerifyAthletePage() {
  const { athleteId } = Route.useParams();
  const profile = MOCK_DB[athleteId.replace(/^BJJLF-\d{4}-/, "").padStart(5, "0").replace(/^0+/, "") ] || MOCK_DB[athleteId];
  const found = Boolean(profile);

  const validUntilFormatted = profile
    ? new Date(profile.valid_until).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-white py-16 px-6 flex flex-col items-center">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-10">
        <img src={dragon} alt="BJJLF" className="h-10 w-10 object-contain" />
        <span
          className="text-3xl text-[#C8211A]"
          style={{ fontFamily: "Bebas Neue, Barlow Condensed, sans-serif", letterSpacing: "3px" }}
        >
          BJJLF
        </span>
      </Link>

      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div
          className="h-[5px]"
          style={{
            background: found
              ? "linear-gradient(90deg, #16a34a, #C8A84B, #16a34a)"
              : "linear-gradient(90deg, #C8211A, #8B1612, #C8211A)",
          }}
        />

        <div className="p-8 text-center">
          {found ? (
            <>
              <CheckCircle className="h-14 w-14 text-green-600 mx-auto mb-3" />
              <h1
                className="text-2xl text-green-700 uppercase tracking-wide"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                Atleta Verificado
              </h1>
              <p className={cn(typo.body.sm, "mt-1")}>Carteirinha oficial BJJLF</p>

              <div className="mt-6 text-left bg-gray-50 rounded-xl border border-gray-100 px-5 py-4 space-y-3">
                <Row label="Nome" value={profile!.full_name} />
                <Row label="Faixa" value={profile!.belt} />
                <Row label="Academia" value={profile!.academy} />
                <Row label="Validade" value={validUntilFormatted} valueClass="text-green-700 font-medium" />
                <Row label="ID" value={`BJJLF-2025-${athleteId.padStart(5, "0").slice(-5)}`} />
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-14 w-14 text-[#C8211A] mx-auto mb-3" />
              <h1
                className="text-2xl text-[#C8211A] uppercase tracking-wide"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                Atleta Não Encontrado
              </h1>
              <p className={cn(typo.body.sm, "mt-2")}>
                Não foi possível localizar este atleta na base oficial BJJLF.
              </p>
            </>
          )}

          <Link
            to="/"
            className="inline-block mt-8 text-xs uppercase tracking-widest text-gray-500 hover:text-[#C8211A] transition-colors"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            ← Voltar ao site
          </Link>
        </div>
      </div>

      <p className={cn(typo.body.xs, "mt-6 text-center max-w-md")}>
        Brazilian Jiu-Jitsu Legends Federation — Verificação Oficial
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex justify-between items-center gap-3">
      <span
        className="text-[10px] text-gray-400 uppercase tracking-wider"
        style={{ fontFamily: "Barlow", fontWeight: 400 }}
      >
        {label}
      </span>
      <span
        className={cn("text-sm text-gray-900 text-right", valueClass)}
        style={{ fontFamily: "Barlow", fontWeight: 500 }}
      >
        {value}
      </span>
    </div>
  );
}
