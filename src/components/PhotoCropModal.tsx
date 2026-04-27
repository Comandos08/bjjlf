import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { Loader2, X } from "lucide-react";

/**
 * Modal de crop circular 1:1 para foto de perfil.
 * Mínimo 300x300 — saída em JPEG (quality 0.92).
 */
export function PhotoCropModal({
  file,
  onCancel,
  onConfirm,
  uploading = false,
}: {
  file: File | null;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
  uploading?: boolean;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);

  // Carrega o arquivo como dataURL quando abre
  if (file && !imageSrc) {
    const reader = new FileReader();
    reader.onload = () => setImageSrc(reader.result as string);
    reader.readAsDataURL(file);
  }

  const onCropComplete = useCallback((_: Area, areaPx: Area) => {
    setPixels(areaPx);
  }, []);

  async function handleConfirm() {
    if (!imageSrc || !pixels) return;
    const blob = await getCroppedBlob(imageSrc, pixels);
    onConfirm(blob);
  }

  function handleClose() {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setPixels(null);
    onCancel();
  }

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-md bg-white rounded-xl overflow-hidden shadow-2xl">
        <header className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
          <h3
            className="text-base text-gray-900 uppercase"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            Ajustar foto da carteirinha
          </h3>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-700"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="relative bg-gray-900" style={{ height: 320 }}>
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              minZoom={1}
              maxZoom={3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-gray-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
        </div>

        <div className="px-5 py-4 space-y-3">
          <label className="block">
            <span
              className="text-xs uppercase tracking-widest text-gray-500"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              Zoom
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full mt-1 accent-[#C8211A]"
            />
          </label>
          <p className="text-xs text-gray-500" style={{ fontFamily: "Barlow" }}>
            Arraste para reposicionar. A foto será salva quadrada (mín. 300×300px).
          </p>
        </div>

        <footer className="flex justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-white"
            style={{ fontFamily: "Barlow", fontWeight: 600 }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={uploading || !pixels}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white text-sm uppercase tracking-widest disabled:opacity-60"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar foto
          </button>
        </footer>
      </div>
    </div>
  );
}

// --- helpers de canvas ----------------------------------------------------

async function getCroppedBlob(src: string, area: Area): Promise<Blob> {
  const img = await loadImage(src);
  const minSize = 300;
  // Garante mínimo 300x300; aumenta se a área cropped for menor
  const out = Math.max(minSize, Math.round(area.width));
  const canvas = document.createElement("canvas");
  canvas.width = out;
  canvas.height = out;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível");
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, out, out);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Falha ao gerar imagem"))),
      "image/jpeg",
      0.92,
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
