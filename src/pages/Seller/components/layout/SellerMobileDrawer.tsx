import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Store, X, Home, ChevronDown, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerNavItem, getSellerNavGroups } from "./SellerNavConfig";
import { User } from "firebase/auth";

interface SellerMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: SellerNavItem[];
  currentUser: User | null;
}

export const SellerMobileDrawer: React.FC<SellerMobileDrawerProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const groups = getSellerNavGroups(t);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1A1836]/60 backdrop-blur-xs z-50 lg:hidden"
            id="seller-mobile-drawer-backdrop"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 start-0 w-[86%] max-w-sm bg-gradient-to-b from-[#1A1836] via-[#42164B] to-[#1A1836] text-white z-50 lg:hidden flex flex-col shadow-2xl border-e border-[#A54055]/30"
            id="seller-mobile-drawer-panel"
          >
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
                className="flex items-center gap-3 text-left border-none bg-transparent p-0 cursor-pointer"
                title={t("Retour à l'accueil Olmart")}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A54055] to-[#E99856] flex items-center justify-center text-white shadow-md">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-black tracking-tight text-white leading-none">
                    OLMA<span className="text-[#E99856]">RT</span>
                  </h1>
                  <p className="text-[9px] font-bold text-[#E0B4B2] uppercase tracking-widest mt-1 leading-none">
                    {t("Espace Vendeur Pro")}
                  </p>
                </div>
              </button>
              <button
                type="button"
                id="seller-mobile-drawer-close-btn"
                onClick={onClose}
                className="w-9 h-9 rounded-xl text-[#E0B4B2] hover:text-white bg-white/10 flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 pt-4">
              <button
                type="button"
                id="seller-mobile-view-store-btn"
                onClick={() => {
                  onClose();
                  if (currentUser) navigate(`/store/${currentUser.uid}`);
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-extrabold text-[#1A1836] bg-gradient-to-r from-[#E99856] to-[#f0aa6e] transition-all cursor-pointer border-none shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  <span>{t("Voir ma vitrine publique")}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
              {groups.map((group) => {
                const isCollapsed = Boolean(collapsedGroups[group.groupId]);
                return (
                  <div key={group.groupId} className="space-y-1">
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.groupId)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E0B4B2]/80 hover:text-white bg-transparent border-none cursor-pointer"
                    >
                      <span>{group.groupTitle}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          isCollapsed ? "-rotate-90" : "rotate-0"
                        }`}
                      />
                    </button>

                    {!isCollapsed && (
                      <div className="space-y-1">
                        {group.items.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={onClose}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                                isActive
                                  ? "bg-gradient-to-r from-[#A54055] to-[#622347] text-white shadow-md border border-[#E99856]/30"
                                  : "text-[#E0B4B2] hover:bg-white/10 hover:text-white"
                              }`
                            }
                          >
                            <item.icon className="w-4.5 h-4.5 shrink-0 text-[#E99856]" />
                            <div className="min-w-0">
                              <span className="block truncate">{item.label}</span>
                              {item.subtitle && (
                                <span className="block text-[10px] font-normal text-[#E0B4B2]/75 truncate">
                                  {item.subtitle}
                                </span>
                              )}
                            </div>
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="p-4 border-t border-white/10 bg-[#1A1836]/80">
              <button
                type="button"
                id="seller-mobile-back-to-home-btn"
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#E99856]" />
                <span>{t("Retour à l'accueil Olmart")}</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
