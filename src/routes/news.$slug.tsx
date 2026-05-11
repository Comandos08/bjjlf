import { createFileRoute } from "@tanstack/react-router";
import { NewsDetailPage } from "@/pages/NewsDetailPage";

export const Route = createFileRoute("/news/$slug")({
  component: NewsDetailPage,
});
