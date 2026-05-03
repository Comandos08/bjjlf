/**
 * ImageUploader — admin field that supports either uploading a file to the
 * `site-images` storage bucket or pasting an external URL. Returns the final
 * public URL via `onChange`.
 */
import { useRef, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { bustAnyImageUrl } from "@/lib/asset-registry";

interface Props {
  value: string;
  onChange: (url: string) => void;
  /** Subfolder inside the bucket (e.g. "hero", "news", "events"). */
  folder?: string;
  label?: string;
  previewClassName?: string;
}

const BUCKET = "site-images";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export function ImageUploader({
  value,
  onChange,
  folder = "misc",
  label = "Imagem",
  previewClassName = "mt-2 h-32 w-full object-cover border",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Imagem muito grande (máx. 5 MB).");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Imagem enviada!");
    } catch (e) {
      toast.error(`Falha no upload: ${(e as Error).message}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <label className="admin-label">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          className="admin-input flex-1"
          placeholder="https://... ou envie um arquivo →"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 h-9 px-3 text-xs uppercase tracking-wide bg-[#1A1A1A] text-white hover:bg-[#333] disabled:opacity-50"
          style={{ borderRadius: 0 }}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? "Enviando..." : "Upload"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center justify-center h-9 w-9 bg-[#F5F5F5] text-[#666] hover:bg-[#E5E5E5]"
            style={{ borderRadius: 0 }}
            aria-label="Remover"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {value && (
        <img
          src={bustAnyImageUrl(value) ?? value}
          alt=""
          className={previewClassName}
          style={{ borderColor: "#E5E5E5" }}
        />
      )}
      <p className="text-[10px] text-[#999]">
        JPG, PNG ou WebP até 5 MB. Você pode enviar um arquivo ou colar uma URL externa.
      </p>
    </div>
  );
}
