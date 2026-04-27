import { Link } from "@tanstack/react-router";
import { Menu, X, ShoppingBag, User, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import { useI18n, type Lang } from "@/lib/i18n";

type NavItem = {
  key: string;
  to?: "/" | "/news" | "/graduates" | "/about" | "/register/athlete" | "/register/academy";
  children?: { label: string; to: NavItem["to"] }[];
  nowrap?: boolean;
};

export function Navbar() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const NAV: NavItem[] = [
    {
      key: "championships",
      children: [
        { label: t("home.events.title"), to: "/" },
        { label: t("nav.news"), to: "/news" },
      ],
    },
    {
      key: "blackbelts",
      nowrap: true,
      children: [
        { label: t("grad.title"), to: "/graduates" },
      ],
    },
    {
      key: "rankings",
      to: "/",
    },
    {
      key: "academies",
      children: [
        { label: t("home.cta.academyBtn"), to: "/register/academy" },
      ],
    },
    {
      key: "athletes",
      children: [
        { label: t("home.cta.athleteBtn"), to: "/register/athlete" },
        { label: t("grad.title"), to: "/graduates" },
      ],
    },
    {
      key: "rules",
      to: "/about",
    },
    {
      key: "news",
      to: "/news",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-navbar" style={{ borderBottom: "2px solid #C41E3A" }}>
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
                    className={`flex items-center gap-1 px-3 py-2 uppercase text-[12px] text-[#CCCCCC] hover:text-white transition-base ${item.nowrap ? "whitespace-nowrap" : ""}`}
                    style={{ fontFamily: "Barlow Condensed", fontWeight: 900, letterSpacing: "0.08em", ...(item.nowrap ? { whiteSpace: "nowrap" } : {}) }}
                  >
                    {label}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {isOpen && (
                    <div
                      className="absolute left-0 top-full bg-navbar border border-[#333] min-w-[200px] py-1"
                      style={{ borderTop: "2px solid #C41E3A" }}
                    >
                      {item.children.map((c) => (
                        <Link
                          key={c.label}
                          to={c.to ?? "/"}
                          className="block px-4 py-2.5 text-[12px] uppercase tracking-[0.06em] text-[#CCCCCC] hover:bg-dark hover:text-gold transition-base"
                          style={{ fontFamily: "Barlow Condensed", fontWeight: 600 }}
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
                className={`px-3 py-2 uppercase text-[12px] text-[#CCCCCC] hover:text-white transition-base ${item.nowrap ? "whitespace-nowrap" : ""}`}
                style={{ fontFamily: "Barlow Condensed", fontWeight: 900, letterSpacing: "0.08em", ...(item.nowrap ? { whiteSpace: "nowrap" } : {}) }}
                activeProps={{ style: { color: "#FFFFFF", borderBottom: "2px solid #B8960C", fontFamily: "Barlow Condensed", fontWeight: 900, letterSpacing: "0.08em" } }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT — Lang + Shop + Login + Join */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <LangToggle lang={lang} onChange={setLang} />
          <button
            aria-label="Shop"
            className="text-gray-400 hover:text-white transition-base"
          >
            <ShoppingBag size={18} />
          </button>
          <button
            aria-label="Login"
            className="text-gray-400 hover:text-white transition-base"
          >
            <User size={18} />
          </button>
          <button
            className="ml-2 h-9 px-4 bg-primary text-white text-[11px] uppercase tracking-[0.1em] font-bold hover:bg-primary-dark transition-base rounded-none"
            style={{ borderRadius: 0 }}
          >
            {t("nav.join")}
          </button>
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
                className="py-3 uppercase text-[12px] text-[#CCCCCC] whitespace-nowrap"
                style={{ fontFamily: "Barlow Condensed", fontWeight: 900, letterSpacing: "0.08em" }}
                activeProps={{ className: "py-3 uppercase text-[12px] text-gold whitespace-nowrap", style: { fontFamily: "Barlow Condensed", fontWeight: 900, letterSpacing: "0.08em" } }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-3 border-t border-[#222] mt-2">
              <LangToggle lang={lang} onChange={setLang} />
              <button aria-label="Shop" className="text-gray-400 hover:text-white">
                <ShoppingBag size={18} />
              </button>
              <button aria-label="Login" className="text-gray-400 hover:text-white">
                <User size={18} />
              </button>
              <button className="ml-auto h-9 px-4 bg-primary text-white text-[11px] uppercase tracking-[0.1em] font-bold rounded-none" style={{ borderRadius: 0 }}>
                {t("nav.join")}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
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
        <span
          className="text-[10px] font-bold"
          style={{ color: "#B8960C" }}
        >
          {lang.toUpperCase()}
        </span>
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 min-w-[180px] py-1 z-50"
          style={{
            background: "#1A1A1A",
            border: "1px solid #333",
            borderTop: "2px solid #C41E3A",
            borderRadius: 0,
          }}
        >
          {options.map((o) => {
            const active = lang === o.code;
            return (
              <button
                key={o.code}
                onClick={() => {
                  onChange(o.code);
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-[12px] hover:bg-dark transition-base"
                style={{
                  color: active ? "#B8960C" : "#CCCCCC",
                  fontWeight: active ? 700 : 500,
                }}
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
