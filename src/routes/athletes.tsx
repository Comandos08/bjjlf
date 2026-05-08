import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/athletes")({
  beforeLoad: () => {
    throw redirect({ to: "/members" });
  },
});
