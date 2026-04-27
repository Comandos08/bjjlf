import { createFileRoute } from "@tanstack/react-router";
import { MyPermitsPage } from "@/pages/MyPermitsPage";

export const Route = createFileRoute("/my-permits")({
  head: () => ({
    meta: [
      { title: "Meus Alvarás — BJJLF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyPermitsPage,
});
