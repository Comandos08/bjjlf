import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Legacy alias: /championships → /events
 * Kept to avoid breaking external links. SSR-safe permanent redirect.
 */
export const Route = createFileRoute("/championships")({
  beforeLoad: () => {
    throw redirect({
      to: "/events",
      search: { badges: [], sort: "soonest", q: "", page: 1, perPage: 12 },
      replace: true,
    });
  },
});
