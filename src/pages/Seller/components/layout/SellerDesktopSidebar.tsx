import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Store, Home, Compass, ChevronDown, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerNavItem, getSellerNavGroups } from "./SellerNavConfig";
import { User } from "firebase/auth";

interface SellerDesktopSidebarProps {
  navItems: SellerNavItem[];
  currentUser: User | null;
  onStartTour?: () => void;
}

export const SellerDesktopSidebar: React.FC<SellerDesktopSidebarProps> = ({
  currentUser,
  onStartTour,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const groups = getSellerNavGroups(t);

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <aside
      className="w-72 bg-gradient-to-b from-[#1A1836] via-[#42164B] to-[#1A1836] text-white border-e border-[#A54055]/25 sticky top-0 h-screen hidden lg:flex flex-col shrink-0 shadow-xl"
      id="seller-desktop-sidebar"
    >
      <div className="p-6 border-b border-white/10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          title={t("Retour à l'accueil Olmart")}
          className="flex items-center gap-3.5 group cursor-pointer text-left border-none bg-transparent p-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A54055] to-[#E99856] flex items-center justify-center text-white shadow-md shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white leading-none">
              OLMA<span className="text-[#E99856]">RT</span>
            </h1>
            <p className="text-[10px] font-bold text-[#E0B4B2] uppercase tracking-widest mt-1 leading-none">
              {t("Espace Vendeur Pro")}
            </p>
          </div>
        </button>
      </div>

      {/* Quick Storefront CTA */}
      <div className="px-4 pt-4">
        <button
          type="button"
          id="seller-desktop-view-store-btn"
          onClick={() => (currentUser ? navigate(`/store/${currentUser.uid}`) : null)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold text-[#1A1836] bg-gradient-to-r from-[#E99856] to-[#f0aa6e] hover:brightness-105 transition-all cursor-pointer border-none shadow-sm"
        >
          <span className="flex items-center gap-2">
            <Store className="w-4 h-4" />
            <span>{t("Voir ma vitrine publique")}</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {groups.map((group) => {
          const isCollapsed = Boolean(collapsedGroups[group.groupId]);
          return (
            <div key={group.groupId} className="space-y-1">
              <button
                type="button"
                onClick={() => toggleGroup(group.groupId)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E0B4B2]/80 hover:text-white transition-colors bg-transparent border-none cursor-pointer"
              >
                <span>{group.groupTitle}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
                />
              </button>

              {!isCollapsed && (
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.to}
                      id={item.id}
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? "bg-gradient-to-r from-[#A54055] to-[#622347] text-white shadow-md border border-[#E99856]/30"
                            : "text-[#E0B4B2] hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 shrink-0 text-[#E99856]" />
                      <span className="truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-1.5 bg-[#1A1836]/60">
        {onStartTour && (
          <button
            type="button"
            id="seller-desktop-tour-btn"
            onClick={onStartTour}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#E0B4B2] hover:bg-white/10 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-start"
          >
            <Compass className="w-4 h-4 text-[#E99856]" />
            <span>{t("seller.tour.launch_btn", "Visite guidée")}</span>
          </button>
        )}

        <button
          type="button"
          id="seller-desktop-home-btn"
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#E0B4B2] hover:bg-white/10 hover:text-white transition-colors bg-transparent border-none cursor-pointer text-start"
        >
          <Home className="w-4 h-4 text-[#E99856]" />
          <span>{t("Retour à l'accueil Olmart")}</span>
        </button>
      </div>
    </aside>
  );
};
