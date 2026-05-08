/**
 * Admin layout route. All /admin/* routes (except /admin/setup and /admin/login)
 * render inside this. Guards: redirect to /admin/login if not signed in or not
 * an active admin.
 */
import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2, LayoutDashboard, Calendar, FileText, Trophy, Youtube, Award, Building2, Image as ImageIcon, Settings, LogOut, Users, ClipboardList, ShieldCheck } from "lucide-react";
import { useAdminAuth, canAccessSection, type AdminSection } from "@/lib/admin-auth";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "BJJLF Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: async ({ location }) => {
    // /admin/setup and /admin/login are public.
    if (location.pathname === "/admin/setup" || location.pathname === "/admin/login") return;
    // SSR/prerender has no session — skip; client guard will run.
    if (typeof window === "undefined") return;
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) throw redirect({ to: "/admin/login" });
    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("id, is_active, role")
      .eq("id", user.id)
      .maybeSingle();
    if (!adminRow || !adminRow.is_active || !adminRow.role) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

const NAV: { to: string; label: string; icon: typeof LayoutDashboard; section: AdminSection }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, section: "dashboard" },
  { to: "/admin/events", label: "Eventos", icon: Calendar, section: "events" },
  { to: "/admin/news", label: "Notícias", icon: FileText, section: "news" },
  { to: "/admin/rankings", label: "Rankings", icon: Trophy, section: "rankings" },
  { to: "/admin/youtube", label: "YouTube", icon: Youtube, section: "youtube" },
  { to: "/admin/black-belts", label: "Faixas Pretas", icon: Award, section: "black-belts" },
  // "Academias" removed — academies are now managed entirely through "Alvarás".
  { to: "/admin/athletes", label: "Membros", icon: Users, section: "academies" },
  { to: "/admin/registrations", label: "Inscrições", icon: ClipboardList, section: "academies" },
  { to: "/admin/permits", label: "Alvarás", icon: ShieldCheck, section: "academies" },
  { to: "/admin/hero", label: "Hero Slider", icon: ImageIcon, section: "hero" },
  { to: "/admin/settings", label: "Configurações", icon: Settings, section: "settings" },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { user, role, isLoading, fullName, signOut } = useAdminAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // /admin/setup and /admin/login have their own full-screen layouts.
  const isPublicAdminRoute = pathname === "/admin/setup" || pathname === "/admin/login";

  useEffect(() => {
    if (isPublicAdminRoute) return;
    if (isLoading) return;
    if (!user || !role) {
      void navigate({ to: "/admin/login" });
    }
  }, [isLoading, user, role, isPublicAdminRoute, navigate]);

  if (isPublicAdminRoute) {
    return (
      <>
        <Outlet />
        <Toaster position="top-right" richColors />
      </>
    );
  }

  if (isLoading || !user || !role) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: "#F8F8F8" }}>
        <Loader2 className="h-6 w-6 animate-spin text-[#1A1A1A]" />
      </div>
    );
  }

  const initials = (fullName ?? user.email ?? "AD")
    .split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "AD";

  // Find the title for the current section.
  const current = NAV.find((n) => n.to === pathname) ?? NAV[0];
  const breadcrumb = current.to === "/admin" ? "Home" : `Home > ${current.label}`;

  return (
    <div className="min-h-screen flex" style={{ background: "#F8F8F8" }}>
      {/* Sidebar */}
      <aside className="w-[240px] flex flex-col border-r" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
        <div className="px-5 py-5 border-b flex items-center gap-2.5" style={{ borderColor: "#E5E5E5" }}>
          <div className="h-9 w-9 rounded-full grid place-items-center" style={{ background: "#C8211A" }}>
            <span className="text-white font-bold text-sm" style={{ fontFamily: "Barlow Condensed" }}>B</span>
          </div>
          <div className="leading-none">
            <div className="text-[#C8211A] font-bold text-base" style={{ fontFamily: "Barlow Condensed" }}>BJJLF</div>
            <div className="text-[11px] mt-0.5" style={{ color: "#C8A84B", letterSpacing: "0.1em" }}>ADMIN</div>
          </div>
        </div>

        <nav className="flex-1 py-3">
          {NAV.filter((n) => canAccessSection(role, n.section)).map((n) => {
            const active = pathname === n.to;
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to as "/admin"}
                className={cn(
                  "flex items-center gap-3 px-5 py-2.5 text-sm transition-colors border-l-[3px]",
                  active
                    ? "text-[#C8211A] border-l-[#C8211A] font-semibold"
                    : "text-[#666666] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] border-l-transparent",
                )}
                style={active ? { background: "#FFF0EF" } : undefined}
              >
                <Icon size={18} />
                <span>{n.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4 flex items-center gap-3" style={{ borderColor: "#E5E5E5" }}>
          <div className="h-8 w-8 rounded-full grid place-items-center text-white text-xs font-bold" style={{ background: "#C8211A" }}>
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-[#1A1A1A] truncate font-medium">{user.email}</div>
            <div className="text-[10px] text-[#999999] uppercase tracking-wider">{role}</div>
          </div>
          <button
            onClick={() => void signOut()}
            className="text-[#666666] hover:text-[#1A1A1A] p-1.5"
            aria-label="Sair"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Right side */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-[60px] border-b flex items-center justify-between px-8" style={{ background: "#FFFFFF", borderColor: "#E5E5E5" }}>
          <h1 className="text-[#1A1A1A] text-[20px] font-bold uppercase" style={{ fontFamily: "Barlow Condensed" }}>
            {current.label}
          </h1>
          <div className="text-[13px] text-[#999999]">{breadcrumb}</div>
        </header>
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}
