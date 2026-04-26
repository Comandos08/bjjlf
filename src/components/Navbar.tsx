import { Link } from "@tanstack/react-router";
import { Menu, X, Search, ShoppingBag, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useI18n, type Lang } from "@/lib/i18n";

type NavItem = {
  key: string;
  to?: "/" | "/news" | "/graduates" | "/about" | "/register/athlete" | "/register/academy";
  children?: { label: string; to: NavItem["to"] }[];
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
                    className="flex items-center gap-1 px-3 py-2 font-heading text-[12px] uppercase tracking-[0.1em] text-[#CCCCCC] hover:text-white transition-base"
                    style={{ fontWeight: 700 }}
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
                className="px-3 py-2 font-heading text-[12px] uppercase tracking-[0.1em] text-[#CCCCCC] hover:text-white transition-base"
                style={{ fontWeight: 700 }}
                activeProps={{ style: { color: "#FFFFFF", borderBottom: "2px solid #B8960C", fontWeight: 700 } }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT — Lang + Search + Shop + Login + Join */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <LangToggle lang={lang} onChange={setLang} />
          <button className="h-9 w-9 grid place-items-center text-[#CCCCCC] hover:text-gold transition-base" aria-label={t("nav.search")}>
            <Search className="h-4 w-4" />
          </button>
          <button className="hidden lg:inline-flex h-9 px-4 items-center gap-2 border border-[#444] text-[#CCCCCC] text-[11px] uppercase tracking-[0.1em] font-bold hover:border-gold hover:text-gold transition-base">
            <ShoppingBag className="h-3.5 w-3.5" />
            {t("nav.shop")}
          </button>
          <button className="hidden lg:inline-flex h-9 px-3 items-center gap-2 text-[#CCCCCC] text-[11px] uppercase tracking-[0.1em] font-bold hover:text-white transition-base">
            <User className="h-3.5 w-3.5" />
            {t("nav.login")}
          </button>
          <button className="h-9 px-4 bg-primary text-white text-[11px] uppercase tracking-[0.1em] font-bold hover:bg-primary-dark transition-base">
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
                className="py-3 font-heading uppercase tracking-[0.1em] text-[12px] text-[#CCCCCC]"
                style={{ fontWeight: 700 }}
                activeProps={{ className: "py-3 font-heading uppercase tracking-[0.1em] text-[12px] text-gold" }}
                activeOptions={{ exact: item.to === "/" }}
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-3 border-t border-[#222] mt-2">
              <LangToggle lang={lang} onChange={setLang} />
              <button className="flex-1 h-9 px-3 text-[#CCCCCC] text-[11px] uppercase tracking-[0.1em] font-bold border border-[#444]">
                {t("nav.login")}
              </button>
              <button className="flex-1 h-9 px-3 bg-primary text-white text-[11px] uppercase tracking-[0.1em] font-bold">
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
  return (
    <div className="inline-flex">
      {(["pt", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`h-7 w-9 text-[11px] font-bold tracking-[0.05em] transition-base ${
            lang === l
              ? "bg-gold text-[#0F0F0F]"
              : "border border-[#444] text-[#888] hover:text-white hover:border-[#666]"
          } ${l === "en" ? "ml-[-1px]" : ""}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
