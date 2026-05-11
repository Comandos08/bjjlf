import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Loader2, ExternalLink, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";
import { useI18n } from "@/lib/i18n";
import logoDragon from "@/assets/dragon-logo.png";

type Benefit = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  category: string;
  value_label: string | null;
  discount_label: string | null;
  external_link: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
};

const CATEGORY_FILTERS = [
  { value: "all", labelKey: "benefits.filter.all" },
  { value: "courses", labelKey: "benefits.filter.courses" },
  { value: "products", labelKey: "benefits.filter.products" },
  { value: "health", labelKey: "benefits.filter.health" },
  { value: "services", labelKey: "benefits.filter.services" },
  { value: "partners", labelKey: "benefits.filter.partners" },
] as const;

const BRAND_RED = "#C41E3A";
const BRAND_GOLD = "#B8960C";

function BenefitImage({ src, alt }: { src: string | null; alt: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full aspect-video object-cover"
      />
    );
  }
  return (
    <div
      className="w-full aspect-video grid place-items-center"
      style={{ background: "linear-gradient(135deg, #1A1A1A 0%, #2A2A2A 100%)" }}
    >
      <img src={logoDragon} alt="" className="h-16 w-16 opacity-70" />
    </div>
  );
}

export function BenefitsPage() {
  const { t } = useI18n();
  const { user, profile, isActive, isLoading: authLoading } = useAthleteAuth();
  const [filter, setFilter] = useState<string>("all");

  const authed = !!user && !!profile && isActive;

  const query = useQuery<Benefit[]>({
    queryKey: ["benefits", "public"],
    enabled: authed,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("member_benefits")
        .select(
          "id, name, description, image_url, category, value_label, discount_label, external_link, is_featured, is_active, sort_order",
        )
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Benefit[];
    },
  });

  const benefits = query.data ?? [];
  const filtered = useMemo(
    () => (filter === "all" ? benefits : benefits.filter((b) => b.category === filter)),
    [benefits, filter],
  );
  const featured = useMemo(
    () => benefits.filter((b) => b.is_featured).sort((a, b) => a.sort_order - b.sort_order),
    [benefits],
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]">
      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-10">
          {/* Header */}
          <div className="mb-8">
            <h1
              className="text-[#1A1A1A] uppercase"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1 }}
            >
              {t("benefits.title")}
            </h1>
            <p
              className="mt-2 text-[#666666]"
              style={{ fontFamily: "Barlow", fontWeight: 500, fontSize: 16 }}
            >
              {t("benefits.subtitle")}
            </p>
            <div className="mt-3 h-[3px] w-[80px]" style={{ background: BRAND_GOLD }} />
          </div>

          {/* Auth gate */}
          {!authLoading && !authed && (
            <div
              className="border bg-white p-10 text-center"
              style={{ borderColor: "#E5E5E5" }}
            >
              <Lock size={32} className="mx-auto text-[#C8A84B] mb-3" />
              <p
                className="text-[#1A1A1A]"
                style={{ fontFamily: "Barlow", fontWeight: 500, fontSize: 16 }}
              >
                {t("benefits.gate.message")}
              </p>
              <Link
                to="/athlete/login"
                className="inline-block mt-5 px-6 py-3 text-white uppercase transition-base"
                style={{
                  background: BRAND_RED,
                  fontFamily: "Barlow Condensed",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  borderRadius: 0,
                }}
              >
                {t("benefits.gate.cta")} →
              </Link>
            </div>
          )}

          {authed && (
            <>
              {/* Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORY_FILTERS.map((c) => {
                  const active = filter === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => setFilter(c.value)}
                      className="px-4 py-2 text-sm uppercase tracking-wide transition-base border"
                      style={{
                        background: active ? BRAND_RED : "#FFFFFF",
                        color: active ? "#FFFFFF" : "#1A1A1A",
                        borderColor: active ? BRAND_RED : "#E5E5E5",
                        fontFamily: "Barlow Condensed",
                        fontWeight: 700,
                        borderRadius: 0,
                      }}
                    >
                      {t(c.labelKey)}
                    </button>
                  );
                })}
              </div>

              <div className={`grid gap-6 ${featured.length > 0 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
                {/* Main grid */}
                <div className={featured.length > 0 ? "lg:col-span-3" : "lg:col-span-3"}>
                  {query.isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white border animate-pulse" style={{ borderColor: "#E5E5E5" }}>
                          <div className="w-full aspect-video bg-[#EEEEEE]" />
                          <div className="p-4 space-y-2">
                            <div className="h-5 w-3/4 bg-[#EEEEEE]" />
                            <div className="h-3 w-1/2 bg-[#EEEEEE]" />
                            <div className="h-3 w-full bg-[#EEEEEE]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : query.isError ? (
                    <div className="bg-white border p-8 text-center text-[#C8211A]" style={{ borderColor: "#E5E5E5" }}>
                      {(query.error as Error).message}
                    </div>
                  ) : filtered.length === 0 ? (
                    <div
                      className="bg-white border p-10 text-center text-[#666666]"
                      style={{ borderColor: "#E5E5E5", fontFamily: "Barlow", fontWeight: 500 }}
                    >
                      {t("benefits.empty")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filtered.map((b) => (
                        <BenefitCard key={b.id} benefit={b} ctaLabel={t("benefits.cta")} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Featured sidebar */}
                {featured.length > 0 && (
                  <aside className="lg:col-span-1">
                    <div className="lg:sticky lg:top-20 bg-white border p-5" style={{ borderColor: "#E5E5E5" }}>
                      <h2
                        className="text-[#1A1A1A] uppercase"
                        style={{ fontFamily: "Barlow Condensed", fontWeight: 900, fontSize: 22, lineHeight: 1 }}
                      >
                        {t("benefits.featured")}
                      </h2>
                      <div className="mt-2 h-[3px] w-[40px]" style={{ background: BRAND_GOLD }} />

                      <ul className="mt-4 divide-y" style={{ borderColor: "#F0F0F0" }}>
                        {featured.map((b) => (
                          <li key={b.id}>
                            <a
                              href={b.external_link ?? "#"}
                              target={b.external_link ? "_blank" : undefined}
                              rel={b.external_link ? "noopener noreferrer" : undefined}
                              className="flex items-center gap-3 py-3 group"
                            >
                              <div className="w-16 h-16 shrink-0 overflow-hidden border" style={{ borderColor: "#E5E5E5" }}>
                                {b.image_url ? (
                                  <img src={b.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                                ) : (
                                  <div
                                    className="w-full h-full grid place-items-center"
                                    style={{ background: "#1A1A1A" }}
                                  >
                                    <img src={logoDragon} alt="" className="h-8 w-8 opacity-70" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p
                                  className="text-[#1A1A1A] text-sm truncate"
                                  style={{ fontFamily: "Barlow", fontWeight: 700 }}
                                >
                                  {b.name}
                                </p>
                                {b.discount_label && (
                                  <p
                                    className="text-[11px] uppercase tracking-wider"
                                    style={{ color: BRAND_RED, fontFamily: "Barlow Condensed", fontWeight: 700 }}
                                  >
                                    {b.discount_label}
                                  </p>
                                )}
                              </div>
                              <ArrowRight
                                size={16}
                                className="text-[#999999] group-hover:text-[#C8211A] transition-base shrink-0"
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </aside>
                )}
              </div>
            </>
          )}

          {authLoading && (
            <div className="grid place-items-center py-20">
              <Loader2 className="animate-spin text-[#666666]" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function BenefitCard({ benefit, ctaLabel }: { benefit: Benefit; ctaLabel: string }) {
  return (
    <div className="bg-white border flex flex-col" style={{ borderColor: "#E5E5E5" }}>
      <div className="relative">
        <BenefitImage src={benefit.image_url} alt={benefit.name} />
        {benefit.discount_label && (
          <span
            className="absolute top-0 left-0 px-3 py-1.5 text-xs uppercase tracking-wider"
            style={{
              background: BRAND_GOLD,
              color: "#1A1A1A",
              fontFamily: "Barlow Condensed",
              fontWeight: 900,
              borderRadius: 0,
            }}
          >
            {benefit.discount_label}
          </span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-[#1A1A1A]"
          style={{ fontFamily: "Barlow", fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}
        >
          {benefit.name}
        </h3>
        <span
          className="mt-1 inline-block text-[10px] uppercase tracking-wider text-[#666666] self-start px-2 py-0.5 border"
          style={{ borderColor: "#E5E5E5", fontFamily: "Barlow", fontWeight: 600 }}
        >
          {benefit.category}
        </span>
        {benefit.description && (
          <p
            className="mt-2 text-sm text-[#666666] overflow-hidden"
            style={{
              fontFamily: "Barlow",
              fontWeight: 400,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {benefit.description}
          </p>
        )}
        {benefit.value_label && (
          <p
            className="mt-2 text-sm"
            style={{ color: BRAND_GOLD, fontFamily: "Barlow Condensed", fontWeight: 700, letterSpacing: "0.04em" }}
          >
            {benefit.value_label}
          </p>
        )}
        <div className="mt-auto pt-4">
          <a
            href={benefit.external_link ?? "#"}
            target={benefit.external_link ? "_blank" : undefined}
            rel={benefit.external_link ? "noopener noreferrer" : undefined}
            className="flex items-center justify-center gap-2 w-full py-3 text-white uppercase transition-base hover:opacity-90"
            style={{
              background: BRAND_RED,
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              letterSpacing: "0.06em",
              borderRadius: 0,
              fontSize: 14,
            }}
            aria-disabled={!benefit.external_link}
          >
            {ctaLabel}
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
