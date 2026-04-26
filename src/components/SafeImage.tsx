import { useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** Optional label shown inside the fallback (defaults to alt). */
  fallbackLabel?: string;
  /** Hide the icon inside the fallback (label-only). */
  hideFallbackIcon?: boolean;
  /** Class applied to the wrapper that hosts both the image and the fallback. */
  wrapperClassName?: string;
};

/**
 * <SafeImage /> renders an <img> and, if the request fails (404, network,
 * blocked, etc.), swaps in a styled placeholder using the project's design
 * tokens — never the browser's broken-image icon.
 *
 * The wrapper inherits sizing from `wrapperClassName`. Pass the same
 * width/height classes you would normally apply to the <img>.
 */
export function SafeImage({
  src,
  alt = "",
  className,
  wrapperClassName,
  fallbackLabel,
  hideFallbackIcon,
  loading = "lazy",
  ...rest
}: SafeImageProps) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-[#1A1A1A]",
        wrapperClassName,
      )}
    >
      {!errored && src ? (
        <img
          src={src}
          alt={alt}
          loading={loading}
          onError={() => setErrored(true)}
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
