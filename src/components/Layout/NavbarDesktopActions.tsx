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
          aria-label={t("nav.change_language", "Changer de langue")}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0F1B1D] hover:text-[#0D5C4B] hover:bg-[#F7F8F6] border border-[#E3E9E5] hover:border-[#C3D3CB] transition-colors duration-200 h-10 px-3.5 bg-white rounded-full cursor-pointer whitespace-nowrap shrink-0 shadow-2xs"
        >
          <Globe className="w-4 h-4 text-[#0D5C4B]" />
          <span className="uppercase">{lang ? lang.split("-")[0] : "fr"}</span>
        </button>
        {isLangDropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-50 cursor-default"
              onClick={() => setIsLangDropdownOpen(false)}
            />
            <div className="absolute top-full right-0 mt-2 bg-white border border-[#E3E9E5] shadow-xl z-[60] py-2 rounded-2xl min-w-[148px] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
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
                  className={`w-full text-left rtl:text-right px-4 py-2.5 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer flex items-center justify-between gap-2 hover:bg-[#F7F8F6] ${
                    lang === l.code
                      ? "text-[#0D5C4B] font-bold"
                      : "text-[#0F1B1D]/80"
                  }`}
                >
                  <span>{l.name}</span>
                  {lang === l.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D5C4B]" />
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
        aria-label={t("nav.my_wishlist", "Mes Favoris")}
        className="hidden lg:flex items-center justify-center text-[#0F1B1D] hover:text-[#C83E4D] hover:bg-[#F7F8F6] border border-[#E3E9E5] hover:border-[#C3D3CB] transition-colors duration-200 cursor-pointer relative bg-white w-10 h-10 rounded-full shadow-2xs"
      >
        <Heart className="w-5 h-5 stroke-[1.7] text-[#0F1B1D]" />
        {wishlist.length > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C83E4D] text-white flex items-center justify-center text-[10px] font-bold shadow-xs border border-white tabular-nums">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* Shopping Bag */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label={t("nav.my_cart", "Mon Panier")}
        className="flex items-center justify-center text-[#0F1B1D] hover:text-[#0D5C4B] hover:bg-[#F7F8F6] border border-[#E3E9E5] hover:border-[#C3D3CB] transition-colors duration-200 cursor-pointer relative bg-white w-10 h-10 rounded-full active:scale-95 shadow-2xs"
      >
        <ShoppingBag className="w-5 h-5 stroke-[1.8] text-[#0F1B1D]" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0D5C4B] text-white flex items-center justify-center text-[10px] font-black shadow-xs border border-white tabular-nums">
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
          aria-label={t("nav.user_account", "Compte utilisateur")}
          className={`flex items-center justify-center transition-all duration-200 cursor-pointer w-10 h-10 rounded-full border shadow-2xs ${
            currentUser
              ? "p-0.5 border-[#C3D3CB] hover:ring-2 hover:ring-[#0D5C4B]/25 hover:border-[#0D5C4B] bg-white"
              : "text-[#0F1B1D] hover:text-[#0D5C4B] hover:bg-[#F7F8F6] border-[#E3E9E5] hover:border-[#C3D3CB] bg-white"
          }`}
        >
          {currentUser ? (
            <UserAvatar
              photoURL={userProfile?.photoURL || currentUser.photoURL}
              displayName={userProfile?.displayName || currentUser.displayName}
              email={currentUser.email}
              providerData={currentUser.providerData}
              size="sm"
              alt={userProfile?.displayName || t("nav.profile_alt", "Profil")}
            />
          ) : (
            <UserIcon className="w-5 h-5 stroke-[1.7] text-[#0F1B1D]" />
          )}
        </button>
      </div>

      {/* Desktop Menu Drawer Button */}
      <button
        type="button"
        onClick={() => setIsMobileMenuOpen(true)}
        className="hidden lg:flex items-center justify-center text-[#0F1B1D] hover:text-[#0D5C4B] hover:bg-[#F7F8F6] border border-[#E3E9E5] hover:border-[#C3D3CB] transition-colors duration-200 cursor-pointer bg-white w-10 h-10 rounded-full shrink-0 shadow-2xs"
        title={t("nav.menu", "Menu")}
      >
        <Menu className="w-5 h-5 stroke-[1.7] text-[#0F1B1D]" />
      </button>
    </div>
  );
};
