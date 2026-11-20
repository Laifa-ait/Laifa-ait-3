import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { OlmaLogo } from "./Navbar";
import { Store, ShoppingBag, ChevronRight, ChevronLeft, ShieldCheck, ArrowDown } from "lucide-react";
import { BrandIcon } from "./ui/BrandIcon";
import { safeLogger } from "../utils/logger";
import { apiGet } from "../lib/api";
import { FooterBottomBar } from "./Layout/FooterBottomBar";
import { FooterNewsletterColumn } from "./Layout/FooterNewsletterColumn";

const SOCIAL_LINKS = [
  { href: "https://facebook.com/olmart.dz", label: "Facebook Olmart", icon: "facebook" as const, size: 16 },
  { href: "https://instagram.com/olmart.dz", label: "Instagram Olmart", icon: "instagram" as const, size: 16 },
  { href: "https://tiktok.com/@olmart.dz", label: "TikTok Olmart", icon: "tiktok" as const, size: 16 },
  { href: "https://youtube.com/@olmart", label: "YouTube Olmart", icon: "youtube" as const, size: 16 },
  { href: "https://linkedin.com/company/olmart", label: "LinkedIn Olmart", icon: "linkedin" as const, size: 16 },
  { href: "https://x.com/olmart_dz", label: "X (Twitter) Olmart", icon: "x" as const, size: 15 },
  { href: "https://wa.me/213550000000", label: "WhatsApp Support Olmart", icon: "whatsapp" as const, size: 16 },
];

export const Footer: React.FC<{ isHomepage?: boolean }> = ({ isHomepage = false }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = isHomepage || location.pathname === "/";
  const [supportEmail, setSupportEmail] = useState("contact@olmart.dz");
  const [isBuyersOpen, setIsBuyersOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const isArabic = i18n.language === "ar" || i18n.language?.startsWith("ar");

  useEffect(() => {
    let cancelled = false;
    apiGet<{ supportEmail?: string }>("/api/v1/public/settings")
      .then((data) => {
        if (!cancelled && data?.supportEmail) setSupportEmail(data.supportEmail);
      })
      .catch((error) => {
        if (!cancelled) {
          safeLogger.warn("Notice: could not load dynamic support email, using standard fallback", {
            err: error instanceof Error ? error.message : String(error),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isHome) return null;

  return (
    <footer
      id="olmart-main-footer"
      className={`relative overflow-hidden bg-gradient-to-b from-[#0C1719] via-[#091214] to-[#060C0D] text-white ${
        isHomepage ? "pb-24 sm:pb-10" : "pb-10"
      }`}
    >
      <div className="h-1 w-full bg-gradient-to-r from-[#0D5C4B] via-[#1B7A63] to-[#E59A42]" />
      <div className="pointer-events-none absolute -top-28 -left-28 w-72 h-72 rounded-full bg-[#0D5C4B]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#122629]/50 blur-3xl" />

      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pt-9 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-[#0D5C4B] to-[#084236] border border-[#1B7A63]/50 shadow-md shadow-black/40">
              <OlmaLogo className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-extrabold tracking-wider text-white flex items-center gap-1 drop-shadow-sm">
                {isArabic ? "أولمارت" : "OLMA"}
                {!isArabic && <span className="text-[#E59A42]">RT</span>}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E59A42]">
                {t("footer_marketplace_subtitle", "Premier Marketplace Algérien")}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#B8C8C4] leading-relaxed max-w-sm font-medium">
            {t("footer_brand_description", "Plateforme algérienne de mise en relation directe entre acheteurs et vendeurs indépendants sur les 69 Wilayas. Chaque boutique gère ses produits, ses tarifs et ses expéditions.")}
          </p>

          <div className="flex items-center flex-wrap gap-2 pt-0.5">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.icon}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-8 h-8 rounded-xl bg-[#122124] hover:bg-[#0D5C4B] text-white border border-white/12 hover:border-[#E59A42]/60 flex items-center justify-center transition-colors shadow-sm"
              >
                <BrandIcon name={s.icon} size={s.size} />
              </a>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#112023] border border-[#0D5C4B]/45 shadow-lg shadow-black/30 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4 text-[#E59A42]" />
              <span>{t("footer_are_you_merchant", "Vous êtes commerçant ?")}</span>
            </div>
            <p className="text-[11px] text-[#B8C8C4] leading-normal font-medium">
              {t("footer_merchant_desc", "Ouvrez votre boutique sur Olmart et connectez-vous directement avec des milliers d'acheteurs en Algérie.")}
            </p>
            <button
              type="button"
              onClick={() => navigate("/seller-onboarding")}
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-[#E59A42] hover:bg-[#ECA856] text-[#0F1B1D] rounded-xl text-xs font-bold transition-colors shadow-md active:scale-95 cursor-pointer border-none"
            >
              <span>{t("footer_become_seller_btn", "Ouvrir ma boutique")}</span>
              {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Column 2 & 3 Wrapper: Collapsible Accordions for Acheteurs & Aide Légal (Span 4) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Accordion 1: Acheteurs */}
          <div className="rounded-2xl bg-[#112023] border border-white/10 hover:border-[#0D5C4B]/60 shadow-md overflow-hidden transition-colors">
            <button
              type="button"
              onClick={() => setIsBuyersOpen((prev) => !prev)}
              aria-expanded={isBuyersOpen}
              className="w-full px-4 py-3.5 flex items-center justify-between gap-3 bg-transparent border-none cursor-pointer text-white hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#0D5C4B]/30 border border-[#0D5C4B]/60 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-[#E59A42]" />
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                  {t("footer_buyers_heading", "Acheteurs")}
                </span>
              </div>
              <span
                className={`w-7 h-7 rounded-lg bg-[#0D5C4B] text-white flex items-center justify-center shadow-sm transition-transform duration-300 ${
                  isBuyersOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </span>
            </button>

            {isBuyersOpen && (
              <ul className="px-4 pb-4 pt-2 space-y-2.5 text-xs text-[#B8C8C4] font-semibold border-t border-white/10 bg-[#0B1517]">
                {[
                  { path: "/shop", label: t("footer_all_products", "Catalogue général") },
                  { path: "/shops", label: t("footer_shops_directory", "Boutiques des vendeurs") },
                  { path: "/shipping-calculator", label: t("footer_shipping_calc_link", "Simulateur de livraison") },
                  { path: "/buyer/orders", label: t("footer_my_orders", "Suivre mes commandes") },
                ].map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="hover:text-[#E59A42] text-[#B8C8C4] transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-2 w-full py-0.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#E59A42] shrink-0 rtl:rotate-180" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Accordion 2: Aide & Légal */}
          <div className="rounded-2xl bg-[#112023] border border-white/10 hover:border-[#0D5C4B]/60 shadow-md overflow-hidden transition-colors">
            <button
              type="button"
              onClick={() => setIsLegalOpen((prev) => !prev)}
              aria-expanded={isLegalOpen}
              className="w-full px-4 py-3.5 flex items-center justify-between gap-3 bg-transparent border-none cursor-pointer text-white hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#0D5C4B]/30 border border-[#0D5C4B]/60 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#E59A42]" />
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
                  {t("footer_help_legal_heading", "Aide & Légal")}
                </span>
              </div>
              <span
                className={`w-7 h-7 rounded-lg bg-[#0D5C4B] text-white flex items-center justify-center shadow-sm transition-transform duration-300 ${
                  isLegalOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <ArrowDown className="w-4 h-4 stroke-[2.5]" />
              </span>
            </button>

            {isLegalOpen && (
              <ul className="px-4 pb-4 pt-2 space-y-2.5 text-xs text-[#B8C8C4] font-semibold border-t border-white/10 bg-[#0B1517]">
                {[
                  { onClick: () => navigate("/support"), label: t("footer_support", "Centre d'assistance") },
                  { onClick: () => navigate("/privacy-policy"), label: t("footer_privacy", "Protection des données") },
                  { onClick: () => navigate("/terms-of-service"), label: t("footer_terms", "Conditions d'utilisation") },
                  {
                    onClick: () => window.dispatchEvent(new CustomEvent("open-olma-updates")),
                    label: t("footer_updates_log", "Nouveautés & Mises à jour"),
                  },
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="hover:text-[#E59A42] text-[#B8C8C4] transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-2 w-full py-0.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#E59A42] shrink-0 rtl:rotate-180" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Column 4: Newsletter & Mobile App (Span 4) */}
        <FooterNewsletterColumn />
      </div>

      <FooterBottomBar supportEmail={supportEmail} />
    </footer>
  );
};
