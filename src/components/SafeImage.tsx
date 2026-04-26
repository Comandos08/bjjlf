import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageCacheUrl } from "@/lib/image-cache";
import {
  registerImage,
  reportImageStatus,
  unregisterImage,
} from "@/lib/image-registry";

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackLabel?: string;
  hideFallbackIcon?: boolean;
  wrapperClassName?: string;
  /** Tag for the dev debug panel (e.g. "hero", "event", "news", "video"). */
  source?: string;
};

const isDev = import.meta.env.DEV;

/**
 * <SafeImage /> renders an <img> and, if it fails (404/network/blocked),
 * swaps in a styled placeholder using the project's design tokens.
 * In dev, every instance reports its load/error status to the image
 * registry consumed by the <ImageDebugPanel />.
 */
export function SafeImage({
  src,
  alt = "",
  className,
  wrapperClassName,
  fallbackLabel,
  hideFallbackIcon,
  loading = "lazy",
  source = "other",
  onLoad,
  onError,
  ...rest
}: SafeImageProps) {
  const [status, setStatus] = useState<"pending" | "loaded" | "error">("pending");
  const idRef = useRef<string | null>(null);

  // Resolve the URL through the cache hook. In production this is a no-op;
  // in dev it appends a `?v=<timestamp>` token regenerated **per mount** so a
  // previously-failed (404) response can't be served from the browser cache.
  const resolvedSrc = useImageCacheUrl(typeof src === "string" ? src : undefined) ?? src;

  useEffect(() => {
    if (!isDev || !src) return;
    const id = registerImage({
      // Register the *original* URL so the debug panel stays readable.
      url: String(src),
      label: fallbackLabel ?? alt ?? "",
      source,
    });
    idRef.current = id;
    return () => unregisterImage(id);
    // We intentionally only re-register when the URL changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const errored = status === "error";

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[#1A1A1A]",
        wrapperClassName,
      )}
      data-testid="safe-image"
      data-image-source={source}
      data-image-status={status}
      data-image-url={typeof src === "string" ? src : undefined}
    >
      {!errored && src ? (
        <img
          src={resolvedSrc}
          alt={alt}
          loading={loading}
          onLoad={(e) => {
            setStatus("loaded");
            if (idRef.current) reportImageStatus(idRef.current, "loaded");
            onLoad?.(e);
          }}
          onError={(e) => {
            setStatus("error");
            if (idRef.current) reportImageStatus(idRef.current, "error");
            onError?.(e);
          }}
          className={cn("h-full w-full object-cover", className)}
          {...rest}
        />
      ) : (
        <Fallback label={fallbackLabel ?? alt} hideIcon={hideFallbackIcon} />
      )}
    </div>
  );
}

function Fallback({ label, hideIcon }: { label?: string; hideIcon?: boolean }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center"
      style={{
        background:
          "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 55%, #1A1A1A 100%)",
        borderLeft: "3px solid #C41E3A",
      }}
      role="img"
      aria-label={label || "Image unavailable"}
    >
      {!hideIcon && (
        <div
          className="grid h-9 w-9 place-items-center"
          style={{ background: "rgba(196,30,58,0.15)", color: "#B8960C" }}
        >
          <ImageOff size={18} />
        </div>
      )}
      {label ? (
        <span
          className="line-clamp-2 text-[11px] uppercase"
          style={{
            fontFamily: "Barlow Condensed",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}
