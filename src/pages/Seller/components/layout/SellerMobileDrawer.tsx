import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Store, X, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SellerNavItem } from "./SellerNavConfig";
import { User } from "firebase/auth";

interface SellerMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: SellerNavItem[];
  currentUser: User | null;
}

export const SellerMobileDrawer: React.FC<SellerMobileDrawerProps> = ({ isOpen, onClose, navItems, currentUser }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 lg:hidden"
            id="seller-mobile-drawer-backdrop"
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-0 start-0 w-[85%] max-w-sm bg-[#fbf9fc] z-50 lg:hidden flex flex-col shadow-2xl border-e border-[#e8e1e9]"
            id="seller-mobile-drawer-panel"
          >
            <div className="p-6 border-b border-[#eee8ef] bg-white flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
                className="flex items-center gap-3 text-left border-none bg-transparent p-0 cursor-pointer group"
                title={t("Retour à l'accueil Olmart")}
              >
                <div className="w-10 h-10 rounded-xl bg-[#5b4865] group-hover:bg-[#4a3a52] flex items-center justify-center text-white shadow-[0_6px_14px_rgba(54,39,61,0.2)] transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-base font-sans font-bold tracking-tight rtl:tracking-normal text-[#302638]">
                    {t("OLMA")}
                  </h1>
                  <p className="text-[9px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal leading-none">
                    {t("Seller Space")}
                  </p>
                </div>
              </button>
              <button
                type="button"
                id="seller-mobile-drawer-close-btn"
                onClick={onClose}
                className="p-2 rounded-xl text-[#8a7d90] hover:text-[#302638] hover:bg-[#f7f4f8] transition-colors bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-black transition-all ${
                      isActive
                        ? "bg-[#5b4865] text-white shadow-[0_8px_18px_rgba(54,39,61,0.16)]"
                        : "text-[#756b7b] hover:bg-[#f7f4f8] hover:text-[#302638]"
                    }`
                  }
                >
                  <item.icon className="w-4.5 h-4.5" />
                  {item.label}
                </NavLink>
              ))}

              <button
                type="button"
                id="seller-mobile-view-store-btn"
                onClick={() => {
                  onClose();
                  if (currentUser) navigate(`/store/${currentUser.uid}`);
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 mt-2 rounded-xl text-xs font-sans font-bold text-[#5b4865] bg-[#f1edf4] hover:bg-[#e9e1ec] transition-colors cursor-pointer border-none text-start"
              >
                <Store className="w-4.5 h-4.5" />
                {t("Voir ma vitrine")}
              </button>

              <button
                type="button"
                id="seller-mobile-back-to-home-btn"
                onClick={() => {
                  onClose();
                  navigate("/");
                }}
                className="w-full flex items-center gap-3 px-4 py-3.5 mt-2 rounded-xl text-xs font-sans font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer text-start shadow-2xs"
              >
                <Home className="w-4.5 h-4.5 text-[#F97316]" />
                <span>{t("Retour à l'accueil Olmart")}</span>
              </button>
            </nav>

            <div className="p-6 border-t border-[#eee8ef]">
              <div className="bg-[#f8f5f9] rounded-2xl p-4">
                <p className="text-[10px] font-sans font-bold text-zinc-400 uppercase tracking-widest rtl:tracking-normal mb-2 text-center">
                  {t("Support Vendeur")}
                </p>
                <button
                  type="button"
                  id="seller-mobile-open-ticket-btn"
                  onClick={() => {
                    onClose();
                    navigate("/dashboard/seller/support");
                  }}
                  className="w-full bg-white text-[#493852] py-2.5 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest rtl:tracking-normal shadow-sm ring-1 ring-[#e8e1e9] hover:bg-[#f7f4f8] transition-colors border-none cursor-pointer"
                >
                  {t("Ouvrir un Ticket")}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
