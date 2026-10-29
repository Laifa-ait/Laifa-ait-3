import React, { useState } from "react";
import {
  Menu,
  User as UserIcon,
  Heart,
  ShoppingBag,
  Globe,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useUI } from "../../context/UIContext";
import { Language } from "../../domains/home/homepage.types";
import { NotificationCenter } from "../NotificationCenter";
import { UserAvatar } from "../ui/UserAvatar";

interface NavbarDesktopActionsProps {
  cartCount: number;
}

export const NavbarDesktopActions: React.FC<NavbarDesktopActionsProps> = ({
  cartCount,
}) => {
  const { currentUser, userProfile } = useAuth();
  const { wishlist } = useCart();
  const {
    setIsCartOpen,
    setIsWishlistOpen,
    setIsMobileMenuOpen,
    setIsAccountMenuOpen,
  } = useUI();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const lang = i18n.language as Language;

  const setLang = (l: string) => {
    i18n.changeLanguage(l);
  };

  return (
    <div className="hidden lg:flex items-center justify-end gap-3 sm:gap-4 relative lg:w-1/4 shrink-0">
      <div className="hidden lg:block">
        <NotificationCenter />
      </div>

      {/* Desktop Language Selector */}
      <div className="hidden lg:block relative">
        <button
          type="button"
          onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsLangDropdownOpen(!isLangDropdownOpen);
            } else if (e.key === "Escape") {
              setIsLangDropdownOpen(false);
            }
          }}
          aria-expanded={isLangDropdownOpen}
          aria-haspopup="true"
          aria-label="Changer de langue"
          className="flex items-center gap-1.5 text-xs font-bold text-[#1A1836] hover:text-[#622347] hover:bg-[#FAF7F6] border border-[#EFE6E6] hover:border-[#E0B4B2] transition-all duration-200 h-10 px-3.5 bg-white rounded-full cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
        >
          <Globe className="w-4 h-4 text-[#622347]" />
          <span className="uppercase">{lang ? lang.split("-")[0] : "fr"}</span>
        </button>
        {isLangDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-50 cursor-default"
              onClick={() => setIsLangDropdownOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 bg-white border border-[#EFE6E6] shadow-xl z-[60] py-2 rounded-2xl min-w-[148px] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              {[
                { code: "fr", name: "Français" },
                { code: "ar", name: "العربية" },
                { code: "en", name: "English" },
              ].map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    setIsLangDropdownOpen(false);
                  }}
                  className={`w-full text-left rtl:text-right px-4 py-2.5 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer flex items-center justify-between gap-2 hover:bg-[#FAF7F6] ${
                    lang === l.code
                      ? "text-[#622347] font-bold"
                      : "text-[#1A1836]/80"
                  }`}
                >
                  <span>{l.name}</span>
                  {lang === l.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A54055]" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Wishlist */}
      <button
        type="button"
        onClick={() => setIsWishlistOpen(true)}
        aria-label={t("Mes Favoris") || "Mes Favoris"}
        className="hidden lg:flex items-center justify-center text-[#1A1836] hover:text-[#A54055] hover:bg-[#FAF7F6] border border-[#EFE6E6] hover:border-[#E0B4B2] transition-all duration-200 cursor-pointer relative bg-white w-10 h-10 rounded-full shadow-2xs"
      >
        <Heart className="w-5 h-5 stroke-[1.7] text-[#42164B]" />
        {wishlist.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#A54055] text-white flex items-center justify-center text-[10px] font-bold shadow-xs border border-white tabular-nums">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* Shopping Bag */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label={t("Mon Panier") || "Mon Panier"}
        className="flex items-center justify-center text-[#1A1836] hover:text-[#622347] hover:bg-[#FAF7F6] border border-[#EFE6E6] hover:border-[#E0B4B2] transition-all duration-200 cursor-pointer relative bg-white w-10 h-10 rounded-full active:scale-95 shadow-2xs"
      >
        <ShoppingBag className="w-5 h-5 stroke-[1.8] text-[#1A1836]" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-[#622347] to-[#A54055] text-white flex items-center justify-center text-[10px] font-black shadow-xs border border-white tabular-nums">
            {cartCount}
          </span>
        )}
      </button>

      {/* Profile / Account Toggle */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!currentUser) {
              navigate("/auth", { replace: true });
            } else {
              setIsAccountMenuOpen(true);
            }
          }}
          aria-haspopup="true"
          aria-label="Compte utilisateur"
          className={`flex items-center justify-center transition-all duration-200 cursor-pointer w-10 h-10 rounded-full border shadow-2xs ${
            currentUser
              ? "p-0.5 border-[#E0B4B2] hover:ring-2 hover:ring-[#622347]/25 hover:border-[#622347] bg-white"
              : "text-[#1A1836] hover:text-[#622347] hover:bg-[#FAF7F6] border-[#EFE6E6] hover:border-[#E0B4B2] bg-white"
          }`}
        >
          {currentUser ? (
            <UserAvatar
              photoURL={userProfile?.photoURL || currentUser.photoURL}
              displayName={userProfile?.displayName || currentUser.displayName}
              email={currentUser.email}
              providerData={currentUser.providerData}
              size="sm"
              alt={userProfile?.displayName || "Profil"}
            />
          ) : (
            <UserIcon className="w-5 h-5 stroke-[1.7] text-[#42164B]" />
          )}
        </button>
      </div>

      {/* Desktop Menu Drawer Button */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(true)}
        className="hidden lg:flex items-center justify-center text-[#1A1836] hover:text-[#622347] hover:bg-[#FAF7F6] border border-[#EFE6E6] hover:border-[#E0B4B2] transition-all duration-200 cursor-pointer bg-white w-10 h-10 rounded-full shrink-0 shadow-2xs"
        title={t("menu") || "Menu"}
      >
        <Menu className="w-5 h-5 stroke-[1.7] text-[#1A1836]" />
      </button>
    </div>
  );
};
