import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";
import dragon from "@/assets/dragon-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { computeValidity } from "@/lib/validity";

type VerifyResult = {
  full_name: string;
  belt: string;
  degree: number;
  academy: string | null;
  status: string;
  valid_until: string | null;
  registration_number: string;
};

export const Route = createFileRoute("/verify/$athleteId")({
  head: ({ params }) => ({
    meta: [
      { title: `Carteirinha ${params.athleteId} — BJJLF` },
      { name: "description", content: "Verificação oficial de atleta BJJLF." },
      { property: "og:title", content: `Carteirinha de Atleta — BJJLF` },
      { property: "og:description", content: `Verificação oficial da carteirinha BJJLF nº ${params.athleteId}.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `Carteirinha BJJLF ${params.athleteId}` },
    ],
  }),
  component: VerifyAthletePage,
});

type ViewState = "loading" | "verified" | "expired" | "inactive" | "not_found";

function VerifyAthletePage() {
  const { athleteId } = Route.useParams();
  const [profile, setProfile] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("verify_athlete", {
        _registration_number: athleteId,
      });
      if (cancelled) return;
      const row = Array.isArray(data) && data.length > 0 ? (data[0] as VerifyResult) : null;
      setProfile(row);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [athleteId]);

  let state: ViewState = "loading";
  if (!loading) {
    if (!profile) state = "not_found";
    else if (profile.status !== "active") state = "inactive";
    else if (profile.valid_until && new Date(profile.valid_until) < new Date()) state = "expired";
    else state = "verified";
  }

  const validUntilFormatted = profile?.valid_until
    ? new Date(profile.valid_until).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "—";

  // Per-state visual config.
  const config = (() => {
    switch (state) {
      case "verified":
        return {
          topStripe: "linear-gradient(90deg, #C8211A, #C8A84B, #C8211A)",
          bottomStripe: "linear-gradient(90deg, #C8A84B, #C8211A, #C8A84B)",
          ringClass: "border-green-400 bg-green-50",
          icon: <ShieldCheck className="w-10 h-10 text-green-500" />,
          title: "ATLETA VERIFICADO",
          titleClass: "text-green-600",
          subtitle: "Carteirinha oficial BJJLF",
        };
      case "expired":
        return {
          topStripe: "linear-gradient(90deg, #C8211A, #8B1612, #C8211A)",
          bottomStripe: "linear-gradient(90deg, #8B1612, #C8211A, #8B1612)",
          ringClass: "border-red-300 bg-red-50",
          icon: <ShieldX className="w-10 h-10 text-red-400" />,
          title: "CARTEIRINHA VENCIDA",
          titleClass: "text-red-600",
          subtitle: "A validade da carteirinha expirou",
        };
      case "inactive":
        return {
          topStripe: "#EAB308",
          bottomStripe: "#CA8A04",
          ringClass: "border-yellow-300 bg-yellow-50",
          icon: <ShieldAlert className="w-10 h-10 text-yellow-500" />,
          title: "CARTEIRINHA INATIVA",
          titleClass: "text-yellow-600",
          subtitle: "Cadastro pendente de aprovação",
        };
      case "not_found":
        return {
          topStripe: "#DC2626",
          bottomStripe: "#991B1B",
          ringClass: "border-red-300 bg-red-50",
          icon: <ShieldX className="w-10 h-10 text-red-400" />,
          title: "NÃO ENCONTRADO",
          titleClass: "text-red-600",
          subtitle: "Este ID não está registrado na BJJLF",
        };
      default:
        return null;
    }
  })();

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm mx-auto">
        {state === "loading" || !config ? (
          <div className="text-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-[#C8211A] mx-auto" />
            <p
              className="mt-4 text-sm text-gray-500"
              style={{ fontFamily: "Barlow", fontWeight: 400 }}
            >
              Verificando autenticidade...
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              {/* Top stripe */}
              <div style={{ height: 6, background: config.topStripe }} />

              {/* Header */}
              <div className="bg-gray-900 py-5 text-center">
                <div className="flex items-center justify-center gap-2">
                  <img src={dragon} alt="BJJLF" className="h-8 w-8 object-contain" />
                  <span
                    className="text-2xl text-[#C8211A]"
                    style={{
                      fontFamily: "Bebas Neue, Barlow Condensed, sans-serif",
                      letterSpacing: "3px",
                    }}
                  >
                    BJJLF
                  </span>
                </div>
                <p
                  className="mt-1 text-xs text-gray-400 uppercase tracking-widest"
                  style={{ fontFamily: "Barlow", fontWeight: 300 }}
                >
                  Verificação Oficial
                </p>
              </div>

              {/* Verification seal */}
              <div className="flex flex-col items-center mt-6 px-5">
                <div
                  className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${config.ringClass}`}
                >
                  {config.icon}
                </div>
                <h1
                  className={`mt-4 text-lg uppercase tracking-wider ${config.titleClass}`}
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
                >
                  {config.title}
                </h1>
                <p
                  className="mt-1 text-xs text-gray-400 text-center"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  {config.subtitle}
                </p>
              </div>

              {/* Athlete data block — only when we have a profile */}
              {profile && (state === "verified" || state === "expired") && (
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mx-5 mt-5">
                  <DataRow label="Nome" value={profile.full_name} />
                  <DataRow
                    label="Faixa"
                    value={`${profile.belt}${profile.degree ? ` — ${profile.degree}º grau` : ""}`}
                  />
                  <DataRow label="Academia" value={profile.academy ?? "—"} />
                  <DataRow
                    label="Validade"
                    value={validUntilFormatted}
                    valueClass={state === "expired" ? "text-red-500" : "text-green-600"}
                  />
                  <DataRow
                    label="ID"
                    value={profile.registration_number}
                    valueClass="text-[#C8211A]"
                    valueFontFamily="Barlow Condensed"
                    valueFontWeight={700}
                    isLast
                  />
                </div>
              )}

              {/* Validity badge */}
              <div className="flex justify-center mt-5 px-5">
                {state === "verified" && (
                  <span
                    className="inline-block bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs text-green-700"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    ✓ Carteirinha válida até {validUntilFormatted}
                  </span>
                )}
                {state === "expired" && (
                  <span
                    className="inline-block bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-xs text-red-600"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    ✗ Carteirinha vencida em {validUntilFormatted}
                  </span>
                )}
                {state === "inactive" && (
                  <span
                    className="inline-block bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-xs text-yellow-700"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    ⚠ Cadastro pendente de aprovação
                  </span>
                )}
                {state === "not_found" && (
                  <span
                    className="inline-block bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-xs text-red-600"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    ✗ Carteirinha não reconhecida
                  </span>
                )}
              </div>

              {state === "not_found" && (
                <p
                  className="mt-3 px-6 text-xs text-gray-400 text-center"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  Se você acredita que isto é um erro, entre em contato com a federação.
                </p>
              )}

              {/* Footer */}
              <div className="border-t border-gray-100 mt-6 py-4 text-center">
                <Shield className="h-4 w-4 text-gray-300 mx-auto mb-1" />
                <p
                  className="text-xs text-gray-400"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  Verificação oficial BJJLF
                </p>
                <p
                  className="text-xs text-gray-300 mt-0.5"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  Escaneie o QR code da carteirinha para verificar
                </p>
              </div>

              {/* Bottom stripe */}
              <div style={{ height: 3, background: config.bottomStripe }} />
            </div>

            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                style={{ fontFamily: "Barlow", fontWeight: 400 }}
              >
                ← Voltar ao site
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DataRow({
  label,
  value,
  valueClass,
  valueFontFamily = "Barlow",
  valueFontWeight = 600,
  isLast = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  valueFontFamily?: string;
  valueFontWeight?: number;
  isLast?: boolean;
}) {
  return (
    <div
      className={`flex justify-between items-center py-2 ${isLast ? "" : "border-b border-gray-100"}`}
    >
      <span
        className="text-xs text-gray-400 uppercase tracking-wider"
        style={{ fontFamily: "Barlow", fontWeight: 400 }}
      >
        {label}
      </span>
      <span
        className={`text-sm text-right ${valueClass ?? "text-gray-900"}`}
        style={{ fontFamily: valueFontFamily, fontWeight: valueFontWeight }}
      >
        {value}
      </span>
    </div>
  );
}
