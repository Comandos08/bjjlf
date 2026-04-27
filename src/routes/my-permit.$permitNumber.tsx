import { createFileRoute } from "@tanstack/react-router";
import { MyPermitPage } from "@/pages/MyPermitPage";

export const Route = createFileRoute("/my-permit/$permitNumber")({
  head: ({ params }) => ({
    meta: [
      { title: `Alvará ${params.permitNumber} — BJJLF` },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyPermitRouteComponent,
});

function MyPermitRouteComponent() {
  const { permitNumber } = Route.useParams();
  return <MyPermitPage permitNumber={permitNumber} />;
}
