import React, { useState, useEffect } from "react";
import { Menu, ShoppingBag, Store, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useShop } from "../context/ShopContext";
import { useUI } from "../context/UIContext";
import { AdvancedSearchbar as Searchbar } from "./Search/AdvancedSearchbar";
import { SuperAppSwitcherModal } from "./common/SuperAppSwitcherModal";
import { NavbarTopUtilityBar } from "./Layout/NavbarTopUtilityBar";
import { NavbarDesktopActions } from "./Layout/NavbarDesktopActions";

export interface OlmaLogoProps {
  className?: string;
}

export const OlmaLogo: React.FC<OlmaLogoProps> = ({ className = "w-8 h-8" }) => (
  <svg
    viewBox="92 70 154 175"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    role="img"
    aria-label="Olmart Emblem"
  >
    <g fill="none" stroke="currentColor" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M241 113 L170 74 L98 116 L98 198 L170 239 L241 199" strokeWidth="5.2" />
      <path d="M237 116 L170 80 L104 119 L104 195 L170 233 L237 196" strokeWidth="2.2" />
      <path d="M126 136 L135 123 L198 123 L207 136" strokeWidth="2.8" />
      <path
        d="M126 136 L207 136 L207 140 C207 147 201 152 195 152 C189 152 184 147 184 141 C184 148 179 153 172 153 C165 153 160 148 160 141 C160 148 155 153 148 153 C141 153 136 148 136 141 C136 148 132 152 126 152 C120 152 125 143 126 136 Z"
        strokeWidth="2.8"
      />
      <path d="M132 153 L132 196 L202 196 L202 153" strokeWidth="2.8" />
      <path d="M143 196 L143 162 L161 162 L161 196" strokeWidth="2.8" />
      <circle cx="155" cy="180" r="1.7" fill="#E99856" stroke="none" />
      <rect x="171" y="162" width="21" height="21" strokeWidth="2.8" />
    </g>
  </svg>
);

export const Navbar: React.FC = () => {
  const { cart } = useCart();
  const { setSearchQuery, setActiveCategory, setIsSaleFilterActive, setActiveTag } = useShop();
  const { setIsCartOpen, setIsMobileMenuOpen } = useUI();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const isCategoriesPage = location.pathname === "/categories";
  const isProductPage = location.pathname.startsWith("/product/");

  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartCount = React.useMemo(
    () => cart.reduce((acc, i) => acc + i.quantity, 0),
    [cart]
  );

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = () => {
    navigate("/");
    setSearchQuery("");
    setActiveCategory("Tous");
    setIsSaleFilterActive(false);
    setActiveTag(null);
  };

  return (
    <>
      <NavbarTopUtilityBar onOpenSwitcher={() => setIsSwitcherOpen(true)} />

      <nav
        className={`${
          isProductPage
            ? "sticky top-0 left-0 right-0 z-40 bg-white/94 text-[#1A1836] backdrop-blur-xl border-b border-[#EFE6E6] shadow-xs"
            : `sticky top-0 z-[100] bg-white/94 text-[#1A1836] backdrop-blur-xl border-b border-[#EFE6E6] transition-shadow duration-200 ${
                isScrolled
                  ? "shadow-[0_8px_28px_rgba(26,24,54,0.08)]"
                  : "shadow-2xs"
              }`
        } py-2 sm:py-2.5`}
      >
        {/* On mobile for Product Details: Dedicated sticky search bar with back button */}
        {isProductPage && (
          <div className="flex lg:hidden items-center justify-between w-full gap-2.5 h-11 px-3 pointer-events-auto">
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 2) {
                  navigate(-1);
                } else {
                  navigate("/shop");
                }
              }}
              className="w-9 h-9 rounded-full bg-[#FAF7F6] hover:bg-[#F4EDED] text-[#1A1836] flex items-center justify-center shrink-0 cursor-pointer border border-[#E0B4B2]/50 shadow-2xs transition-all active:scale-95"
              aria-label="Retour"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </button>

            <div className="flex-1 min-w-0">
              <Searchbar variant="transparent" />
            </div>
          </div>
        )}

        <div
          className={`${
            isProductPage ? "hidden lg:flex" : "flex"
          } flex-col lg:flex-row lg:items-center px-4 sm:px-6 md:px-8 mx-auto w-full max-w-[90rem] justify-between relative gap-2 sm:gap-3 lg:gap-0`}
        >
          <div className="flex items-center justify-between w-full lg:w-auto h-11 sm:h-12">
            {/* Brand Wordmark & Emblem */}
            <div className="flex shrink-0 items-center justify-start lg:w-1/4">
              <button
                type="button"
                onClick={handleLogoClick}
                className="flex items-center gap-2.5 shrink-0 select-none cursor-pointer group bg-transparent border-none p-0 whitespace-nowrap"
                aria-label="Accueil Olmart"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#42164B] via-[#622347] to-[#A54055] flex items-center justify-center shrink-0 border border-[#E0B4B2]/35 shadow-xs group-hover:scale-105 transition-transform duration-200">
                  <Store className="w-4.5 h-4.5 text-[#E99856]" />
                </div>
                <span className="text-2xl sm:text-3xl font-display font-bold tracking-wider text-[#1A1836]">
                  OLMART
                </span>
              </button>
            </div>

            {/* Actions for Mobile */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:hidden relative shrink-0">
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={t("Mon Panier") || "Mon Panier"}
                className="flex items-center justify-center text-[#1A1836] hover:text-[#622347] hover:bg-[#FAF7F6] transition-all duration-200 cursor-pointer relative bg-transparent border-none w-10 h-10 rounded-full active:scale-95"
              >
                <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#622347] to-[#A54055] text-white flex items-center justify-center text-[10px] font-black shadow-xs border border-white tabular-nums">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label={t("Menu") || "Menu"}
                className="flex items-center justify-center text-[#1A1836] hover:text-[#622347] hover:bg-[#FAF7F6] transition-all duration-200 cursor-pointer bg-transparent border-none w-10 h-10 rounded-full active:scale-95"
              >
                <Menu className="w-5 h-5 stroke-[1.8]" />
              </button>
            </div>
          </div>

          {!isCategoriesPage && (
            <div
              className={`flex-1 flex items-center justify-center w-full px-0 ${
                isProductPage ? "lg:px-12 max-w-2xl" : "lg:px-8 max-w-3xl"
              } order-last lg:order-none gap-2`}
            >
              <div className="w-full">
                <Searchbar variant={isProductPage ? "discreet" : "default"} />
              </div>
            </div>
          )}

          <NavbarDesktopActions cartCount={cartCount} />
        </div>
      </nav>

      {/* Super-App Switcher Modal */}
      <SuperAppSwitcherModal
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
      />
    </>
  );
};
