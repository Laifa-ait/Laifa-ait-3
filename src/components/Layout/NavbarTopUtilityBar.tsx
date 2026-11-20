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
    `px-3 py-1 rounded-lg text-xs font-semibold transition-colors duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
      active
        ? "bg-[#0D5C4B] text-white shadow-xs font-bold border border-[#1B7A63]"
        : "text-[#B8C8C4] hover:text-white hover:bg-white/10"
    }`;

  return (
    <div
      id="olmart-top-utility-bar"
      className="bg-[#0F1B1D] text-[#B8C8C4] text-xs font-medium px-4 sm:px-6 lg:px-12 py-2 gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide justify-between items-center relative hidden lg:flex border-b border-white/10"
    >
      <div className="flex items-center mx-auto w-full max-w-[90rem] justify-between relative z-10">
        {/* Universes Navigation Hub */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenSwitcher}
            className="px-3 py-1 rounded-lg text-xs font-bold transition-colors duration-200 flex items-center gap-1.5 bg-[#16292C] text-white border border-white/15 hover:bg-[#0D5C4B] hover:border-[#0D5C4B] cursor-pointer group shadow-xs mr-1 whitespace-nowrap shrink-0"
            title={t("nav.open_switcher", "Ouvrir le commutateur d'univers Olmart Super-App")}
          >
            <LayoutGrid className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform text-[#E59A42]" />
            <span>{t("nav.universes", "Univers")}</span>
          </button>

          <Link to="/shop" className={getPillClass(isActivePath("/shop", true))}>
            <ShoppingBag className="w-3.5 h-3.5 text-[#E59A42]" />
            <span>{t("nav.marketplace", "Marketplace")}</span>
          </Link>

          <Link to="/bricolage" className={getPillClass(isActivePath("/bricolage"))}>
            <Wrench className="w-3.5 h-3.5 text-[#9BB0AB]" />
            <span>{t("nav.bricolage", "Olma Bricolage")}</span>
            <span className="text-[10px] font-medium text-[#E59A42] ml-0.5">
              · {t("nav.artisans", "Artisans")}
            </span>
          </Link>

          <Link to="/auto" className={getPillClass(isActivePath("/auto"))}>
            <Car className="w-3.5 h-3.5 text-[#9BB0AB]" />
            <span>{t("nav.auto", "Olma Auto")}</span>
          </Link>

          <Link to="/immo" className={getPillClass(isActivePath("/immo"))}>
            <Building2 className="w-3.5 h-3.5 text-[#9BB0AB]" />
            <span>{t("nav.immo", "Olma Immo")}</span>
          </Link>

          <Link to="/shops" className={getPillClass(isActivePath("/shops"))}>
            <Store className="w-3.5 h-3.5 text-[#9BB0AB]" />
            <span>{t("nav.shops", "Boutiques")}</span>
          </Link>

          <Link to="/comparator" className={getPillClass(isActivePath("/comparator"))}>
            <Scale className="w-3.5 h-3.5 text-[#9BB0AB]" />
            <span>{t("nav.comparator", "Comparateur")}</span>
          </Link>
        </div>

        {/* Quick Tools & Seller CTA */}
        <div className="flex items-center gap-4 text-xs font-medium shrink-0">
          <Link
            to="/shipping-calculator"
            className="text-[#B8C8C4] hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Truck className="w-3.5 h-3.5 text-[#E59A42]" />
            <span>{t("shipping_calc", "Tarifs Livraison 69 Wilayas")}</span>
          </Link>

          <span className="text-white/25" aria-hidden="true">·</span>

          <Link
            to="/support"
            className="text-[#B8C8C4] hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <Headphones className="w-3.5 h-3.5 text-[#B8C8C4]" />
            <span>{t("support", "Aide & Support")}</span>
          </Link>

          <span className="text-white/25" aria-hidden="true">·</span>

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
            className="px-3.5 py-1 rounded-lg bg-[#E59A42] hover:bg-[#ECA856] text-[#0F1B1D] font-bold transition-colors duration-200 shadow-xs cursor-pointer border-none tracking-wide text-[11px] whitespace-nowrap shrink-0"
          >
            {t("sell_on_olma", "Vendre sur Olmart")}
          </button>
        </div>
      </div>
    </div>
  );
};
