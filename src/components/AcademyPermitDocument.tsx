/**
 * Visual permit document — printable A4 landscape.
 * Used at /my-permit/$permitNumber. Hides chrome via @media print.
 */
import { QRCodeSVG } from "qrcode.react";
import dragon from "@/assets/dragon-logo.png";

type Props = {
  academyName: string;
  responsibleName: string;
  city: string;
  country: string;
  countryFlag: string | null;
  permitNumber: string;
  issuedAt: string | null;
  expiresAt: string | null;
};

function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function AcademyPermitDocument({
  academyName,
  responsibleName,
  city,
  country,
  countryFlag,
  permitNumber,
  issuedAt,
  expiresAt,
}: Props) {
  const verifyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/verify/academy/${permitNumber}`
      : `/verify/academy/${permitNumber}`;

  return (
    <div
      className="permit-document mx-auto bg-white relative"
      style={{
        width: "297mm",
        minHeight: "210mm",
        maxWidth: "100%",
        aspectRatio: "297 / 210",
        border: "8px solid #C8211A",
        outline: "2px solid #C8A84B",
        outlineOffset: "-14px",
        padding: "32px 48px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <div className="text-center pt-2">
        <div className="flex items-center justify-center gap-3">
          <img src={dragon} alt="BJJLF" className="h-12 w-12 object-contain" />
          <span
            className="text-3xl text-[#C8211A]"
            style={{
              fontFamily: "Bebas Neue, Barlow Condensed, sans-serif",
              letterSpacing: "4px",
            }}
          >
            BJJLF
          </span>
        </div>
        <p
          className="mt-1 text-xs uppercase tracking-[0.3em] text-gray-500"
          style={{ fontFamily: "Barlow", fontWeight: 600 }}
        >
          Brazilian Jiu-Jitsu Legends Federation
        </p>

        <h1
          className="mt-6 text-4xl md:text-5xl uppercase text-[#C8A84B]"
          style={{
            fontFamily: "Barlow Condensed",
            fontWeight: 800,
            letterSpacing: "0.06em",
          }}
        >
          Alvará de Funcionamento
        </h1>
        <div className="h-1 w-32 bg-[#C8211A] mx-auto mt-3 rounded" />
      </div>

      {/* Body */}
      <div className="text-center mt-10 max-w-3xl mx-auto">
        <p
          className="text-base text-gray-700 leading-relaxed"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          A Brazilian Jiu-Jitsu Legends Federation certifica que a academia
        </p>
        <p
          className="mt-4 text-3xl uppercase text-gray-900"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
        >
          {academyName}
        </p>
        <p
          className="mt-3 text-base text-gray-700"
          style={{ fontFamily: "Barlow", fontWeight: 500 }}
        >
          sob responsabilidade de{" "}
          <span style={{ fontFamily: "Barlow", fontWeight: 700 }}>{responsibleName}</span>
        </p>
        <p
          className="mt-1 text-sm text-gray-500"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          {city} — {country} {countryFlag ?? ""}
        </p>
        <p
          className="mt-4 text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          está devidamente afiliada e autorizada a ministrar aulas de Jiu-Jitsu
          seguindo os padrões técnicos, filosóficos e disciplinares da BJJLF.
        </p>
      </div>

      {/* Dates + permit number */}
      <div className="mt-8 flex flex-wrap justify-center gap-12 text-center">
        <DateBlock label="Emissão" value={fmtDate(issuedAt)} />
        <DateBlock label="Validade" value={fmtDate(expiresAt)} highlight />
        <DateBlock label="Nº do Alvará" value={permitNumber} accent />
      </div>

      {/* Footer signature + QR + seal */}
      <div className="mt-10 flex items-end justify-between gap-6">
        {/* Seal */}
        <div className="flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-full grid place-items-center text-center"
            style={{
              background: "radial-gradient(circle, #C8A84B 0%, #8B7011 100%)",
              border: "3px double #FFFFFF",
              boxShadow: "0 0 0 2px #C8A84B",
            }}
          >
            <span
              className="text-white text-[10px] uppercase tracking-wider leading-tight px-2"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}
            >
              Selo
              <br />
              Oficial
              <br />
              BJJLF
            </span>
          </div>
        </div>

        {/* Signature */}
        <div className="text-center flex-1">
          <div className="border-t border-gray-400 w-64 mx-auto pt-2">
            <p
              className="text-sm uppercase text-gray-900"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              Mestre Sergio Malibu
            </p>
            <p
              className="text-[10px] uppercase tracking-widest text-gray-500"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              Faixa Vermelha e Branca 8º Dan — Presidente BJJLF
            </p>
          </div>
        </div>

        {/* QR */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-2 border border-gray-200 rounded">
            <QRCodeSVG
              value={verifyUrl}
              size={96}
              level="M"
              fgColor="#1A1A1A"
              bgColor="#FFFFFF"
            />
          </div>
          <p
            className="mt-1 text-[9px] text-gray-500 uppercase tracking-wider"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            Verificação
          </p>
        </div>
      </div>

      {/* Print stylesheet */}
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 0; }
          body { background: white !important; }
          header, footer, nav, .no-print { display: none !important; }
          .permit-document {
            box-shadow: none !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
}

function DateBlock({
  label,
  value,
  highlight,
  accent,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <p
        className="text-[10px] uppercase tracking-widest text-gray-500"
        style={{ fontFamily: "Barlow", fontWeight: 600 }}
      >
        {label}
      </p>
      <p
        className={`mt-1 text-lg ${
          accent ? "text-[#C8211A]" : highlight ? "text-green-700" : "text-gray-900"
        }`}
        style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
      >
        {value}
      </p>
    </div>
  );
}
