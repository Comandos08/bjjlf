import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { UserCircle } from "lucide-react";
import dragon from "@/assets/dragon-logo.png";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/typography";

// Mock athlete profile (UI-only). Substitute with real data once backend exists.
const MOCK_PROFILE = {
  id: "04872",
  full_name: "João da Silva",
  belt: "Roxa",
  belt_color: "#5B2A86",
  belt_text_color: "#FFFFFF",
  degree: 2,
  max_degrees: 3,
  academy: "Gracie Legacy — Rio",
  professor: "Mestre Roberto Lima",
  country: "Brasil",
  country_flag: "🇧🇷",
  category: "Adulto",
  modality: "GI & NO-GI",
  photo_url: "" as string,
  valid_until: "2025-12-31",
};

type Profile = typeof MOCK_PROFILE;

export function MyCardPage() {
  const [profile, setProfile] = useState<Profile>(MOCK_PROFILE);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const fullId = useMemo(
    () => `BJJLF-${new Date().getFullYear()}-${profile.id.padStart(5, "0")}`,
    [profile.id]
  );

  const initials = useMemo(() => {
    const parts = profile.full_name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
  }, [profile.full_name]);

  const validUntilFormatted = useMemo(() => {
    const d = new Date(profile.valid_until);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }, [profile.valid_until]);

  const verifyUrl = `https://bjjlf.lovable.app/verify/${profile.id}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    // UI-only: read as data URL
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, photo_url: reader.result as string }));
      setUploading(false);
    };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className={cn("text-3xl text-gray-900 uppercase", "font-heading font-bold tracking-wide")}>
            Minha Carteirinha
          </h1>
          <div className="h-1 w-12 bg-[#C8211A] rounded mt-3 mx-auto" />
          <p className={cn(typo.body.sm, "mt-3")}>
            Apresente esta carteirinha em competições e eventos BJJLF
          </p>
        </div>

        {/* Card */}
        <div className="flex flex-col items-center">
          <div
            className="w-[300px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
          >
            {/* Top stripe */}
            <div
              className="h-[5px]"
              style={{ background: "linear-gradient(90deg, #C8211A, #C8A84B, #C8211A)" }}
            />

            {/* Header */}
            <div className="px-5 pt-5 pb-4 text-center border-b border-gray-100">
              <div className="flex items-center justify-center gap-2">
                <img src={dragon} alt="BJJLF" className="h-7 w-7 object-contain" />
                <span
                  className="text-2xl text-[#C8211A]"
                  style={{ fontFamily: "Bebas Neue, Barlow Condensed, sans-serif", letterSpacing: "3px" }}
                >
                  BJJLF
                </span>
              </div>
              <p
                className="mt-1 text-[7.5px] text-gray-400 uppercase tracking-widest"
                style={{ fontFamily: "Barlow", fontWeight: 300 }}
              >
                Brazilian Jiu-Jitsu Legends Federation
              </p>
              <span
                className="inline-block mt-2 bg-red-50 border border-red-100 text-[#C8211A] text-[9px] uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ fontFamily: "Barlow", fontWeight: 500 }}
              >
                Carteirinha do Atleta
              </span>
            </div>

            {/* Photo + Name */}
            <div className="px-5 pt-5 pb-4 flex flex-col items-center gap-3">
              <div
                className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center"
                style={{ outline: "2px solid #C8A84B", outlineOffset: "3px" }}
              >
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="text-3xl text-[#C8A84B]"
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                  >
                    {initials}
                  </span>
                )}
              </div>

              <h2
                className="text-xl uppercase text-gray-900 text-center tracking-wide leading-tight"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
              >
                {profile.full_name}
              </h2>

              <div className="flex flex-col items-center gap-2">
                <span
                  className="text-xs text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full"
                  style={{ fontFamily: "Barlow", fontWeight: 500 }}
                >
                  Faixa {profile.belt}
                </span>
                <DegreeDots filled={profile.degree} max={profile.max_degrees} />
              </div>
            </div>

            {/* Info block */}
            <div className="mx-4 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
              <InfoRow label="Academia" value={profile.academy} />
              <InfoRow label="Professor" value={profile.professor} />
              <InfoRow label="País" value={`${profile.country_flag} ${profile.country}`} />
              <InfoRow label="Categoria" value={`${profile.category} — ${profile.modality}`} last />
            </div>

            {/* Footer ID + QR */}
            <div className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p
                  className="text-[8px] text-gray-400 uppercase tracking-widest"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  ID do Atleta
                </p>
                <p
                  className="text-sm text-[#C8211A] tracking-wide"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 600 }}
                >
                  {fullId}
                </p>
                <p
                  className="text-[8px] text-gray-400 uppercase mt-1"
                  style={{ fontFamily: "Barlow", fontWeight: 400 }}
                >
                  Válido até:{" "}
                  <span className="text-green-600 font-medium normal-case">{validUntilFormatted}</span>
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-1.5">
                <QRCodeSVG
                  value={verifyUrl}
                  size={48}
                  bgColor="#ffffff"
                  fgColor="#111827"
                  level="M"
                />
              </div>
            </div>

            {/* Bottom stripe */}
            <div
              className="h-[3px]"
              style={{ background: "linear-gradient(90deg, #C8A84B, #C8211A, #C8A84B)" }}
            />
          </div>

          {/* Update photo button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "mt-6 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg",
              "hover:border-[#C8211A] hover:text-[#C8211A] transition-colors disabled:opacity-50"
            )}
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            {uploading ? "Enviando…" : "Atualizar Foto"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Mock notice */}
          <p className={cn(typo.body.xs, "mt-6 text-center max-w-md")}>
            * Dados de demonstração. A integração com perfis de atleta será habilitada
            quando o sistema de autenticação for ativado.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div
      className={cn(
        "flex justify-between items-center py-1.5 gap-3",
        !last && "border-b border-gray-100"
      )}
    >
      <span
        className="text-[10px] text-gray-400 uppercase tracking-wider shrink-0"
        style={{ fontFamily: "Barlow", fontWeight: 400 }}
      >
        {label}
      </span>
      <span
        className="text-xs text-gray-900 text-right max-w-[160px] truncate"
        style={{ fontFamily: "Barlow", fontWeight: 500 }}
      >
        {value}
      </span>
    </div>
  );
}

function DegreeDots({ filled, max }: { filled: number; max: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }).map((_, i) => {
        const on = i < filled;
        return (
          <span
            key={i}
            className={cn("rounded-full", on ? "" : "border border-gray-300")}
            style={{
              width: 7,
              height: 7,
              background: on ? "#C8A84B" : "transparent",
            }}
          />
        );
      })}
    </div>
  );
}

// Empty state component (exported for completeness; not used in mock mode)
export function MyCardEmptyState() {
  return (
    <div className="bg-gray-50 min-h-screen py-20 flex items-center justify-center">
      <div className="text-center max-w-md px-6">
        <UserCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2
          className="text-2xl text-gray-900 uppercase"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          Perfil não encontrado
        </h2>
        <p className={cn(typo.body.sm, "mt-2")}>
          Entre em contato com sua academia para ativar sua carteirinha.
        </p>
        <Link
          to="/"
          className="inline-block mt-6 px-5 py-2.5 bg-[#C8211A] text-white text-sm uppercase tracking-widest rounded-md hover:bg-[#8B1612] transition-colors"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
