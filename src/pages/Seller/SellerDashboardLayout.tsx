import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Store, Menu, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { getSellerNavItems } from "./components/layout/SellerNavConfig";
import { SellerDashboardAlerts } from "./components/layout/SellerDashboardAlerts";
import { SellerMobileBottomNav } from "./components/layout/SellerMobileBottomNav";
import { SellerMobileDrawer } from "./components/layout/SellerMobileDrawer";
import { SellerDesktopSidebar } from "./components/layout/SellerDesktopSidebar";
import { SellerOnboardingTour } from "./components/SellerOnboardingTour";
import { NotificationCenter } from "../../components/NotificationCenter";

export const SellerDashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [forceTour, setForceTour] = useState(false);

  const navItems = getSellerNavItems(t);
  const isStudio = location.pathname.includes("/store-builder") || location.pathname.includes("/studio");

  return (
    <div className="flex h-screen overflow-hidden bg-[#faf8fb] text-[#302638]" id="seller-dashboard-root">
      {/* Interactive Seller Tour */}
      <SellerOnboardingTour forceRun={forceTour} onTourEnd={() => setForceTour(false)} />

      {/* Mobile Top Header - Hidden in Studio to prevent stacked headers */}
      {!isStudio && (
        <div
          className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-[#e8e1e9] px-4 py-3 flex items-center justify-between"
          id="seller-mobile-header"
        >
          <button
            type="button"
            id="seller-mobile-header-home-btn"
            onClick={() => navigate("/")}
            title={t("Retour à l'accueil Olmart")}
            className="flex items-center gap-2.5 text-left border-none bg-transparent p-0 cursor-pointer group active:scale-95 transition-transform"
          >
            <div className="w-8 h-8 rounded-lg bg-[#5b4865] group-hover:bg-[#4a3a52] flex items-center justify-center text-white shadow-sm transition-colors">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-sans font-bold tracking-tight rtl:tracking-normal text-[#302638] group-hover:text-[#5b4865] leading-none transition-colors">
                {t("OLMA")}
              </h1>
              <p className="text-[8px] font-sans font-bold text-slate-400 uppercase tracking-widest rtl:tracking-normal mt-0.5">
                {t("Seller Space")}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="seller-mobile-header-home-direct-btn"
              onClick={() => navigate("/")}
              title={t("Accueil Olmart")}
              className="p-2 rounded-xl text-[#5b4865] bg-[#f1edf4] hover:bg-[#e9e1ec] transition-colors border-none cursor-pointer"
            >
              <Home className="w-4 h-4" />
            </button>
            {currentUser && (
              <button
                type="button"
                id="seller-mobile-header-store-btn"
                onClick={() => navigate(`/store/${currentUser.uid}`)}
                title={t("Ma Boutique Publique")}
                className="p-2 rounded-xl text-[#5b4865] bg-[#f1edf4] hover:bg-[#e9e1ec] transition-colors border-none cursor-pointer"
              >
                <Store className="w-4 h-4" />
              </button>
            )}
            <NotificationCenter />
            <button
              type="button"
              id="seller-mobile-menu-toggle-btn"
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-xl text-[#6b5874] hover:text-[#302638] hover:bg-[#f5f1f6] transition-colors border-none cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - REMOVED completely in Studio per user mandate */}
      {!isStudio && <SellerMobileBottomNav />}

      {/* Mobile Drawer Navigation */}
      <SellerMobileDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        navItems={navItems}
        currentUser={currentUser}
      />

      {/* Desktop Persistent Sidebar - Hidden automatically in Studio to maximize workspace */}
      {!isStudio && (
        <SellerDesktopSidebar navItems={navItems} currentUser={currentUser} onStartTour={() => setForceTour(true)} />
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 bg-[#faf8fb] ${isStudio ? "h-full overflow-hidden pt-0" : "overflow-y-auto pt-14 lg:pt-0"}`}
        id="seller-main-content"
      >
        {!isStudio && (
          <div className="hidden lg:flex items-center justify-end px-8 py-4 border-b border-[#e8e1e9] bg-white/90 backdrop-blur-xl sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <NotificationCenter />
            </div>
          </div>
        )}

        <div className={isStudio ? "h-full overflow-hidden" : "p-4 sm:p-8 lg:p-12 space-y-6"}>
          {!isStudio && <SellerDashboardAlerts userProfile={userProfile} />}
          <Outlet />
        </div>
      </main>
    </div>
  );
};
