import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  const linkClass = "font-sans text-sm text-gray-400 hover:text-white transition-base block py-1";
  const headingClass = "font-sans text-xs font-bold uppercase tracking-widest text-gray-500 mb-3";

  return (
    <footer className="bg-navbar" style={{ borderTop: "3px solid #C8211A", paddingTop: "48px", paddingBottom: "24px" }}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr,1fr,1fr,1fr,1.5fr]">
          {/* Col 1 — Logo + tagline + social */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Logo />
            <p className="font-sans text-sm text-gray-400 max-w-xs leading-[1.7]">{t("footer.tagline")}</p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Youtube, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-8 w-8 grid place-items-center border border-[#333] text-gray-400 hover:text-white hover:border-[#C8A84B] transition-base rounded"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Campeonatos */}
          <div>
            <h4 className={headingClass}>{t("footer.col.championships")}</h4>
            <ul>
              <li><Link to="/championships" className={linkClass}>{t("footer.col.upcoming")}</Link></li>
              <li><Link to="/championships" className={linkClass}>{t("footer.col.results")}</Link></li>
              <li><Link to="/championships" className={linkClass}>{t("footer.col.calendar")}</Link></li>
              <li><Link to="/rankings" className={linkClass}>{t("footer.col.rankings")}</Link></li>
            </ul>
          </div>

          {/* Col 3 — Cadastros */}
          <div>
            <h4 className={headingClass}>{t("footer.col.registrations")}</h4>
            <ul>
              <li><Link to="/academies" className={linkClass}>{t("academies.nav.affiliated")}</Link></li>
              <li><Link to="/register/academy" className={linkClass}>{t("footer.col.affiliateAcademy")}</Link></li>
              <li><Link to="/register/athlete" className={linkClass}>{t("footer.col.registerAthlete")}</Link></li>
              <li><Link to="/academy/permit" className={linkClass}>Solicitar Alvará</Link></li>
              <li><Link to="/black-belts" className={linkClass}>{t("footer.col.certifiedBlackBelts")}</Link></li>
              <li><Link to="/rules" className={linkClass}>{t("footer.col.rules")}</Link></li>
            </ul>
          </div>

          {/* Col 4 — Informações */}
          <div>
            <h4 className={headingClass}>{t("footer.col.info")}</h4>
            <ul>
              <li><Link to="/about" className={linkClass}>{t("footer.col.about")}</Link></li>
              <li><Link to="/news" className={linkClass}>{t("footer.col.news")}</Link></li>
              <li><a href="#" className={linkClass}>{t("footer.col.contact")}</a></li>
              <li><a href="#" className={linkClass}>{t("footer.col.privacy")}</a></li>
            </ul>
          </div>

          {/* Col 5 — Newsletter */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className={headingClass}>{t("footer.newsletter")}</h4>
            <p className="font-sans text-sm text-gray-400 mb-3">{t("footer.newsletter.desc")}</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder={t("footer.email.placeholder")}
                className="font-sans flex-1 h-9 px-3 bg-dark-2 border border-[#333] text-white text-sm focus:outline-none focus:border-[#C8A84B] transition-base rounded-l-md"
              />
              <button type="submit" className="font-heading uppercase tracking-widest font-bold text-xs h-9 px-4 bg-[#C8211A] text-white hover:bg-[#8B1612] transition-base rounded-r-md">
                {t("footer.subscribe")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 pt-5 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-gray-500">{t("footer.copyright")}</p>
          <div className="flex gap-5">
            <a href="#" className="font-sans text-xs text-gray-500 hover:text-white transition-base">{t("footer.privacy")}</a>
            <a href="#" className="font-sans text-xs text-gray-500 hover:text-white transition-base">{t("footer.terms")}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
