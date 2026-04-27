import { createFileRoute } from "@tanstack/react-router";
import { BlackBeltsPage } from "@/pages/BlackBelts";

export const Route = createFileRoute("/black-belts")({
  head: () => ({
    meta: [
      { title: "Faixas Pretas — BJJLF" },
      { name: "description", content: "Registro mundial de faixas pretas BJJLF: mestres, academias e certificados. Em breve." },
      { property: "og:title", content: "Faixas Pretas — BJJLF" },
      { property: "og:description", content: "Registro mundial de faixas pretas BJJLF: mestres, academias e certificados. Em breve." },
    ],
  }),
  component: BlackBeltsPage,
});
