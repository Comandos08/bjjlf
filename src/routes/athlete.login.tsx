import { createFileRoute } from "@tanstack/react-router";
import { AthleteLoginPage } from "@/pages/athlete/AthleteLoginPage";

export const Route = createFileRoute("/athlete/login")({
  head: () => ({
    meta: [
      { title: "Login do Atleta — BJJLF" },
      { name: "description", content: "Acesse sua área de atleta da BJJLF." },
    ],
  }),
  component: AthleteLoginPage,
});
