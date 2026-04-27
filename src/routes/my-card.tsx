import { createFileRoute } from "@tanstack/react-router";
import { MyCardPage } from "@/pages/MyCardPage";

export const Route = createFileRoute("/my-card")({
  head: () => ({
    meta: [
      { title: "Minha Carteirinha — BJJLF" },
      {
        name: "description",
        content:
          "Carteirinha digital do atleta BJJLF. Apresente em competições e eventos oficiais.",
      },
      { property: "og:title", content: "Minha Carteirinha — BJJLF" },
      {
        property: "og:description",
        content: "Carteirinha digital do atleta BJJLF.",
      },
    ],
  }),
  component: MyCardPage,
});
