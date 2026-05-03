import { createFileRoute } from "@tanstack/react-router";
import { DiplomaRequestPage } from "@/pages/DiplomaRequest";

export const Route = createFileRoute("/diploma-request")({
  head: () => ({
    meta: [
      { title: "Diploma Request — BJJLF" },
      {
        name: "description",
        content:
          "Request your official BJJLF Brazilian Jiu-Jitsu diploma. Complete the form and pay securely with PayPal.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DiplomaRequestPage,
});
