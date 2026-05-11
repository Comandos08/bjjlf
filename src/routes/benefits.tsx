import { createFileRoute } from "@tanstack/react-router";
import { BenefitsPage } from "@/pages/BenefitsPage";

export const Route = createFileRoute("/benefits")({
  head: () => ({
    meta: [
      { title: "Clube de Vantagens — BJJLF" },
      {
        name: "description",
        content:
          "Clube de Vantagens BJJLF: benefícios exclusivos em cursos, produtos, saúde e serviços para atletas associados.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: BenefitsPage,
});
