import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAthleteAuth } from "@/lib/athlete-auth";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/register/academy")({
  head: () => ({
    meta: [
      { title: "Cadastro de Academia — BJJLF" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: RegisterAcademyRedirect,
});

function RegisterAcademyRedirect() {
  const { t } = useI18n();
  const { user, isLoading } = useAthleteAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    if (user) {
      void navigate({ to: "/academy/permit", replace: true });
    } else {
      window.location.replace("/athlete/login?redirect=/academy/permit");
    }
  }, [isLoading, user, navigate]);

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50 px-6 text-center">
      <div className="max-w-md">
        <Loader2 className="h-6 w-6 animate-spin text-[#C8211A] mx-auto mb-4" />
        <p className="text-gray-700" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
          {t("registerAcademy.redirect.notice")}
        </p>
      </div>
    </div>
  );
}
