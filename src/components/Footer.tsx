import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  const linkClass = "text-[13px] text-[#999] hover:text-gold transition-base block py-1";
  const headingClass = "text-gold text-[12px] uppercase tracking-[0.1em] mb-3";
  const headingStyle = { fontFamily: "Barlow Condensed", fontWeight: 800 };

  return (
    <footer className="bg-navbar" style={{ borderTop: "3px solid #C41E3A", paddingTop: "48px", paddingBottom: "24px" }}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr,1fr,1fr,1fr,1.5fr]">
          {/* Col 1 — Logo + tagline + social */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Logo />
            <p className="text-[13px] text-[#999] max-w-xs" style={{ fontFamily: "DM Sans" }}>
              {t("footer.tagline")}
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-8 w-8 grid place-items-center border border-[#333] text-[#999] hover:text-gold hover:border-gold transition-base"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Rankings */}
          <div>
            <h4 className={headingClass} style={headingStyle}>{t("footer.rankings")}</h4>
            <ul>
              <li><Link to="/" className={linkClass}>{t("home.ranking.beltBlack")}</Link></li>
              <li><Link to="/" className={linkClass}>{t("home.ranking.beltBrown")}</Link></li>
              <li><Link to="/" className={linkClass}>Gi</Link></li>
              <li><Link to="/" className={linkClass}>No-Gi</Link></li>
            </ul>
          </div>

          {/* Col 3 — Cadastros */}
          <div>
            <h4 className={headingClass} style={headingStyle}>{t("footer.registrations")}</h4>
            <ul>
              <li><Link to="/register/athlete" className={linkClass}>{t("home.cta.athleteBtn")}</Link></li>
              <li><Link to="/register/academy" className={linkClass}>{t("home.cta.academyBtn")}</Link></li>
              <li><Link to="/graduates" className={linkClass}>{t("grad.title")}</Link></li>
            </ul>
          </div>

          {/* Col 4 — Info */}
          <div>
            <h4 className={headingClass} style={headingStyle}>{t("footer.info")}</h4>
            <ul>
              <li><Link to="/about" className={linkClass}>{t("nav.about")}</Link></li>
              <li><Link to="/news" className={linkClass}>{t("nav.news")}</Link></li>
              <li><a href="#" className={linkClass}>{t("nav.rules")}</a></li>
            </ul>
          </div>

          {/* Col 5 — Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className={headingClass} style={headingStyle}>{t("footer.newsletter")}</h4>
            <p className="text-[13px] text-[#999] mb-3" style={{ fontFamily: "DM Sans" }}>
              {t("footer.newsletter.desc")}
            </p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t("footer.email.placeholder")}
                className="flex-1 h-9 px-3 bg-dark-2 border border-[#333] text-white text-[13px] focus:outline-none focus:border-gold transition-base"
                style={{ fontFamily: "DM Sans" }}
              />
              <button
                type="submit"
                className="h-9 px-4 bg-primary text-white text-[11px] uppercase tracking-[0.08em] font-bold hover:bg-primary-dark transition-base"
              >
                {t("footer.subscribe")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[#555]" style={{ fontFamily: "DM Sans" }}>{t("footer.copyright")}</p>
          <div className="flex gap-5 text-[12px]">
            <a href="#" className="text-[#555] hover:text-gold transition-base">{t("footer.privacy")}</a>
            <a href="#" className="text-[#555] hover:text-gold transition-base">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
