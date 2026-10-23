import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, Package, Palette } from "lucide-react";
import { useTranslation } from "react-i18next";

export const SellerMobileBottomNav: React.FC = () => {
  const { t } = useTranslation();

  const bottomItems = [
    { to: "/dashboard/seller", icon: LayoutDashboard, label: t("Vue", "Vue"), end: true },
    { to: "/dashboard/seller/studio", icon: Palette, label: t("Studio", "Studio") },
    { to: "/dashboard/seller/orders", icon: ShoppingBag, label: t("Commandes", "Commandes") },
    { to: "/dashboard/seller/catalog", icon: Package, label: t("Catalogue", "Catalogue") },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#e8e1e9] px-4 py-2 flex items-center justify-around lg:hidden shadow-[0_-6px_22px_rgba(35,25,40,0.07)]"
      id="seller-mobile-bottom-nav"
    >
      {bottomItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
              isActive ? "text-[#5b4865]" : "text-[#a094a7] hover:text-[#6b5874]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className={`p-1 rounded-lg ${isActive ? "bg-[#f1edf4]" : ""}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-sans font-bold">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  );
};
