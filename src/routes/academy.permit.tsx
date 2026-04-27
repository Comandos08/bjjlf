import { createFileRoute } from "@tanstack/react-router";
import { AcademyPermitPage } from "@/pages/AcademyPermitPage";

export const Route = createFileRoute("/academy/permit")({
  head: () => ({
    meta: [
      { title: "Alvará de Academia — BJJLF" },
      {
        name: "description",
        content:
          "Solicite o Alvará Oficial BJJLF para sua academia. Renovação anual com QR code de validação pública.",
      },
      { property: "og:title", content: "Alvará de Academia — BJJLF" },
      {
        property: "og:description",
        content:
          "Certifique sua academia como afiliada oficial da BJJLF por 1 ano.",
      },
    ],
  }),
  component: AcademyPermitPage,
});
