import { createFileRoute, notFound } from "@tanstack/react-router";
import { GraduateProfile } from "@/pages/GraduateProfile";
import { GRADUATES } from "@/data/graduates";

export const Route = createFileRoute("/graduates/$graduateId")({
  loader: ({ params }) => {
    const grad = GRADUATES.find((g) => g.id === params.graduateId);
    if (!grad) throw notFound();
    return grad;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.name} — BJJLF Black Belt` : "Graduate" },
      { name: "description", content: loaderData ? `${loaderData.name}, ${loaderData.beltGrade} black belt under ${loaderData.professor} at ${loaderData.academy}.` : "Graduate profile" },
    ],
  }),
  component: GraduateProfile,
  notFoundComponent: () => (
    <div className="container mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl text-primary">Graduate not found</h1>
    </div>
  ),
});
