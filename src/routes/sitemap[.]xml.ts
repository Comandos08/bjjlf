import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://bjjlf.lovable.app";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const STATIC_ENTRIES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/about", changefreq: "monthly", priority: "0.8" },
  { path: "/academies", changefreq: "weekly", priority: "0.8" },
  { path: "/athletes", changefreq: "weekly", priority: "0.8" },
  { path: "/black-belts", changefreq: "weekly", priority: "0.9" },
  { path: "/events", changefreq: "daily", priority: "0.9" },
  { path: "/news", changefreq: "daily", priority: "0.9" },
  { path: "/rankings", changefreq: "weekly", priority: "0.7" },
  { path: "/rules", changefreq: "monthly", priority: "0.6" },
  { path: "/graduates", changefreq: "weekly", priority: "0.7" },
  { path: "/members", changefreq: "monthly", priority: "0.6" },
  { path: "/championships", changefreq: "weekly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.5" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
];

async function fetchDynamicEntries(): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];
  try {
    const [events, news, blackBelts] = await Promise.all([
      supabaseAdmin.from("events").select("id, created_at").eq("is_active", true).limit(1000),
      supabaseAdmin
        .from("news")
        .select("slug, published_at")
        .eq("is_published", true)
        .limit(1000),
      supabaseAdmin
        .from("certified_black_belts")
        .select("id, created_at")
        .eq("is_active", true)
        .limit(1000),
    ]);
    for (const e of events.data ?? []) {
      entries.push({
        path: `/events/${e.id}`,
        lastmod: e.created_at ?? undefined,
        changefreq: "weekly",
        priority: "0.7",
      });
    }
    for (const n of news.data ?? []) {
      if (!n.slug) continue;
      entries.push({
        path: `/news/${n.slug}`,
        lastmod: n.published_at ?? undefined,
        changefreq: "monthly",
        priority: "0.6",
      });
    }
    for (const bb of blackBelts.data ?? []) {
      entries.push({
        path: `/black-belts/${bb.id}`,
        lastmod: bb.created_at ?? undefined,
        changefreq: "monthly",
        priority: "0.6",
      });
    }
  } catch {
    // ignore — return what we have
  }
  return entries;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const dynamic = await fetchDynamicEntries();
        const all = [...STATIC_ENTRIES, ...dynamic];
        const urls = all.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
