import React from "react";
import {
  ShoppingBag,
  Wrench,
  Car,
  Building2,
  Store,
  Scale,
  Truck,
  Headphones,
  LayoutGrid,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";

interface NavbarTopUtilityBarProps {
  onOpenSwitcher: () => void;
}

export const NavbarTopUtilityBar: React.FC<NavbarTopUtilityBarProps> = ({
  onOpenSwitcher,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

  const isActivePath = (prefix: string, includeRoot = false) => {
    if (includeRoot && location.pathname === "/") return true;
    return location.pathname.startsWith(prefix);
  };

  const getPillClass = (active: boolean) =>
    `px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
      active
        ? "bg-gradient-to-r from-[#622347] to-[#A54055] text-white shadow-xs font-bold border border-[#E0B4B2]/25"
        : "text-[#E0B4B2]/85 hover:text-white hover:bg-[#42164B]/60"
    }`;

  return (
    <div
      id="olmart-top-utility-bar"
      className="bg-[#1A1836] text-[#E0B4B2] text-xs font-medium px-4 sm:px-6 lg:px-12 py-2 gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide justify-between items-center relative hidden lg:flex border-b border-[#42164B]/80"
    >
      <div className="flex items-center mx-auto w-full max-w-[90rem] justify-between relative z-10">
        {/* Universes Navigation Hub */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSwitcher}
            className="px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 bg-[#42164B]/70 text-white border border-[#622347] hover:bg-[#622347] hover:border-[#E0B4B2]/50 cursor-pointer group shadow-xs mr-1 whitespace-nowrap shrink-0"
            title={t("Ouvrir le commutateur d'univers Olmart Super-App", "Ouvrir le commutateur d'univers Olmart Super-App")}
          >
            <LayoutGrid className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform text-[#E99856]" />
            <span>{t("Univers", "Univers")}</span>
          </button>

          <Link to="/shop" className={getPillClass(isActivePath("/shop", true))}>
            <ShoppingBag className="w-3.5 h-3.5 text-[#E99856]" />
            <span>{t("Marketplace", "Marketplace")}</span>
          </Link>

          <Link to="/bricolage" className={getPillClass(isActivePath("/bricolage"))}>
            <Wrench className="w-3.5 h-3.5 text-[#E0B4B2]/80" />
            <span>{t("Olma Bricolage", "Olma Bricolage")}</span>
            <span className="text-[10px] font-medium text-[#E99856] ml-0.5">
              · {t("Artisans", "Artisans")}
            </span>
          </Link>

          <Link to="/auto" className={getPillClass(isActivePath("/auto"))}>
            <Car className="w-3.5 h-3.5 text-[#E0B4B2]/80" />
            <span>{t("Olma Auto", "Olma Auto")}</span>
          </Link>

          <Link to="/immo" className={getPillClass(isActivePath("/immo"))}>
            <Building2 className="w-3.5 h-3.5 text-[#E0B4B2]/80" />
            <span>{t("Olma Immo", "Olma Immo")}</span>
          </Link>

          <Link to="/shops" className={getPillClass(isActivePath("/shops"))}>
            <Store className="w-3.5 h-3.5 text-[#E0B4B2]/80" />
            <span>{t("Boutiques", "Boutiques")}</span>
          </Link>

          <Link to="/comparator" className={getPillClass(isActivePath("/comparator"))}>
            <Scale className="w-3.5 h-3.5 text-[#E0B4B2]/80" />
            <span>{t("Comparateur", "Comparateur")}</span>
          </Link>
        </div>

        {/* Quick Tools & Seller CTA */}
        <div className="flex items-center gap-4 text-xs font-medium shrink-0">
          <Link
            to="/shipping-calculator"
            className="text-[#E0B4B2]/90 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Truck className="w-3.5 h-3.5 text-[#E99856]" />
            <span>{t("shipping_calc") || "Tarifs Livraison 69 Wilayas"}</span>
          </Link>

          <span className="text-[#622347]" aria-hidden="true">·</span>

          <Link
            to="/support"
            className="text-[#E0B4B2]/90 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Headphones className="w-3.5 h-3.5 text-[#E0B4B2]" />
            <span>{t("support") || "Aide & Support"}</span>
          </Link>

          <span className="text-[#622347]" aria-hidden="true">·</span>

          <button
            type="button"
            onClick={() => {
              if (
                currentUser &&
                (userProfile?.role === "seller" ||
                  userProfile?.role === "admin" ||
                  userProfile?.role === "superadmin")
              ) {
                navigate("/dashboard/seller");
              } else if (currentUser) {
                navigate("/seller-onboarding");
              } else {
                navigate("/auth?role=seller");
              }
            }}
            className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#E99856] to-[#f0aa6e] hover:from-[#f2a668] hover:to-[#E99856] text-[#1A1836] font-extrabold transition-all duration-200 shadow-xs cursor-pointer border-none tracking-wide text-[11px] whitespace-nowrap shrink-0"
          >
            {t("sell_on_olma")}
          </button>
        </div>
      </div>
    </div>
  );
};
