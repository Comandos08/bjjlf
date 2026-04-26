import { createFileRoute } from "@tanstack/react-router";
import { AcademyRegistration } from "@/pages/AcademyRegistration";

export const Route = createFileRoute("/register/academy")({
  head: () => ({
    meta: [
      { title: "Register Academy — BJJLF" },
      { name: "description", content: "Affiliate your academy with BJJLF. Complete your registration in 5 steps." },
      { property: "og:title", content: "Register Academy — BJJLF" },
      { property: "og:description", content: "Affiliate your academy with BJJLF." },
    ],
  }),
  component: AcademyRegistration,
});
