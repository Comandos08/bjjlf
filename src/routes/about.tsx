import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/pages/AboutPage";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Sobre a BJJLF — Missão, História e Liderança" },
      { name: "description", content: "Conheça a missão, história e liderança da Brazilian Jiu-Jitsu Legends Federation." },
      { property: "og:title", content: "Sobre a BJJLF" },
      { property: "og:description", content: "Conheça a missão, história e liderança da Brazilian Jiu-Jitsu Legends Federation." },
    ],
  }),
  component: AboutPage,
});
