import { useState } from "react";
import { Play } from "lucide-react";
import { SafeImage } from "@/components/SafeImage";

/**
 * Lazy-load de YouTube: mostra thumbnail estática até clique,
 * só então carrega o iframe (com autoplay). Reduz dezenas de
 * requisições e ~500kb da home.
 */
export function LazyYouTube({
  videoId,
  title,
  fallbackImage,
}: {
  videoId: string;
  title: string;
  fallbackImage?: string;
}) {
  const [active, setActive] = useState(false);

  if (active) {
    return (
      <iframe
        className="absolute inset-0 h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const thumb =
    fallbackImage ??
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <button
      type="button"
      onClick={() => setActive(true)}
      className="absolute inset-0 group"
      aria-label={`Play: ${title}`}
    >
      <SafeImage
        src={thumb}
        alt={title}
        fallbackLabel={title}
        source="video"
        wrapperClassName="absolute inset-0"
        className="opacity-80 group-hover:opacity-100 transition-opacity"
      />
      <span className="absolute inset-0 grid place-items-center">
        <span
          className="h-14 w-14 rounded-full bg-[#C8211A] grid place-items-center group-hover:scale-110 transition-transform"
          style={{ borderRadius: "9999px" }}
        >
          <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
        </span>
      </span>
    </button>
  );
}
