import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowLeft, ExternalLink, Loader2, Printer, RefreshCw, ShieldX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AcademyPermitDocument } from "@/components/AcademyPermitDocument";
import { computeValidity, formatValidUntil } from "@/lib/validity";

type Permit = {
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

export function MyPermitPage({ permitNumber }: { permitNumber: string }) {
  const [permit, setPermit] = useState<Permit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("verify_academy_permit", {
        p_permit_number: permitNumber,
      });
      if (cancelled) return;
      const row = Array.isArray(data) && data.length > 0 ? (data[0] as Permit) : null;
      setPermit(row);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [permitNumber]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!permit) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-md mx-auto text-center px-4">
          <ShieldX className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h1
            className="text-2xl text-gray-900 uppercase"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
          >
            Alvará não encontrado
          </h1>
          <p
            className="mt-2 text-sm text-gray-500"
            style={{ fontFamily: "Barlow" }}
          >
            Este número não está registrado ou ainda não foi ativado.
          </p>
          <Link
            to="/my-permits"
            className="mt-5 inline-flex items-center gap-2 text-[#C8211A] hover:underline"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 print:py-0 print:bg-white">
      <div className="max-w-[1200px] mx-auto px-4">
        {/* Action bar — hidden on print */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            to="/my-permits"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            style={{ fontFamily: "Barlow", fontWeight: 500 }}
          >
            <ArrowLeft className="h-4 w-4" /> Meus alvarás
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/verify/academy/$permitNumber"
              params={{ permitNumber: permit.permit_number }}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs uppercase tracking-widest text-gray-700 hover:border-gray-900"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              <ExternalLink className="h-4 w-4" /> Ver verificação
            </Link>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-4 py-2 text-xs uppercase tracking-widest transition"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              <Printer className="h-4 w-4" /> Imprimir / PDF
            </button>
          </div>
        </div>

        <RenewalBanner expiresAt={permit.expires_at} permitNumber={permit.permit_number} />

        <AcademyPermitDocument
          academyName={permit.academy_name}
          responsibleName={permit.responsible_name}
          city={permit.city}
          country={permit.country}
          countryFlag={permit.country_flag}
          permitNumber={permit.permit_number}
          issuedAt={permit.issued_at}
          expiresAt={permit.expires_at}
        />
      </div>
    </div>
  );
}

/**
 * Banner de aviso de renovação:
 * - >60d: nada
 * - 30-60d: âmbar (aviso)
 * - <30d: vermelho com botão "RENOVAR AGORA"
 * - vencido: vermelho enfático
 */
function RenewalBanner({ expiresAt, permitNumber }: { expiresAt: string | null; permitNumber: string }) {
  const v = computeValidity(expiresAt);
  if (v.kind === "none" || v.kind === "ok") return null;

  const formatted = formatValidUntil(expiresAt);
  const isCritical = v.kind === "critical" || v.kind === "expired";
  const bg = isCritical
    ? "bg-red-50 border-red-300 text-red-900"
    : "bg-amber-50 border-amber-300 text-amber-900";
  const iconColor = isCritical ? "text-red-600" : "text-amber-600";

  let message = "";
  if (v.kind === "warning") {
    message = `Renove seu alvará para manter sua academia ativa. Vence em ${v.daysLeft} dias (${formatted}).`;
  } else if (v.kind === "critical") {
    message = `⚠️ Seu alvará vence em ${v.daysLeft} dias (${formatted}). Renove agora para evitar suspensão.`;
  } else if (v.kind === "expired") {
    message = `🔴 Seu alvará venceu há ${v.daysOverdue} dias (${formatted}). Renove imediatamente.`;
  }

  return (
    <div
      className={`no-print mb-6 border-2 rounded-xl px-5 py-4 flex flex-wrap items-center gap-4 ${bg} ${
        isCritical ? "animate-pulse-soft" : ""
      }`}
    >
      <AlertTriangle className={`h-6 w-6 shrink-0 ${iconColor}`} />
      <div className="flex-1 min-w-[240px]">
        <div className="text-sm font-semibold" style={{ fontFamily: "Barlow", fontWeight: 700 }}>
          {message}
        </div>
      </div>
      {isCritical && (
        <Link
          to="/register/academy"
          search={{ renew: permitNumber } as never}
          className="inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-4 py-2 text-xs uppercase tracking-widest transition shrink-0"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          <RefreshCw className="h-4 w-4" /> Renovar agora
        </Link>
      )}
    </div>
  );
}
