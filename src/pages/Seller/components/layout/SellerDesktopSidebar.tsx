import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Store, Home, Compass } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerNavItem } from "./SellerNavConfig";
import { User } from "firebase/auth";

interface SellerDesktopSidebarProps {
  navItems: SellerNavItem[];
  currentUser: User | null;
  onStartTour?: () => void;
}

export const SellerDesktopSidebar: React.FC<SellerDesktopSidebarProps> = ({ navItems, currentUser, onStartTour }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <aside
      className="w-72 bg-white/90 backdrop-blur-xl border-e border-[#e8e1e9] sticky top-0 h-screen hidden lg:flex flex-col shrink-0"
      id="seller-desktop-sidebar"
    >
      <div className="p-8 border-b border-[#eee8ef]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#5b4865] flex items-center justify-center text-white shadow-[0_6px_14px_rgba(54,39,61,0.2)]">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-sans font-bold tracking-tight rtl:tracking-normal text-[#302638]">
              {t("OLMA")}
            </h1>
            <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal leading-none">
              {t("Seller Space")}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            id={item.id}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-black transition-all ${
                isActive
                  ? "bg-[#5b4865] text-white shadow-[0_8px_18px_rgba(54,39,61,0.16)]"
                  : "text-[#756b7b] hover:bg-[#f7f4f8] hover:text-[#302638]"
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
        <button
          type="button"
          id="seller-desktop-view-store-btn"
          onClick={() => (currentUser ? navigate(`/store/${currentUser.uid}`) : null)}
          className="w-full flex items-center gap-3 px-5 py-4 mt-2 rounded-2xl text-sm font-sans font-bold text-[#5b4865] bg-[#f1edf4] hover:bg-[#e9e1ec] transition-colors cursor-pointer border-none text-start"
        >
          <Store className="w-5 h-5" />
          {t("Voir ma vitrine")}
        </button>

        {onStartTour && (
          <button
            type="button"
            id="seller-desktop-tour-btn"
            onClick={onStartTour}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-sans font-bold text-[#5b4865] hover:bg-[#f7f4f8] transition-colors bg-transparent border-none cursor-pointer text-start focus:outline-none"
          >
            <Compass className="w-5 h-5 text-[#b38d45]" />
            {t("seller.tour.launch_btn", "Visite guidée")}
          </button>
        )}

        <button
          type="button"
          id="seller-desktop-home-btn"
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-sans font-bold text-[#756b7b] hover:bg-[#f7f4f8] hover:text-[#302638] transition-colors bg-transparent border-none cursor-pointer text-start focus:outline-none"
        >
          <Home className="w-5 h-5" />
          {t("Accueil Olma")}
        </button>
      </nav>

      <div className="p-6 border-t border-[#eee8ef]">
        <div className="bg-[#f8f5f9] rounded-2xl p-4">
          <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 text-center">
            {t("Support Vendeur")}
          </p>
          <button
            type="button"
            id="seller-desktop-open-ticket-btn"
            onClick={() => navigate("/dashboard/seller/support")}
            className="w-full bg-white text-[#493852] py-3 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal shadow-sm ring-1 ring-[#e8e1e9] hover:bg-[#f7f4f8] transition-colors cursor-pointer border-none"
          >
            {t("Ouvrir un Ticket")}
          </button>
        </div>
      </div>
    </aside>
  );
};
