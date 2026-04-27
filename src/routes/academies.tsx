import { createFileRoute } from "@tanstack/react-router";
import { AcademiesPage } from "@/pages/AcademiesPage";

export const Route = createFileRoute("/academies")({
  head: () => ({
    meta: [
      { title: "Academias Afiliadas — BJJLF" },
      {
        name: "description",
        content:
          "Encontre academias certificadas pela Brazilian Jiu-Jitsu Legends Federation. Filtre por país, estado e nome.",
      },
      { property: "og:title", content: "Academias Afiliadas — BJJLF" },
      {
        property: "og:description",
        content:
          "Escolas certificadas que seguem os padrões técnicos, disciplinares e filosóficos da BJJLF.",
      },
    ],
  }),
  component: AcademiesPage,
});
