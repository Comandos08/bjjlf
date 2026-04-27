import { createFileRoute } from "@tanstack/react-router";
import { RankingsPage } from "@/pages/Rankings";

export const Route = createFileRoute("/rankings")({
  head: () => ({
    meta: [
      { title: "Rankings — BJJLF" },
      { name: "description", content: "Rankings oficiais BJJLF por faixa, região e histórico. Em breve." },
      { property: "og:title", content: "Rankings — BJJLF" },
      { property: "og:description", content: "Rankings oficiais BJJLF por faixa, região e histórico. Em breve." },
    ],
  }),
  component: RankingsPage,
});
