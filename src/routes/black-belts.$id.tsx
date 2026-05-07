import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SITE_URL = "https://bjjlf.lovable.app";
const FALLBACK_OG_IMAGE = `${SITE_URL}/og-default.png`;
const BIO_MAX = 1000;

function beltLabel(t: string): string {
  const map: Record<string, string> = {
    Preta: "Preta",
    "Vermelha e Preta": "Vermelha e Preta",
    "Vermelha e Branca": "Vermelha e Branca",
    Vermelha: "Vermelha",
    preta: "Preta",
    coral: "Vermelha e Preta",
    vermelha: "Vermelha",
    vermelha_e_preta: "Vermelha e Preta",
    vermelha_e_branca: "Vermelha e Branca",
    vermelha_branca: "Vermelha e Branca",
  };
  return map[t] ?? t;
}

type BlackBelt = {
  id: string;
  athlete_name: string;
  academy: string | null;
  professor: string | null;
  belt_type: string;
  belt_degree: number;
  country_code: string;
  flag_emoji: string | null;
  city: string | null;
  certificate_number: string;
  certified_at: string;
  photo_url: string | null;
  bio: string | null;
};

export const Route = createFileRoute("/black-belts/$id")({
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("certified_black_belts")
      .select("id, athlete_name, academy, professor, belt_type, belt_degree, country_code, flag_emoji, city, certificate_number, certified_at, photo_url, bio")
      .eq("id", params.id)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data as BlackBelt;
  },
  head: ({ loaderData, params }) => {
    const bb = loaderData as BlackBelt | undefined;
    if (!bb) {
      return { meta: [{ title: "Faixa Preta — BJJLF" }] };
    }
    const title = `${bb.athlete_name} — Faixa Preta BJJLF`;
    const bio = bb.bio?.trim();
    const desc = bio
      ? bio.length > 160
        ? `${bio.slice(0, 157)}...`
        : bio
      : `Conheça ${bb.athlete_name}, ${beltLabel(bb.belt_type)}${bb.belt_degree > 0 ? ` ${bb.belt_degree}º Dan` : ""} da Brazilian Jiu-Jitsu Legends Federation.`;
    const url = `${SITE_URL}/black-belts/${params.id}`;
    const image = bb.photo_url ?? FALLBACK_OG_IMAGE;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "profile" },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        { name: "twitter:image", content: image },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  errorComponent: ({ error }) => (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <p className="text-sm text-gray-600">Erro: {error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-6 text-center">
      <div>
        <h1 className="text-2xl text-gray-900 uppercase" style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}>
          Faixa Preta não encontrada
        </h1>
        <Link to="/black-belts" className="mt-4 inline-flex items-center gap-2 text-[#C8211A] hover:underline" style={{ fontFamily: "Barlow", fontWeight: 600 }}>
          <ArrowLeft className="h-4 w-4" /> Voltar para Faixas Pretas
        </Link>
      </div>
    </div>
  ),
  component: BlackBeltDetail,
});

function BlackBeltDetail() {
  const bb = Route.useLoaderData();
  const certifiedFmt = new Date(bb.certified_at).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          to="/black-belts"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
          style={{ fontFamily: "Barlow", fontWeight: 500 }}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Faixas Pretas
        </Link>

        <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-black text-white p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {bb.photo_url ? (
              <img
                src={bb.photo_url}
                alt={bb.athlete_name}
                className="w-32 h-32 rounded-full object-cover border-4 border-[#C8A84B] shrink-0"
              />
            ) : (
              <div className="w-32 h-32 rounded-full grid place-items-center bg-gray-800 border-4 border-[#C8A84B] text-3xl text-[#C8A84B] shrink-0"
                   style={{ fontFamily: "Barlow Condensed", fontWeight: 800 }}>
                {bb.athlete_name.split(" ").slice(0, 2).map((p) => p[0]).join("")}
              </div>
            )}
            <div className="text-center sm:text-left">
              <span
                className="inline-block bg-[#C8211A] text-white px-3 py-1 text-xs uppercase tracking-widest rounded-md mb-3"
                style={{ fontFamily: "Barlow", fontWeight: 600 }}
              >
                {bb.belt_degree}º Dan · {bb.belt_type}
              </span>
              <h1
                className="text-3xl md:text-4xl uppercase leading-tight"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 800, letterSpacing: "0.02em" }}
              >
                {bb.athlete_name}
              </h1>
              <p className="mt-2 text-gray-300" style={{ fontFamily: "Barlow" }}>
                {bb.flag_emoji ? `${bb.flag_emoji} ` : ""}{[bb.city, bb.country_code].filter(Boolean).join(", ")}
              </p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <dl className="grid sm:grid-cols-2 gap-4">
              <Info label="Academia" value={bb.academy ?? "—"} />
              <Info label="Professor" value={bb.professor ?? "—"} />
              <Info label="Certificado" value={<span className="font-mono">{bb.certificate_number}</span>} />
              <Info label="Data de certificação" value={certifiedFmt} />
            </dl>

            {bb.bio?.trim() && (
              <section>
                <h2
                  className="text-lg uppercase text-gray-900 mb-3"
                  style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
                >
                  Biografia
                </h2>
                <div className="h-1 w-12 bg-[#C8211A] rounded mb-4" />
                <p
                  className="leading-relaxed whitespace-pre-wrap"
                  style={{ fontFamily: "Lora, Georgia, serif", fontSize: 16, color: "#444444" }}
                >
                  {bb.bio.length > BIO_MAX ? `${bb.bio.slice(0, BIO_MAX)}...` : bb.bio}
                </p>
              </section>
            )}

            <div className="pt-6 border-t" style={{ borderColor: "#E5E5E5" }}>
              <Link
                to="/black-belts"
                className="inline-flex items-center gap-2 px-5 py-2.5 border-2 rounded-md uppercase transition-colors hover:bg-[#C8211A] hover:text-white"
                style={{
                  fontFamily: "Barlow",
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  borderColor: "#C8211A",
                  color: "#C8211A",
                }}
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para Faixas Pretas
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-gray-500 mb-1" style={{ fontFamily: "Barlow", fontWeight: 600 }}>{label}</dt>
      <dd className="text-gray-900" style={{ fontFamily: "Barlow", fontWeight: 500 }}>{value}</dd>
    </div>
  );
}
