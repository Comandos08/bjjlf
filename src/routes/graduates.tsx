import { createFileRoute } from "@tanstack/react-router";
import { GraduatesPage } from "@/pages/GraduatesPage";

export const Route = createFileRoute("/graduates")({
  head: () => ({
    meta: [
      { title: "BJJLF Graduates — Certified Black Belt Registry" },
      { name: "description", content: "Browse the official BJJLF black belt registry. Search by name, country, academy, and graduation." },
      { property: "og:title", content: "BJJLF Black Belt Registry" },
      { property: "og:description", content: "Search the official BJJLF black belt registry." },
    ],
  }),
  component: GraduatesPage,
});
