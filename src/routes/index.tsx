import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/pages/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BJJLF — Brazilian Jiu-Jitsu Legends Federation" },
      {
        name: "description",
        content:
          "Federação oficial de Jiu-Jitsu Brasileiro: carteirinha digital, eventos, ranking e registro mundial de faixas pretas.",
      },
      { property: "og:title", content: "BJJLF — Brazilian Jiu-Jitsu Legends Federation" },
      {
        property: "og:description",
        content:
          "Federação oficial: carteirinha digital, eventos, ranking e registro mundial de faixas pretas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
