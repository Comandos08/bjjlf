import { createFileRoute } from "@tanstack/react-router";
import { AthleteSignupPage } from "@/pages/athlete/AthleteSignupPage";

export const Route = createFileRoute("/athlete/signup")({
  head: () => ({
    meta: [
      { title: "Cadastro de Atleta — BJJLF" },
      { name: "description", content: "Crie sua conta de atleta da BJJLF e aguarde a aprovação da federação." },
    ],
  }),
  component: AthleteSignupPage,
});
