import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2, Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { useEffect, useState } from "react";
import dragon from "@/assets/dragon-logo.png";
import { supabase } from "@/integrations/supabase/client";

type VerifyResult = {
  academy_name: string;
  responsible_name: string;
  city: string;
  country: string;
  country_flag: string | null;
  status: string;
  issued_at: string | null;
  expires_at: string | null;
  permit_number: string;
  renewal_count: number;
};

export const Route = createFileRoute("/verify/academy/$permitNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Alvará ${params.permitNumber} — BJJLF` },
      {
        name: "description",
        content: "Verificação oficial de Alvará de Academia BJJLF.",
      },
    ],
  }),
  component: VerifyAcademyPermitPage,
});

type ViewState = "loading" | "active" | "expired" | "suspended" | "not_found";

function VerifyAcademyPermitPage() {
  const { permitNumber } = Route.useParams();
  const [permit, setPermit] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("verify_academy_permit", {
        p_permit_number: permitNumber,
      });
      if (cancelled) return;
      const row = Array.isArray(data) && data.length > 0 ? (data[0] as VerifyResult) : null;
      setPermit(row);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [permitNumber]);

  let state: ViewState = "loading";
  if (!loading) {
    if (!permit) state = "not_found";
    else if (permit.status === "suspended") state = "suspended";
    else if (
      permit.status !== "active" ||
      (permit.expires_at && new Date(permit.expires_at) < new Date())
    )
      state = "expired";
    else state = "active";
  }

  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "—";

  const config = (() => {
    switch (state) {
      case "active":
        return {
          topStripe: "linear-gradient(90deg, #C8211A, #C8A84B, #C8211A)",
          bottomStripe: "linear-gradient(90deg, #C8A84B, #C8211A, #C8A84B)",
          ringClass: "border-green-400 bg-green-50",
          icon: <ShieldCheck className="w-10 h-10 text-green-500" />,
          title: "ACADEMIA CERTIFICADA",
          titleClass: "text-green-600",
          subtitle: "Afiliada oficial BJJLF",
        };
      case "expired":
        return {
          topStripe: "linear-gradient(90deg, #C8211A, #8B1612, #C8211A)",
          bottomStripe: "linear-gradient(90deg, #8B1612, #C8211A, #8B1612)",
          ringClass: "border-red-300 bg-red-50",
          icon: <ShieldX className="w-10 h-10 text-red-400" />,
          title: "ALVARÁ VENCIDO",
          titleClass: "text-red-600",
          subtitle: "A certificação desta academia expirou",
        };
      case "suspended":
        return {
          topStripe: "#EAB308",
          bottomStripe: "#CA8A04",
          ringClass: "border-yellow-300 bg-yellow-50",
          icon: <ShieldAlert className="w-10 h-10 text-yellow-500" />,
          title: "ACADEMIA SUSPENSA",
          titleClass: "text-yellow-600",
          subtitle: "Esta certificação foi suspensa",
        };
      case "not_found":
        return {
          topStripe: "#7F1D1D",
          bottomStripe: "#450A0A",
          ringClass: "border-red-300 bg-red-50",
          icon: <ShieldX className="w-10 h-10 text-red-400" />,
          title: "NÃO ENCONTRADO",
          titleClass: "text-red-600",
          subtitle: "Este número não está registrado na BJJLF",
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
              <div style={{ height: 6, background: config.topStripe }} />

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
                  Alvará de Academia
                </p>
              </div>

              <div className="flex flex-col items-center mt-6 px-5">
                <div
                  className={`w-20 h-20 rounded-full border-4 flex items-center justify-center ${config.ringClass}`}
                >
                  {config.icon}
                </div>
                <h1
                  className={`mt-4 text-lg uppercase tracking-wider text-center ${config.titleClass}`}
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

              {permit && state !== "not_found" && (
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mx-5 mt-5">
                  <DataRow label="Academia" value={permit.academy_name} />
                  <DataRow label="Responsável" value={permit.responsible_name} />
                  <DataRow
                    label="Localização"
                    value={`${permit.city} — ${permit.country} ${permit.country_flag ?? ""}`}
                  />
                  <DataRow label="Emissão" value={fmtDate(permit.issued_at)} />
                  <DataRow
                    label="Validade"
                    value={fmtDate(permit.expires_at)}
                    valueClass={state === "expired" ? "text-red-500" : "text-green-600"}
                  />
                  <DataRow
                    label="Nº Alvará"
                    value={permit.permit_number}
                    valueClass="text-[#C8211A]"
                    valueFontFamily="Barlow Condensed"
                    valueFontWeight={700}
                  />
                  <DataRow
                    label="Renovações"
                    value={String(permit.renewal_count)}
                    isLast
                  />
                </div>
              )}

              <div className="flex justify-center mt-5 px-5">
                {state === "active" && (
                  <span
                    className="inline-block bg-green-50 border border-green-200 rounded-full px-4 py-1.5 text-xs text-green-700"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    ✓ Alvará válido até {fmtDate(permit?.expires_at ?? null)}
                  </span>
                )}
                {state === "expired" && (
                  <span
                    className="inline-block bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-xs text-red-600"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    ✗ Vencido em {fmtDate(permit?.expires_at ?? null)}
                  </span>
                )}
                {state === "suspended" && (
                  <span
                    className="inline-block bg-yellow-50 border border-yellow-200 rounded-full px-4 py-1.5 text-xs text-yellow-700"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    ⚠ Certificação suspensa
                  </span>
                )}
                {state === "not_found" && (
                  <span
                    className="inline-block bg-red-50 border border-red-200 rounded-full px-4 py-1.5 text-xs text-red-600"
                    style={{ fontFamily: "Barlow", fontWeight: 600 }}
                  >
                    ✗ Alvará não reconhecido
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
                  Escaneie o QR code do alvará para verificar
                </p>
              </div>

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
      className={`flex justify-between items-center py-2 gap-3 ${isLast ? "" : "border-b border-gray-100"}`}
    >
      <span
        className="text-xs text-gray-400 uppercase tracking-wider whitespace-nowrap"
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
