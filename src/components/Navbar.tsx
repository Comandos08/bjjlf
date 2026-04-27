import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, ShoppingBag, User, ChevronDown, Globe, CreditCard, LogOut, UserCircle, Trophy, LogIn, Building2 } from "lucide-react";
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
        <nav className="hidden xl:flex items-center gap-1">
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
  const { user, profile, isActive, signOut } = useAthleteAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Not signed in → show login + join
  if (!user) {
    return (
      <>
        <Link
          to="/athlete/login"
          aria-label="Login"
          className="text-gray-400 hover:text-white transition-base flex items-center gap-1.5"
          style={{ fontFamily: "Barlow", fontWeight: 500 }}
        >
          <LogIn size={18} />
          <span className="text-xs uppercase tracking-widest hidden lg:inline">Entrar</span>
        </Link>
        <Link
          to="/athlete/signup"
          className="ml-2 h-9 px-4 bg-[#C8211A] hover:bg-[#8B1612] text-white text-xs uppercase tracking-widest transition-base rounded-md flex items-center"
          style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}
        >
          Cadastrar
        </Link>
      </>
    );
  }

  const initials = profile?.full_name
    ? profile.full_name.trim().split(/\s+/).map((p) => p[0]?.toUpperCase() ?? "").slice(0, 2).join("")
    : (user.email?.[0] ?? "A").toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-gray-300 hover:text-white transition-base"
        aria-label="Menu do atleta"
        aria-expanded={open}
      >
        {profile?.photo_url ? (
          <img src={profile.photo_url} alt="" className="w-8 h-8 rounded-full object-cover border border-[#C8A84B]" />
        ) : (
          <span
            className="w-8 h-8 rounded-full bg-[#C8211A]/10 text-[#C8A84B] grid place-items-center text-xs"
            style={{ fontFamily: "Barlow Condensed", fontWeight: 700, border: "1px solid #C8A84B" }}
          >
            {initials}
          </span>
        )}
        <ChevronDown size={14} className="hidden lg:inline" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[240px] py-1 z-50 bg-navbar"
          style={{ border: "1px solid #333", borderTop: "2px solid #C8211A" }}
        >
          <div className="px-4 py-3 border-b border-[#222]">
            <p className="text-sm text-white truncate" style={{ fontFamily: "Barlow Condensed", fontWeight: 700 }}>
              {profile?.full_name ?? "Atleta"}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate" style={{ fontFamily: "Barlow" }}>
              {user.email}
            </p>
            {!isActive && (
              <span className="inline-block mt-2 text-[9px] uppercase tracking-widest text-yellow-400 border border-yellow-500/40 px-2 py-0.5 rounded-full">
                {profile?.status === "pending" ? "Aguardando aprovação" : "Conta inativa"}
              </span>
            )}
          </div>

          <AthleteMenuItem
            icon={<CreditCard size={14} />}
            label="Minha Carteirinha"
            onClick={() => { setOpen(false); void navigate({ to: "/my-card" }); }}
          />
          <AthleteMenuItem
            icon={<UserCircle size={14} />}
            label="Meu Perfil"
            onClick={() => { setOpen(false); void navigate({ to: "/my-profile" }); }}
          />
          <AthleteMenuItem
            icon={<Trophy size={14} />}
            label="Minhas Competições"
            onClick={() => { setOpen(false); void navigate({ to: "/my-competitions" }); }}
          />
          <AthleteMenuItem
            icon={<Building2 size={14} />}
            label="Meus Alvarás"
            onClick={() => { setOpen(false); void navigate({ to: "/my-permits" }); }}
          />

          <div className="border-t border-[#222] my-1" />
          <AthleteMenuItem
            icon={<LogOut size={14} />}
            label="Sair"
            onClick={() => { setOpen(false); void signOut(); }}
          />
        </div>
      )}
    </div>
  );
}

function AthleteMenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-dark hover:text-white transition-base"
      style={{ fontFamily: "Barlow", fontWeight: 500 }}
    >
      <span className="text-gray-400">{icon}</span>
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
        <Link
          to="/athlete/signup"
          onClick={onNavigate}
          className="py-3 text-sm text-[#C8A84B] flex items-center gap-2"
          style={{ fontFamily: "Barlow", fontWeight: 600 }}
        >
          <User size={16} /> Cadastrar como atleta
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col border-t border-[#222] mt-2 pt-2">
      <p className="px-1 py-2 text-[10px] uppercase tracking-widest text-gray-500" style={{ fontFamily: "Barlow" }}>
        {profile?.full_name ?? user.email}
      </p>
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
        <Building2 size={16} /> Meus Alvarás
      </Link>
      <button
        onClick={() => { onNavigate(); void signOut(); }}
        className="py-2.5 text-sm text-gray-400 flex items-center gap-2 text-left"
        style={{ fontFamily: "Barlow", fontWeight: 500 }}
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
