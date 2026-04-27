import { createFileRoute } from "@tanstack/react-router";
import { AthletesPage } from "@/pages/Athletes";

export const Route = createFileRoute("/athletes")({
  head: () => ({
    meta: [
      { title: "Atletas — BJJLF" },
      { name: "description", content: "Perfis completos dos atletas filiados à BJJLF: títulos e cartel. Em breve." },
      { property: "og:title", content: "Atletas — BJJLF" },
      { property: "og:description", content: "Perfis completos dos atletas filiados à BJJLF: títulos e cartel. Em breve." },
    ],
  }),
  component: AthletesPage,
});
