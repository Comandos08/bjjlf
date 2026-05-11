import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { EventDetail } from "@/pages/EventDetail";
import { EVENTS, type Event } from "@/data/events";
import { supabase } from "@/integrations/supabase/client";
import { resolveAsset } from "@/lib/asset-registry";
import { bustStorageUrl } from "@/lib/bust-storage-url";

const FALLBACK_EVENT_IMG =
  "https://images.unsplash.com/photo-1583473848882-f9a5bc7fd2ee?auto=format&fit=crop&w=1440&h=600";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function normalizeBadge(s: string | null | undefined): Event["badge"] {
  const v = (s ?? "").toUpperCase().replace(/\s+/g, " ").trim();
  if (v === "NO-GI" || v === "NOGI" || v === "NO GI") return "NO-GI";
  if (v === "GI & NO-GI" || v === "GI&NO-GI" || v === "GI_NOGI") return "GI & NO-GI";
  if (v === "KIDS") return "KIDS";
  if (v === "MASTER") return "MASTER";
  return "GI";
}
function normalizeType(s: string | null | undefined): Event["type"] {
  const v = (s ?? "").toLowerCase();
  if (v.includes("no-gi") || v.includes("nogi")) return "No-Gi";
  if (v.includes("open")) return "Open";
  return "Gi";
}

export const Route = createFileRoute("/events/$eventId")({
  loader: async ({ params }) => {
    // Try Supabase first when the param looks like a UUID
    if (UUID_RE.test(params.eventId)) {
      const { data } = await supabase
        .from("events")
        .select("*")
        .eq("id", params.eventId)
        .maybeSingle();
      if (data) {
        const evt: Event = {
          id: data.id,
          name: data.name_pt ?? data.name_en ?? "Event",
          nameEn: data.name_en ?? undefined,
          namePt: data.name_pt ?? undefined,
          date: data.event_date,
          location: `${data.city}, ${data.country_code}`,
          image: bustStorageUrl(resolveAsset(data.image_url), data.created_at) ?? FALLBACK_EVENT_IMG,
          type: normalizeType(data.event_type),
          badge: normalizeBadge(data.event_type),
        };
        return evt;
      }
    }
    // Fallback to seed data (legacy slug ids like "wc25")
    const seed = EVENTS.find((e) => e.id === params.eventId);
    if (!seed) throw notFound();
    return seed;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — BJJLF` },
          {
            name: "description",
            content: `${loaderData.name} (${loaderData.badge}) on ${new Date(
              loaderData.date,
            ).toDateString()} — ${loaderData.location}.`,
          },
          { property: "og:title", content: `${loaderData.name} — BJJLF` },
          {
            property: "og:description",
            content: `${loaderData.badge} · ${loaderData.location} · ${new Date(
              loaderData.date,
            ).toDateString()}`,
          },
          { property: "og:image", content: loaderData.image },
          { property: "twitter:image", content: loaderData.image },
        ]
      : [{ title: "Event not found — BJJLF" }],
  }),
  component: EventDetail,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center space-y-4">
      <h1 className="font-display text-4xl text-primary">Event not found</h1>
      <Link to="/" className="text-gold underline">
        Back to home
      </Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-primary">Something went wrong</h1>
      <p className="mt-3 text-foreground/70">{error.message}</p>
    </div>
  ),
});
