import { createFileRoute } from "@tanstack/react-router";
import { EventRegistrationPage } from "@/pages/EventRegistrationPage";

export const Route = createFileRoute("/register/event/$eventId")({
  head: () => ({
    meta: [
      { title: "Inscrição em Campeonato — BJJLF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EventRegistrationPage,
});
