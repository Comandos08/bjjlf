import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Loader2, AlertCircle, ArrowLeft, Share2, Download, Copy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import dragon from "@/assets/dragon-logo.png";
import { cn } from "@/lib/utils";
import { typo } from "@/lib/typography";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAthleteAuth } from "@/lib/athlete-auth";
import { computeValidity, formatValidUntil } from "@/lib/validity";
import { formatBeltLine } from "@/lib/belts-ibjjf";

export function MyCardPage() {
  const navigate = useNavigate();
  const { user, profile, isLoading, refresh } = useAthleteAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [savingImg, setSavingImg] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      void navigate({ to: "/athlete/login" });
    }
  }, [isLoading, user, navigate]);

  const initials = useMemo(() => {
    if (!profile) return "";
    const parts = profile.full_name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
  }, [profile]);

  const validity = useMemo(() => computeValidity(profile?.valid_until), [profile?.valid_until]);
  const validUntilFormatted = formatValidUntil(profile?.valid_until);

  if (isLoading || (!user && !profile)) return <CardPageSkeleton />;

  if (user && !profile) {
    return (
      <div className="bg-gray-50 min-h-screen grid place-items-center px-6">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <AlertCircle className="h-12 w-12 text-[#C8211A] mx-auto mb-4" />
          <h2 className="text-2xl uppercase text-gray-900 tracking-wide" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
            Perfil não encontrado
          </h2>
          <p className="mt-3 text-sm text-gray-500" style={{ fontFamily: "Barlow" }}>
            Não encontramos um perfil de atleta vinculado a esta conta. Cadastre-se para emitir sua carteirinha.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest no-underline"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) return <CardPageSkeleton />;

  const verifyUrl = profile.registration_number
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/verify/${profile.registration_number}`
    : "";

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${profile.user_id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("athlete-photos")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("athlete-photos").getPublicUrl(path);
      const { error: updErr } = await supabase
        .from("athlete_profiles")
        .update({ photo_url: pub.publicUrl })
        .eq("id", profile.id);
      if (updErr) throw updErr;
      await refresh();
      toast.success("Foto atualizada.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(`Falha ao enviar foto: ${msg}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleShare() {
    if (!verifyUrl) {
      toast.error("Sua carteirinha ainda não foi aprovada.");
      return;
    }
    const shareData = {
      title: `Carteirinha BJJLF — ${profile?.full_name ?? ""}`,
      text: `Verifique a carteirinha oficial BJJLF de ${profile?.full_name ?? ""}.`,
      url: verifyUrl,
    };
    try {
      if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
        await navigator.share(shareData);
        return;
      }
    } catch {
      // user cancelled — silent
      return;
    }
    // Fallback: clipboard
    try {
      await navigator.clipboard.writeText(verifyUrl);
      toast.success("Link copiado!");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  async function handleSaveImage() {
    if (!cardRef.current) return;
    setSavingImg(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `carteirinha-bjjlf-${profile?.registration_number ?? "atleta"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Imagem salva!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro";
      toast.error(`Falha ao salvar imagem: ${msg}`);
    } finally {
      setSavingImg(false);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <h1 className={cn("text-3xl text-gray-900 uppercase", "font-heading font-bold tracking-wide")}>Minha Carteirinha</h1>
          <div className="h-1 w-12 bg-[#C8211A] rounded mt-3 mx-auto" />
          <p className={cn(typo.body.sm, "mt-3")}>Apresente esta carteirinha em competições e eventos BJJLF</p>
        </div>

        <div className="flex flex-col items-center">
          {/* Banner crítico de validade */}
          {validity.kind === "critical" && (
            <div className="w-[300px] mb-4 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-center animate-pulse">
              <p className="text-sm text-red-700" style={{ fontFamily: "Barlow", fontWeight: 700 }}>
                🔴 Sua carteirinha vence em {validity.daysLeft} dia{validity.daysLeft === 1 ? "" : "s"}
              </p>
            </div>
          )}
          {validity.kind === "expired" && (
            <div className="w-[300px] mb-4 rounded-xl border-2 border-red-400 bg-red-100 px-4 py-3 text-center">
              <p className="text-sm text-red-800" style={{ fontFamily: "Barlow", fontWeight: 700 }}>
                ⛔ Carteirinha vencida há {validity.daysOverdue} dia{validity.daysOverdue === 1 ? "" : "s"}
              </p>
            </div>
          )}

          <div ref={cardRef} className="w-[300px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-[5px]" style={{ background: "linear-gradient(90deg, #C8211A, #C8A84B, #C8211A)" }} />
            <div className="px-5 pt-5 pb-4 text-center border-b border-gray-100">
              <div className="flex items-center justify-center gap-2">
                <img src={dragon} alt="BJJLF" className="h-7 w-7 object-contain" />
                <span className="text-2xl text-[#C8211A]" style={{ fontFamily: "Bebas Neue, Barlow Condensed, sans-serif", letterSpacing: "3px" }}>
                  BJJLF
                </span>
              </div>
              <p className="mt-1 text-[7.5px] text-gray-400 uppercase tracking-widest" style={{ fontFamily: "Barlow", fontWeight: 300 }}>
                Brazilian Jiu-Jitsu Legends Federation
              </p>
              <span className="inline-block mt-2 bg-red-50 border border-red-100 text-[#C8211A] text-[9px] uppercase tracking-widest px-3 py-1 rounded-full" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
                Carteirinha do Atleta
              </span>
            </div>

            <div className="px-5 pt-5 pb-4 flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center" style={{ outline: "2px solid #C8A84B", outlineOffset: "3px" }}>
                {profile.photo_url ? (
                  <img src={profile.photo_url} alt={profile.full_name} className="w-full h-full object-cover" crossOrigin="anonymous" />
                ) : (
                  <span className="text-3xl text-[#C8A84B]" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
                    {initials}
                  </span>
                )}
              </div>
              <h2 className="text-xl uppercase text-gray-900 text-center tracking-wide leading-tight" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
                {profile.full_name}
              </h2>
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-700 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full"
                  style={{ fontFamily: "Barlow", fontWeight: 500 }}>
                  {formatBeltLine(profile.belt, profile.degree) ?? `Faixa ${profile.belt}`}
                </span>
              </div>
            </div>

            <div className="mx-4 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
              <InfoRow label="Academia" value={profile.academy ?? "—"} />
              <InfoRow label="Professor" value={profile.professor ?? "—"} />
              <InfoRow label="País" value={`${profile.country_flag ?? ""} ${profile.country ?? ""}`.trim() || "—"} />
              <InfoRow label="Categoria" value={`${profile.category ?? "—"} — ${profile.modality ?? ""}`.trim()} last />
            </div>

            <div className="px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[8px] text-gray-400 uppercase tracking-widest" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
                  ID do Atleta
                </p>
                <p className="text-sm text-[#C8211A] tracking-wide" style={{ fontFamily: "Barlow Condensed", fontWeight: 600 }}>
                  {profile.registration_number ?? "—"}
                </p>
                <ValidityLine state={validity} validUntilFormatted={validUntilFormatted} />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-1.5">
                {verifyUrl ? (
                  <QRCodeSVG value={verifyUrl} size={48} bgColor="#ffffff" fgColor="#111827" level="M" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded" />
                )}
              </div>
            </div>
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #C8A84B, #C8211A, #C8A84B)" }} />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className={cn("px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:border-[#C8211A] hover:text-[#C8211A] transition-colors disabled:opacity-50")}
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              {uploading ? "Enviando…" : "Atualizar Foto"}
            </button>
            <button
              onClick={handleShare}
              disabled={!verifyUrl}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#C8211A] hover:bg-[#8B1612] disabled:opacity-50 rounded-lg transition-colors"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              <Share2 className="h-4 w-4" /> Compartilhar
            </button>
            <button
              onClick={handleSaveImage}
              disabled={savingImg}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-[#C8A84B]/20 hover:bg-[#C8A84B]/30 border border-[#C8A84B]/40 rounded-lg disabled:opacity-50 transition-colors"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              <Download className="h-4 w-4" /> {savingImg ? "Gerando…" : "Salvar imagem"}
            </button>
            <button
              onClick={async () => {
                if (!verifyUrl) return;
                try {
                  await navigator.clipboard.writeText(verifyUrl);
                  toast.success("Link copiado!");
                } catch {
                  toast.error("Não foi possível copiar.");
                }
              }}
              disabled={!verifyUrl}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
              style={{ fontFamily: "Barlow", fontWeight: 500 }}
            >
              <Copy className="h-3.5 w-3.5" /> Copiar link
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}

function ValidityLine({ state, validUntilFormatted }: { state: ReturnType<typeof computeValidity>; validUntilFormatted: string }) {
  const baseStyle = { fontFamily: "Barlow", fontWeight: 500 } as const;
  switch (state.kind) {
    case "ok":
      return (
        <p className="text-[10px] mt-1" style={baseStyle}>
          <span className="text-gray-400 uppercase tracking-widest">Válida até </span>
          <span className="text-green-600">{validUntilFormatted}</span>
          <span className="text-green-600"> · {state.daysLeft} dias</span>
        </p>
      );
    case "warning":
      return (
        <p className="text-[10px] mt-1 text-amber-600" style={baseStyle}>
          ⚠️ {state.daysLeft} dias restantes — renove em breve
        </p>
      );
    case "critical":
      return (
        <p className="text-[10px] mt-1 text-red-600" style={baseStyle}>
          🔴 Vence em {state.daysLeft} dia{state.daysLeft === 1 ? "" : "s"}
        </p>
      );
    case "expired":
      return (
        <p className="text-[10px] mt-1 text-red-700" style={baseStyle}>
          ⛔ Vencida há {state.daysOverdue} dia{state.daysOverdue === 1 ? "" : "s"}
        </p>
      );
    default:
      return (
        <p className="text-[10px] mt-1 text-gray-400 uppercase" style={baseStyle}>
          Validade pendente
        </p>
      );
  }
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={cn("flex justify-between items-center py-1.5 gap-3", !last && "border-b border-gray-100")}>
      <span className="text-[10px] text-gray-400 uppercase tracking-wider shrink-0" style={{ fontFamily: "Barlow", fontWeight: 400 }}>
        {label}
      </span>
      <span className="text-xs text-gray-900 text-right max-w-[160px] truncate" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}




function CardPageSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mx-auto" />
          <div className="h-1 w-12 bg-gray-200 rounded mt-3 mx-auto" />
          <div className="h-3 w-72 bg-gray-200 rounded mt-3 mx-auto animate-pulse" />
        </div>
        <div className="flex flex-col items-center">
          <div className="w-[300px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="h-16 bg-gray-200 rounded-t-2xl animate-pulse" />
            <div className="px-5 pt-5 pb-4 flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-32 bg-gray-100 rounded-xl mx-4 mt-2 animate-pulse" />
            <div className="h-16 bg-gray-100 rounded mx-4 mt-4 mb-5 animate-pulse" />
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-xs text-gray-400">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Carregando carteirinha…
          </div>
        </div>
      </div>
    </div>
  );
}
