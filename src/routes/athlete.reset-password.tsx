import { createFileRoute } from "@tanstack/react-router";
import { AthleteResetPasswordPage } from "@/pages/athlete/AthleteResetPasswordPage";

export const Route = createFileRoute("/athlete/reset-password")({
  head: () => ({ meta: [{ title: "Nova Senha — BJJLF" }] }),
  component: AthleteResetPasswordPage,
});
