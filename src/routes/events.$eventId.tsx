import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { EventDetail } from "@/pages/EventDetail";
import { EVENTS } from "@/data/events";

export const Route = createFileRoute("/events/$eventId")({
  loader: ({ params }) => {
    const event = EVENTS.find((e) => e.id === params.eventId);
    if (!event) throw notFound();
    return event;
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
