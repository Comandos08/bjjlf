import { createFileRoute } from "@tanstack/react-router";
import { RulesPage } from "@/pages/Rules";

export const Route = createFileRoute("/rules")({
  head: () => ({
    meta: [
      { title: "Regulamento — BJJLF" },
      { name: "description", content: "Regulamento oficial BJJLF: regras, pontuação e download em PDF. Em breve." },
      { property: "og:title", content: "Regulamento — BJJLF" },
      { property: "og:description", content: "Regulamento oficial BJJLF: regras, pontuação e download em PDF. Em breve." },
    ],
  }),
  component: RulesPage,
});
