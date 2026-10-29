import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { OlmaLogo } from "./Navbar";
import {
  Store,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  ArrowDown,
} from "lucide-react";
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
    const fetchSettings = async () => {
      try {
        const data = await apiGet<{ supportEmail?: string }>("/api/v1/public/settings");
        if (!cancelled && data?.supportEmail) {
          setSupportEmail(data.supportEmail);
        }
      } catch (error) {
        if (!cancelled) {
          safeLogger.warn("Notice: could not load dynamic support email, using standard fallback", {
            err: error instanceof Error ? error.message : String(error),
          });
        }
      }
    };
    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isHome) {
    return null;
  }

  return (
    <footer
      id="olmart-main-footer"
      className={`relative overflow-hidden bg-gradient-to-b from-[#111022] via-[#0D0C1A] to-[#080711] text-white ${
        isHomepage ? "pb-24 sm:pb-10" : "pb-10"
      }`}
    >
      {/* Top Vibrant Sunset Accent Bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#E99856] via-[#A54055] to-[#42164B]" />

      {/* Subtle Dark Ambient Glows */}
      <div className="pointer-events-none absolute -top-28 -left-28 w-72 h-72 rounded-full bg-[#42164B]/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#1A1836]/60 blur-3xl" />

      {/* Main Navigation & Columns Grid */}
      <div className="relative z-10 w-full max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8 pt-8 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-8 items-start">
        {/* Column 1: Brand & Vendeur Callout (Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-gradient-to-br from-[#E99856] to-[#A54055] shadow-md shadow-black/50">
              <OlmaLogo className="w-7 h-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-display font-extrabold tracking-wider text-white flex items-center gap-1 drop-shadow-sm">
                {isArabic ? "أولمارت" : "OLMA"}
                {!isArabic && <span className="text-[#E99856]">RT</span>}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#E99856]">
                {t("footer_marketplace_subtitle") || "Premier Marketplace Algérien"}
              </span>
            </div>
          </div>

          <p className="text-xs text-[#E0B4B2] leading-relaxed max-w-sm font-medium">
            Plateforme algérienne de mise en relation directe entre acheteurs et vendeurs indépendants sur les 69 Wilayas. Chaque boutique gère ses produits, ses tarifs et ses expéditions.
          </p>

          {/* Social Icons */}
          <div className="flex items-center flex-wrap gap-2 pt-0.5">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.icon}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-8 h-8 rounded-xl bg-[#1A1836] hover:bg-gradient-to-br hover:from-[#E99856] hover:to-[#A54055] text-white border border-white/15 hover:border-[#E99856] flex items-center justify-center transition-all shadow-sm hover:scale-105"
              >
                <BrandIcon name={s.icon} size={s.size} />
              </a>
            ))}
          </div>

          {/* Seller Card Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#1A1836] via-[#15132B] to-[#1F142B] border border-[#E99856]/35 shadow-lg shadow-black/40 space-y-2">
            <div className="flex items-center gap-2 text-white font-extrabold text-xs uppercase tracking-wider">
              <Store className="w-4 h-4 text-[#E99856]" />
              <span>{t("footer_are_you_merchant") || "Vous êtes commerçant ?"}</span>
            </div>
            <p className="text-[11px] text-[#E0B4B2] leading-normal font-medium">
              Ouvrez votre boutique sur Olmart et connectez-vous directement avec des milliers d&apos;acheteurs en Algérie.
            </p>
            <button
              type="button"
              onClick={() => navigate("/seller-onboarding")}
              className="mt-1 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E99856] to-[#A54055] hover:from-[#f3a668] hover:to-[#b84960] text-white rounded-xl text-xs font-black transition-all shadow-md active:scale-95 cursor-pointer border-none"
            >
              <span>{t("footer_become_seller_btn") || "Ouvrir ma boutique"}</span>
              {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Column 2 & 3 Wrapper: Collapsible Accordions for Acheteurs & Aide Légal (Span 4) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Accordion 1: Acheteurs */}
          <div className="rounded-2xl bg-[#161429] border border-white/10 hover:border-[#E99856]/40 shadow-md overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsBuyersOpen((prev) => !prev)}
              aria-expanded={isBuyersOpen}
              className="w-full px-4 py-3.5 flex items-center justify-between gap-3 bg-transparent border-none cursor-pointer text-white hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#E99856]/15 border border-[#E99856]/40 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-[#E99856]" />
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  {t("footer_buyers_heading") || "Acheteurs"}
                </span>
              </div>
              <span
                className={`w-7 h-7 rounded-lg bg-gradient-to-br from-[#E99856] to-[#A54055] text-white flex items-center justify-center shadow-sm transition-transform duration-300 ${
                  isBuyersOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <ArrowDown className="w-4 h-4 stroke-[2.75]" />
              </span>
            </button>

            {isBuyersOpen && (
              <ul className="px-4 pb-4 pt-2 space-y-2.5 text-xs text-[#E0B4B2] font-semibold border-t border-white/10 bg-[#110F20]">
                {[
                  { path: "/shop", label: t("footer_all_products") || "Catalogue général" },
                  { path: "/shops", label: t("footer_shops_directory") || "Boutiques des vendeurs" },
                  { path: "/shipping-calculator", label: t("footer_shipping_calc_link") || "Simulateur de livraison" },
                  { path: "/buyer/orders", label: t("footer_my_orders") || "Suivre mes commandes" },
                ].map((item) => (
                  <li key={item.path}>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      className="hover:text-[#E99856] text-[#E0B4B2] transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-2 w-full py-0.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#E99856] shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Accordion 2: Aide & Légal */}
          <div className="rounded-2xl bg-[#161429] border border-white/10 hover:border-[#E99856]/40 shadow-md overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsLegalOpen((prev) => !prev)}
              aria-expanded={isLegalOpen}
              className="w-full px-4 py-3.5 flex items-center justify-between gap-3 bg-transparent border-none cursor-pointer text-white hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#E99856]/15 border border-[#E99856]/40 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#E99856]" />
                </span>
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                  {t("footer_help_legal_heading") || "Aide & Légal"}
                </span>
              </div>
              <span
                className={`w-7 h-7 rounded-lg bg-gradient-to-br from-[#E99856] to-[#A54055] text-white flex items-center justify-center shadow-sm transition-transform duration-300 ${
                  isLegalOpen ? "rotate-180" : "rotate-0"
                }`}
              >
                <ArrowDown className="w-4 h-4 stroke-[2.75]" />
              </span>
            </button>

            {isLegalOpen && (
              <ul className="px-4 pb-4 pt-2 space-y-2.5 text-xs text-[#E0B4B2] font-semibold border-t border-white/10 bg-[#110F20]">
                {[
                  { onClick: () => navigate("/support"), label: t("footer_support") || "Centre d'assistance" },
                  { onClick: () => navigate("/privacy-policy"), label: t("footer_privacy") || "Protection des données" },
                  { onClick: () => navigate("/terms-of-service"), label: t("footer_terms") || "Conditions d'utilisation" },
                  {
                    onClick: () => window.dispatchEvent(new CustomEvent("open-olma-updates")),
                    label: t("footer_updates_log") || "Nouveautés & Mises à jour",
                  },
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="hover:text-[#E99856] text-[#E0B4B2] transition-colors bg-transparent border-none p-0 cursor-pointer text-start flex items-center gap-2 w-full py-0.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5 text-[#E99856] shrink-0" />
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
