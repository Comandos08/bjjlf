import { createFileRoute } from "@tanstack/react-router";
import { AthleteRegistration } from "@/pages/AthleteRegistration";

export const Route = createFileRoute("/register/athlete")({
  head: () => ({
    meta: [
      { title: "Register as Athlete — BJJLF" },
      { name: "description", content: "Become an official BJJLF-registered athlete. Complete your membership in 6 simple steps." },
      { property: "og:title", content: "Register as Athlete — BJJLF" },
      { property: "og:description", content: "Become an official BJJLF-registered athlete." },
    ],
  }),
  component: AthleteRegistration,
});
