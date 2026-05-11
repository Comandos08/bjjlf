import { createFileRoute } from "@tanstack/react-router";
import { NewsPage } from "@/pages/NewsPage";

export const Route = createFileRoute("/news/")({
  head: () => ({
    meta: [
      { title: "BJJLF News — Latest from the Federation" },
      { name: "description", content: "Tournament results, promotions, athlete spotlights, and announcements from the BJJLF." },
      { property: "og:title", content: "BJJLF News" },
      { property: "og:description", content: "Tournament results, promotions, and federation announcements." },
    ],
  }),
  component: NewsPage,
});
