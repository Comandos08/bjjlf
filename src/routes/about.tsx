import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About BJJLF — Mission, History & Leadership" },
      { name: "description", content: "Discover the mission, history, and leadership behind the Brazilian Jiu-Jitsu Legends Federation." },
      { property: "og:title", content: "About BJJLF" },
      { property: "og:description", content: "Mission, history, and leadership of the Brazilian Jiu-Jitsu Legends Federation." },
    ],
  }),
  component: AboutPage,
});
