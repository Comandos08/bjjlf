import { createFileRoute } from "@tanstack/react-router";
import { MyProfilePage } from "@/pages/MyProfilePage";

export const Route = createFileRoute("/my-profile")({
  head: () => ({
    meta: [
      { title: "Meu Perfil — BJJLF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyProfilePage,
});
