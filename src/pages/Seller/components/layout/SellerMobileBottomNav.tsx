import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, Palette, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SellerMobileBottomNavProps {
  onOpenMenu?: () => void;
}

export const SellerMobileBottomNav: React.FC<SellerMobileBottomNavProps> = ({ onOpenMenu }) => {
  const { t } = useTranslation();

  const bottomItems = [
    { to: "/dashboard/seller", icon: LayoutDashboard, label: t("Pilotage"), end: true },
    { to: "/dashboard/seller/orders", icon: ShoppingBag, label: t("Commandes") },
    { to: "/dashboard/seller/catalog", icon: Package, label: t("Catalogue") },
    { to: "/dashboard/seller/studio", icon: Palette, label: t("Studio") },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#1A1836]/95 backdrop-blur-xl border-t border-[#A54055]/30 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-[0_-6px_22px_rgba(26,24,54,0.25)]"
      id="seller-mobile-bottom-nav"
    >
      {bottomItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-0.5 min-h-[48px] px-3 rounded-xl transition-all ${
              isActive ? "text-[#E99856]" : "text-[#E0B4B2]/80 hover:text-white"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? "bg-[#A54055]/30" : ""}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}

      {onOpenMenu && (
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-0.5 min-h-[48px] px-3 rounded-xl text-[#E0B4B2]/80 hover:text-white bg-transparent border-none cursor-pointer"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold">{t("Menu")}</span>
        </button>
      )}
    </div>
  );
};
