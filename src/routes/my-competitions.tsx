import { createFileRoute } from "@tanstack/react-router";
import { MyCompetitionsPage } from "@/pages/MyCompetitionsPage";

export const Route = createFileRoute("/my-competitions")({
  head: () => ({
    meta: [
      { title: "Minhas Competições — BJJLF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyCompetitionsPage,
});
