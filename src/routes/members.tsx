import { createFileRoute } from "@tanstack/react-router";
import { MembersPage } from "@/pages/MembersPage";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Membros — BJJLF" },
      { name: "description", content: "Registro oficial de atletas e diplomados da Brazilian Jiu-Jitsu Legends Federation." },
      { property: "og:title", content: "Membros — BJJLF" },
      { property: "og:description", content: "Registro oficial de atletas e diplomados da Brazilian Jiu-Jitsu Legends Federation." },
    ],
  }),
  component: MembersPage,
});
