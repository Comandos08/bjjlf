import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Route } from "@/routes/news.$slug";
import { useI18n, formatDateShort } from "@/lib/i18n";
import { resolveAsset } from "@/lib/asset-registry";
import { bustStorageUrl } from "@/lib/bust-storage-url";

const FALLBACK_NEWS_IMG =
  "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=1600&h=900";

function useNewsArticle(slug: string) {
  return useQuery({
    queryKey: ["news", "detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function NewsDetailPage() {
  const { slug } = Route.useParams();
  const { t, lang } = useI18n();
  const { data: article, isLoading, error } = useNewsArticle(slug);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-6" />
          <div className="h-10 w-3/4 bg-gray-100 rounded animate-pulse mb-4" />
          <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse mb-10" />
          <div className="aspect-video bg-gray-100 rounded animate-pulse mb-8" />
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-4/6 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="bg-white min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center">
          <h1
            className="text-3xl text-gray-900 mb-4"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            {lang === "pt" ? "Matéria não encontrada" : "Article not found"}
          </h1>
          <p className="text-gray-500 mb-8" style={{ fontFamily: "Barlow" }}>
            {lang === "pt"
              ? "A matéria que você procura não está disponível."
              : "The article you are looking for is not available."}
          </p>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-5 py-2.5 text-sm uppercase tracking-widest transition-base"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("nav.news")}
          </Link>
        </div>
      </div>
    );
  }

  const title = lang === "pt" ? article.title_pt ?? article.title_en : article.title_en;
  const body =
    (lang === "pt" ? article.body_pt : article.body_en) ??
    article.body_en ??
    article.body_pt ??
    "";
  const excerpt =
    (lang === "pt" ? article.excerpt_pt : article.excerpt_en) ??
    article.excerpt_en ??
    article.excerpt_pt ??
    "";
  const cover =
    bustStorageUrl(resolveAsset(article.cover_image_url), article.created_at) ??
    article.cover_image_url ??
    FALLBACK_NEWS_IMG;
  const date = (article.published_at ?? article.created_at).slice(0, 10);
  const categoryKey = `news.cat.${(article.category ?? "").toLowerCase()}.label`;
  const translatedCategory = t(categoryKey);
  const categoryLabel =
    translatedCategory === categoryKey
      ? (article.category ?? "").toUpperCase()
      : translatedCategory;

  return (
    <div className="bg-white min-h-screen">
      <article className="max-w-3xl mx-auto px-6 pt-12 pb-20">
        <Link
          to="/news"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#C8211A] mb-8 transition-base"
          style={{ fontFamily: "Barlow", fontWeight: 600 }}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("nav.news")}
        </Link>

        <span
          className="inline-block text-xs uppercase tracking-widest text-[#C8211A] mb-3"
          style={{ fontFamily: "Barlow", fontWeight: 700 }}
        >
          {categoryLabel}
        </span>

        <h1
          className="text-3xl md:text-5xl text-gray-900 leading-tight mb-5"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          {title}
        </h1>

        <div
          className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#C8A84B]" />
            {formatDateShort(date, lang)}
          </span>
          {article.author && (
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#C8A84B]" />
              {article.author}
            </span>
          )}
        </div>

        <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100 mb-10">
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {excerpt && (
          <p
            className="text-lg text-gray-700 leading-[1.7] mb-8 font-medium"
            style={{ fontFamily: "Barlow", fontWeight: 500 }}
          >
            {excerpt}
          </p>
        )}

        <div
          className="prose prose-lg max-w-none text-gray-800 leading-[1.8] whitespace-pre-wrap"
          style={{ fontFamily: "Barlow", fontWeight: 400 }}
        >
          {body}
        </div>
      </article>
    </div>
  );
}
