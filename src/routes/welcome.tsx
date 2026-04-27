import { createFileRoute } from "@tanstack/react-router";
import { WelcomePage } from "@/pages/WelcomePage";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Bem-vindo — BJJLF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: WelcomePage,
});
