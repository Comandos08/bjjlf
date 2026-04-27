import { createFileRoute } from "@tanstack/react-router";
import { AthleteForgotPasswordPage } from "@/pages/athlete/AthleteForgotPasswordPage";

export const Route = createFileRoute("/athlete/forgot-password")({
  head: () => ({ meta: [{ title: "Recuperar Senha — BJJLF" }] }),
  component: AthleteForgotPasswordPage,
});
