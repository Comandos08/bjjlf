/**
 * /welcome — Aha-moment screen shown ONCE after an athlete is approved.
 * Marks `first_login_completed = true` on mount so it never shows again.
 */
import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, User, Calendar, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAthleteAuth } from "@/lib/athlete-auth";

export function WelcomePage() {
  const navigate = useNavigate();
  const { user, profile, isLoading, refresh } = useAthleteAuth();
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    // Not signed in or not active → bounce to login.
    if (!user || !profile || profile.status !== "active") {
      void navigate({ to: "/athlete/login" });
      return;
    }
    // Already saw welcome → skip to card.
    if (profile.first_login_completed) {
      void navigate({ to: "/my-card" });
      return;
    }
    // First time → mark as completed.
    setMarking(true);
    void (async () => {
      await supabase
        .from("athlete_profiles")
        .update({ first_login_completed: true })
        .eq("id", profile.id);
      await refresh();
      setMarking(false);
    })();
  }, [isLoading, user, profile, navigate, refresh]);

  if (isLoading || marking || !profile) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const firstName = profile.full_name.split(" ")[0];

  return (
    <div className="min-h-[70vh] bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="text-5xl mb-3">🐉</div>
          <h1
            className="text-3xl md:text-4xl text-gray-900 uppercase"
            style={{ fontFamily: "Bebas Neue", letterSpacing: "1px" }}
          >
            Bem-vindo à família BJJLF, {firstName}!
          </h1>
          <div className="h-1 w-12 bg-[#C8211A] mx-auto mt-3 rounded" />

          {/* Carteirinha */}
          <div
            className="mt-7 mx-auto max-w-sm rounded-xl text-left p-5"
            style={{
              background: "linear-gradient(135deg, #1A1A1A 0%, #2a2a2a 100%)",
              color: "#fff",
              border: "1px solid #C8A84B",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] uppercase tracking-[3px]"
                style={{ color: "#C8A84B", fontFamily: "Barlow", fontWeight: 600 }}
              >
                Carteirinha
              </span>
              <span className="text-[10px] uppercase" style={{ color: "#C8A84B" }}>
                BJJLF
              </span>
            </div>
            <div
              className="mt-2 text-2xl"
              style={{ fontFamily: "Bebas Neue", letterSpacing: "1.5px" }}
            >
              {profile.full_name}
            </div>
            <div className="mt-1 text-xs text-gray-300" style={{ fontFamily: "Barlow" }}>
              Faixa {profile.belt}
              {profile.degree > 0 ? ` · ${profile.degree}º grau` : ""}
            </div>
            <div
              className="mt-4 text-sm tracking-widest"
              style={{ fontFamily: "Barlow", fontWeight: 600 }}
            >
              {profile.registration_number ?? "—"}
            </div>
          </div>

          {/* Próximos passos */}
          <div className="mt-8 grid sm:grid-cols-3 gap-3 text-left">
            <NextStep
              icon={<User className="h-5 w-5 text-[#C8211A]" />}
              title="Complete seu perfil"
              to="/my-profile"
            />
            <NextStep
              icon={<Calendar className="h-5 w-5 text-[#C8211A]" />}
              title="Veja os próximos eventos"
              to="/events"
            />
            <NextStep
              icon={<CreditCard className="h-5 w-5 text-[#C8211A]" />}
              title="Mostre sua carteirinha"
              to="/my-card"
            />
          </div>

          <div className="mt-7">
            <Link
              to="/my-card"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C8211A] hover:bg-[#8B1612] text-white px-7 py-3 text-sm uppercase tracking-widest transition"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              <CreditCard className="h-4 w-4" />
              Ver minha carteirinha
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function NextStep({
  icon,
  title,
  to,
}: {
  icon: React.ReactNode;
  title: string;
  to: "/my-profile" | "/events" | "/my-card";
}) {
  return (
    <Link
      to={to}
      search={to === "/events" ? (((p: unknown) => p) as never) : undefined}
      className="block rounded-lg border border-gray-200 bg-gray-50 p-4 hover:border-[#C8211A] hover:bg-white transition"
    >
      <div className="flex items-center gap-2">
        {icon}
        <span
          className="text-xs uppercase tracking-wider text-gray-700"
          style={{ fontFamily: "Barlow", fontWeight: 600 }}
        >
          {title}
        </span>
      </div>
    </Link>
  );
}
