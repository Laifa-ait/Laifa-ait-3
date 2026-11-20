import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Compass,
  FileText,
  MessageSquare,
  LayoutDashboard,
  Wrench,
  ShieldCheck,
  Store,
  Building2,
  Car,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ArtisanProfile } from "../../types/artisan";
import { DrawerHeader } from "./drawer/DrawerHeader";
import { DrawerFooter } from "./drawer/DrawerFooter";

interface ArtisanSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  artisanProfile: ArtisanProfile | null;
  loadingProfile: boolean;
}

export const ArtisanSideDrawer: React.FC<ArtisanSideDrawerProps> = ({
  isOpen,
  onClose,
  artisanProfile,
  loadingProfile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, currentUser, logout } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const goTo = (path: string) => {
    onClose();
    navigate(path);
  };

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate("/artisans");
  };

  const mainLinks = [
    {
      label: "Offres de travaux",
      path: "/artisans",
      icon: Compass,
      active: location.pathname === "/artisans" || location.pathname.startsWith("/artisans/offres"),
    },
    {
      label: "Mes demandes de devis",
      path: currentUser ? "/artisans/mes-demandes" : "/auth?redirect=/artisans/mes-demandes",
      icon: FileText,
      active: location.pathname === "/artisans/mes-demandes",
    },
    {
      label: "Messagerie",
      path: currentUser ? "/artisans/messages" : "/auth?redirect=/artisans/messages",
      icon: MessageSquare,
      active: location.pathname.startsWith("/artisans/messages"),
    },
  ];

  const ecosystemLinks = [
    { label: "Marketplace", path: "/", icon: Store },
    { label: "Olma Immo", path: "/immo", icon: Building2 },
    { label: "Olma Auto", path: "/auto", icon: Car },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] z-50"
          />

          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            className="fixed left-0 top-0 bottom-0 w-[300px] sm:w-[320px] bg-white z-50 shadow-xl flex flex-col border-r border-slate-200 overflow-hidden"
          >
            <DrawerHeader onClose={onClose} artisanProfile={artisanProfile} />

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
              {/* Section 1: Navigation Demandeur */}
              <div className="space-y-1">
                <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Navigation
                </p>
                {mainLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => goTo(item.path)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        item.active
                          ? "bg-blue-50 text-[#1E3A8A]"
                          : "text-slate-700 hover:bg-slate-100 hover:text-[#0F172A]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Section 2: Espace Artisan Indépendant */}
              <div className="space-y-2 border-t border-slate-100 pt-5">
                <p className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Espace Artisan
                </p>

                {loadingProfile ? (
                  <div className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                ) : artisanProfile ? (
                  <button
                    type="button"
                    onClick={() => goTo("/artisans/dashboard")}
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <LayoutDashboard className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F172A] truncate">
                          Tableau de bord Artisan
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {artisanProfile.status === "approved"
                            ? "Gérer mes offres et devis"
                            : "Profil en vérification"}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      goTo(
                        currentUser
                          ? "/artisans/devenir-artisan"
                          : "/auth?redirect=/artisans/devenir-artisan"
                      )
                    }
                    className="w-full p-3 rounded-xl bg-slate-50 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Wrench className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F172A]">
                          Ouvrir un Espace Artisan
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Gratuit · Particuliers sans entreprise
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </button>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => goTo("/dashboard/admin/artisans")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-[#0F172A] transition-colors cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#1E3A8A] shrink-0" />
                    <span>Console Admin Artisans</span>
                  </button>
                )}
              </div>

              {/* Section 3: Autres univers Olmart */}
              <div className="space-y-1 border-t border-slate-100 pt-5">
                <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Univers Olmart
                </p>
                {ecosystemLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => goTo(item.path)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-[#0F172A] transition-colors cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <DrawerFooter onLogout={handleLogout} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
