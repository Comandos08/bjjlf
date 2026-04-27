import { createFileRoute } from "@tanstack/react-router";
import { ChampionshipsPage } from "@/pages/Championships";

export const Route = createFileRoute("/championships")({
  head: () => ({
    meta: [
      { title: "Campeonatos — BJJLF" },
      { name: "description", content: "Campeonatos BJJLF: calendário, inscrições e transmissões ao vivo. Em breve." },
      { property: "og:title", content: "Campeonatos — BJJLF" },
      { property: "og:description", content: "Campeonatos BJJLF: calendário, inscrições e transmissões ao vivo. Em breve." },
    ],
  }),
  component: ChampionshipsPage,
});
