import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Menu, X, ShoppingBag, ChevronDown, Globe, CreditCard, LogOut, UserCircle, Trophy, LogIn, Building2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { useI18n, type Lang } from "@/lib/i18n";
import { useAthleteAuth } from "@/lib/athlete-auth";

type NavItem = {
  key: string;
  to?:
    | "/"
    | "/news"
    | "/graduates"
    | "/about"
    | "/academies"
    | "/register/athlete"
    | "/register/academy"
    | "/championships"
    | "/events"
    | "/rankings"
    | "/black-belts"
    | "/athletes"
    | "/rules";
  children?: { label: string; to: NavItem["to"] }[];
  nowrap?: boolean;
};

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const NAV: NavItem[] = [
    { key: "championships", to: "/events" },
    { key: "blackbelts", nowrap: true, to: "/black-belts" },
    { key: "rankings", to: "/rankings" },
    {
      key: "academies",
      children: [
        { label: t("academies.nav.affiliated"), to: "/academies" },
        { label: t("home.cta.academyBtn"), to: "/register/academy" },
      ],
    },
    { key: "athletes", to: "/athletes" },
    { key: "rules", to: "/rules" },
    { key: "news", to: "/news" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navbar" style={{ borderBottom: "2px solid #C8211A" }}>
      <div className="max-w-[1280px] mx-auto flex h-16 items-center justify-between px-4 lg:px-6 gap-4">
        {/* LEFT — Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <Logo />
        </Link>

        {/* CENTER — Nav */}
        <nav className="hidden xl:flex items-center gap-3">
          {NAV.map((item) => {
            const label = t(`nav.${item.key}`);
            if (item.children) {
              const isOpen = openMenu === item.key;
              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.key)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    className={`flex items-center gap-1 px-3 py-2 text-sm tracking-wide text-gray-300 hover:text-white transition-base ${item.nowrap ? "whitespace-nowrap" : ""}`}
                    style={{ fontFamily: "Barlow", fontWeight: 500, ...(item.nowrap ? { whiteSpace: "nowrap" } : {}) }}
                  >
                    {label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {isOpen && (
                    <div
                      className="absolute left-0 top-full bg-navbar border border-[#333] min-w-[200px] py-1"
                      style={{ borderTop: "2px solid #C8211A" }}
                    >
                      {item.children.map((c) => (
                        <Link
                          key={c.label}
                          to={c.to ?? "/"}
                          className="block px-4 py-2.5 text-sm tracking-wide text-gray-300 hover:bg-dark hover:text-white transition-base"
                          style={{ fontFamily: "Barlow", fontWeight: 500 }}
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={item.key}
                to={item.to ?? "/"}
                className={`px-3 py-2 text-sm tracking-wide text-gray-300 hover:text-white transition-base border-b-2 border-transparent ${item.nowrap ? "whitespace-nowrap" : ""}`}
                style={{ fontFamily: "Barlow", fontWeight: 500, ...(item.nowrap ? { whiteSpace: "nowrap" } : {}) }}
                activeProps={{
                  className: `px-3 py-2 text-sm tracking-wide text-white border-b-2 border-[#C8A84B] ${item.nowrap ? "whitespace-nowrap" : ""}`,
                  style: { fontFamily: "Barlow", fontWeight: 600, ...(item.nowrap ? { whiteSpace: "nowrap" } : {}) },
                }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT — Lang + Shop + Athlete area + Join */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <LangToggle lang={lang} onChange={setLang} />
          <button aria-label="Shop" className="text-gray-400 hover:text-white transition-base">
            <ShoppingBag size={18} />
          </button>
          <AthleteMenu />
        </div>

        {/* Mobile toggle */}
        <button
          className="xl:hidden p-2 text-foreground"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="xl:hidden border-t border-[#222] bg-navbar">
          <nav className="container mx-auto flex flex-col px-4 py-3">
            {NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to ?? "/"}
                onClick={() => setOpen(false)}
                className="py-3 text-sm tracking-wide text-gray-300 whitespace-nowrap"
                style={{ fontFamily: "Barlow", fontWeight: 500 }}
                activeProps={{ className: "py-3 text-sm tracking-wide text-white whitespace-nowrap", style: { fontFamily: "Barlow", fontWeight: 600 } }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <MobileAthleteLinks onNavigate={() => setOpen(false)} />
            <div className="flex items-center gap-3 pt-3 border-t border-[#222] mt-2">
              <LangToggle lang={lang} onChange={setLang} />
              <button aria-label="Shop" className="text-gray-400 hover:text-white">
                <ShoppingBag size={18} />
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function AthleteMenu() {
  const { user, profile, isActive, isLoading, signOut } = useAthleteAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on route change (TanStack Router)
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Reset image-error when photo URL changes
  useEffect(() => {
    setImgError(false);
  }, [profile?.photo_url]);

  // Close on outside click + Escape
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Avoid flash: while session is being resolved, render an invisible 36px placeholder.
  if (isLoading) {
    return <div aria-hidden className="w-9 h-9" />;
  }

  // Treat non-active profiles (pending/suspended) as "not logged in" for avatar.
  const showAvatar = !!user && !!profile && isActive;

  if (!showAvatar) {
    return (
      <Link
        to="/athlete/login"
        aria-label="Entrar"
        className="text-gray-300 hover:text-white transition-base flex items-center gap-1.5"
        style={{ fontFamily: "Barlow", fontWeight: 500 }}
      >
        <LogIn size={18} />
        <span className="text-xs uppercase tracking-widest hidden lg:inline">Entrar</span>
      </Link>
    );
  }

  const firstInitial = (profile.full_name?.trim()[0] ?? user.email?.[0] ?? "A").toUpperCase();

  const beltLine = `Faixa ${profile.belt}${profile.degree > 0 ? ` • ${profile.degree} grau${profile.degree > 1 ? "s" : ""}` : ""}`;

  const hasPhoto = !!profile.photo_url && !imgError;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center transition-base focus:outline-none focus:ring-2 focus:ring-[#C8A84B]/50 rounded-full relative w-9 h-9"
        aria-label="Menu do atleta"
        aria-expanded={open}
      >
        {/* Initial fallback (always rendered, fades in/out) */}
        <span
          className="absolute inset-0 w-9 h-9 rounded-full grid place-items-center text-white transition-opacity duration-150"
          style={{
            background: "#C8211A",
            border: "2px solid #C8A84B",
            fontFamily: "Barlow",
            fontWeight: 700,
            fontSize: 16,
            opacity: hasPhoto ? 0 : 1,
          }}
        >
          {firstInitial}
        </span>
        {/* Photo (rendered when URL exists; fades in if loads, falls back on error) */}
        {profile.photo_url && !imgError && (
          <img
            src={profile.photo_url}
            alt=""
            onError={() => setImgError(true)}
            className="absolute inset-0 w-9 h-9 rounded-full object-cover transition-opacity duration-150"
            style={{ border: "2px solid #C8A84B", opacity: hasPhoto ? 1 : 0 }}
          />
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[260px] py-1 z-50 bg-white rounded-lg overflow-hidden"
          style={{ boxShadow: "0 10px 30px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)" }}
        >
          <div className="px-4 py-3 border-b border-gray-100">
            <p
              className="text-sm text-gray-900 truncate"
              style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
            >
              {profile.full_name}
            </p>
            <p
              className="text-[11px] mt-0.5 truncate"
              style={{ fontFamily: "Barlow", fontWeight: 600, color: "#C8A84B", letterSpacing: "0.04em" }}
            >
              {beltLine}
            </p>
          </div>

          <AthleteMenuItem
            icon={<CreditCard size={15} />}
            label="Minha Carteirinha"
            onClick={() => { setOpen(false); void navigate({ to: "/my-card" }); }}
          />
          <AthleteMenuItem
            icon={<UserCircle size={15} />}
            label="Meu Perfil"
            onClick={() => { setOpen(false); void navigate({ to: "/my-profile" }); }}
          />
          <AthleteMenuItem
            icon={<Trophy size={15} />}
            label="Minhas Competições"
            onClick={() => { setOpen(false); void navigate({ to: "/my-competitions" }); }}
          />
          <AthleteMenuItem
            icon={<Building2 size={15} />}
            label="Alvará da Academia"
            onClick={() => { setOpen(false); void navigate({ to: "/my-permits" }); }}
          />

          <div className="border-t border-gray-100 my-1" />
          <AthleteMenuItem
            icon={<LogOut size={15} />}
            label="Sair"
            onClick={() => { setOpen(false); void signOut(); }}
            danger
          />
        </div>
      )}
    </div>
  );
}

function AthleteMenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm transition-base ${
        danger
          ? "text-[#C8211A] hover:bg-red-50"
          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
      }`}
      style={{ fontFamily: "Barlow", fontWeight: 500 }}
    >
      <span className={danger ? "text-[#C8211A]" : "text-gray-500"}>{icon}</span>
      {label}
    </button>
  );
}

function MobileAthleteLinks({ onNavigate }: { onNavigate: () => void }) {
  const { user, profile, signOut } = useAthleteAuth();

  if (!user) {
    return (
      <div className="flex flex-col border-t border-[#222] mt-2 pt-2">
        <Link
          to="/athlete/login"
          onClick={onNavigate}
          className="py-3 text-sm text-gray-300 flex items-center gap-2"
          style={{ fontFamily: "Barlow", fontWeight: 500 }}
        >
          <LogIn size={16} /> Entrar
        </Link>
      </div>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("")
    : (user.email?.[0] ?? "A").toUpperCase();

  const beltLine = profile
    ? `Faixa ${profile.belt}${profile.degree > 0 ? ` • ${profile.degree} grau${profile.degree > 1 ? "s" : ""}` : ""}`
    : null;

  return (
    <div className="flex flex-col border-t border-[#222] mt-2 pt-3">
      <div className="flex items-center gap-3 px-1 py-2">
        {profile?.photo_url ? (
          <img
            src={profile.photo_url}
            alt=""
            className="w-9 h-9 rounded-full object-cover"
            style={{ border: "2px solid #C8A84B" }}
          />
        ) : (
          <span
            className="w-9 h-9 rounded-full grid place-items-center text-sm text-white"
            style={{
              background: "#C8211A",
              border: "2px solid #C8A84B",
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
            }}
          >
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm text-white truncate" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
            {profile?.full_name ?? user.email}
          </p>
          {beltLine && (
            <p
              className="text-[11px] truncate"
              style={{ fontFamily: "Barlow", fontWeight: 600, color: "#C8A84B", letterSpacing: "0.04em" }}
            >
              {beltLine}
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-[#222] my-1" />
      <Link to="/my-card" onClick={onNavigate} className="py-2.5 text-sm text-gray-300 flex items-center gap-2" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
        <CreditCard size={16} /> Minha Carteirinha
      </Link>
      <Link to="/my-profile" onClick={onNavigate} className="py-2.5 text-sm text-gray-300 flex items-center gap-2" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
        <UserCircle size={16} /> Meu Perfil
      </Link>
      <Link to="/my-competitions" onClick={onNavigate} className="py-2.5 text-sm text-gray-300 flex items-center gap-2" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
        <Trophy size={16} /> Minhas Competições
      </Link>
      <Link to="/my-permits" onClick={onNavigate} className="py-2.5 text-sm text-gray-300 flex items-center gap-2" style={{ fontFamily: "Barlow", fontWeight: 500 }}>
        <Building2 size={16} /> Alvará da Academia
      </Link>
      <div className="border-t border-[#222] my-1" />
      <button
        onClick={() => { onNavigate(); void signOut(); }}
        className="py-2.5 text-sm flex items-center gap-2 text-left"
        style={{ fontFamily: "Barlow", fontWeight: 600, color: "#C8211A" }}
      >
        <LogOut size={16} /> Sair
      </button>
    </div>
  );
}

function LangToggle({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const options: { code: Lang; flag: string; label: string }[] = [
    { code: "pt", flag: "🇧🇷", label: "Português" },
    { code: "en", flag: "🇺🇸", label: "English" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-base"
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe size={18} />
        <span className="text-[10px] font-bold" style={{ color: "#C8A84B" }}>
          {lang.toUpperCase()}
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[180px] py-1 z-50"
          style={{ background: "#1A1A1A", border: "1px solid #333", borderTop: "2px solid #C8211A", borderRadius: 0 }}
        >
          {options.map((o) => {
            const active = lang === o.code;
            return (
              <button
                key={o.code}
                onClick={() => { onChange(o.code); setOpen(false); }}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-[12px] hover:bg-dark transition-base"
                style={{ color: active ? "#C8A84B" : "#CCCCCC", fontWeight: active ? 700 : 500 }}
              >
                <span>{o.flag}</span>
                <span>{o.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
