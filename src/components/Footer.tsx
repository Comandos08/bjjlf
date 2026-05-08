import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";
import { Logo } from "./Logo";
import { useI18n } from "@/lib/i18n";

const WHATSAPP_NUMBER = "5521981750139"; // formato internacional E.164 sem '+'

export function Footer() {
  const { t } = useI18n();

  const linkClass = "font-sans text-sm text-gray-400 hover:text-white transition-base block py-1";
  const headingClass = "font-sans text-xs font-bold uppercase tracking-widest text-gray-500 mb-3";

  return (
    <footer className="bg-navbar" style={{ borderTop: "3px solid #C8211A", paddingTop: "48px", paddingBottom: "24px" }}>
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-3 lg:grid-cols-[2fr,1fr,1fr,1fr]">
          {/* Col 1 — Logo + tagline + social */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Logo />
            <p className="font-sans text-sm text-gray-400 max-w-xs leading-[1.7]">{t("footer.tagline")}</p>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/bjjlf.oficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="h-8 w-8 grid place-items-center border border-[#333] text-gray-400 hover:text-white hover:border-[#C8A84B] transition-base rounded"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="h-8 w-8 grid place-items-center border border-[#333] text-gray-400 hover:text-white hover:border-[#25D366] transition-base rounded"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Col 2 — Eventos */}
          <div>
            <h4 className={headingClass}>{t("footer.col.championships")}</h4>
            <ul>
              <li><Link to="/events" search={((prev: unknown) => prev) as never} className={linkClass}>{t("footer.col.upcoming")}</Link></li>
              <li><Link to="/events" search={((prev: unknown) => prev) as never} className={linkClass}>{t("footer.col.results")}</Link></li>
              <li><Link to="/events" search={((prev: unknown) => prev) as never} className={linkClass}>{t("footer.col.calendar")}</Link></li>
              <li><Link to="/rankings" className={linkClass}>{t("footer.col.rankings")}</Link></li>
            </ul>
          </div>

          {/* Col 3 — Cadastros */}
          <div>
            <h4 className={headingClass}>{t("footer.col.registrations")}</h4>
            <ul>
              <li><Link to="/academies" className={linkClass}>{t("academies.nav.affiliated")}</Link></li>
              <li><Link to="/academy/permit" className={linkClass}>{t("footer.col.affiliateAcademy")}</Link></li>
              <li><Link to="/register/athlete" className={linkClass}>{t("footer.col.registerAthlete")}</Link></li>
              <li><Link to="/members" className={linkClass}>{t("nav.members")}</Link></li>
              <li><Link to="/members" className={linkClass}>{t("footer.col.certifiedBlackBelts")}</Link></li>
              <li><Link to="/rules" className={linkClass}>{t("footer.col.rules")}</Link></li>
            </ul>
          </div>

          {/* Col 4 — Informações */}
          <div>
            <h4 className={headingClass}>{t("footer.col.info")}</h4>
            <ul>
              <li><Link to="/about" className={linkClass}>{t("footer.col.about")}</Link></li>
              <li><Link to="/news" className={linkClass}>{t("footer.col.news")}</Link></li>
              <li><Link to="/contact" className={linkClass}>{t("footer.col.contactUs")}</Link></li>
              <li><Link to="/privacy" className={linkClass}>{t("footer.col.privacy")}</Link></li>
              <li><Link to="/terms" className={linkClass}>{t("footer.terms")}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-10 pt-5 border-t border-[#2A2A2A] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-xs text-gray-500">
            {t("footer.copyright")} |{" "}
            {t("footer.developedBy")}{" "}
            <a
              href="https://sportcombat.pro"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-base"
            >
              SportCombat
            </a>
          </p>
          <div className="flex gap-5">
            <Link to="/privacy" className="font-sans text-xs text-gray-500 hover:text-white transition-base">{t("footer.privacy")}</Link>
            <Link to="/terms" className="font-sans text-xs text-gray-500 hover:text-white transition-base">{t("footer.terms")}</Link>
            <Link to="/contact" className="font-sans text-xs text-gray-500 hover:text-white transition-base">{t("footer.col.contact")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
