import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/pages/ContactPage";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Fale Conosco — BJJLF" },
      { name: "description", content: "Entre em contato com a Brazilian Jiu-Jitsu Legends Federation." },
    ],
  }),
  component: ContactPage,
});
