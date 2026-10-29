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
  const activeNav = navItems.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF7F8] text-[#1A1836]" id="seller-dashboard-root">
      <SellerOnboardingTour forceRun={forceTour} onTourEnd={() => setForceTour(false)} />

      {/* Mobile Top Header */}
      {!isStudio && (
        <div
          className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-[#1A1836] via-[#42164B] to-[#622347] text-white border-b border-[#A54055]/30 px-4 h-15 flex items-center justify-between shadow-md"
          id="seller-mobile-header"
        >
          <button
            type="button"
            id="seller-mobile-header-home-btn"
            onClick={() => setIsMobileNavOpen(true)}
            title={t("Ouvrir le menu vendeur")}
            className="flex items-center gap-2.5 text-left border-none bg-transparent p-0 cursor-pointer group min-w-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A54055] to-[#E99856] flex items-center justify-center text-white shadow-xs shrink-0">
              <Store className="w-4.5 h-4.5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-black tracking-tight text-white truncate">
                {activeNav?.label || t("Espace Vendeur")}
              </h1>
              <p className="text-[9px] font-bold text-[#E0B4B2] uppercase tracking-wider truncate">
                {userProfile?.shopName || t("Boutique Partenaire Olmart")}
              </p>
            </div>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              id="seller-mobile-header-home-direct-btn"
              onClick={() => navigate("/")}
              title={t("Accueil Olmart")}
              className="w-9 h-9 rounded-xl text-[#E0B4B2] hover:text-white bg-white/10 flex items-center justify-center transition-colors border-none cursor-pointer"
            >
              <Home className="w-4 h-4" />
            </button>
            {currentUser && (
              <button
                type="button"
                id="seller-mobile-header-store-btn"
                onClick={() => navigate(`/store/${currentUser.uid}`)}
                title={t("Ma Boutique Publique")}
                className="w-9 h-9 rounded-xl text-[#E99856] bg-white/10 hover:bg-white/15 flex items-center justify-center transition-colors border-none cursor-pointer"
              >
                <Store className="w-4 h-4" />
              </button>
            )}
            <NotificationCenter />
            <button
              type="button"
              id="seller-mobile-menu-toggle-btn"
              onClick={() => setIsMobileNavOpen(true)}
              className="w-9 h-9 rounded-xl text-white bg-[#A54055] hover:bg-[#622347] flex items-center justify-center transition-colors border-none cursor-pointer"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {!isStudio && <SellerMobileBottomNav onOpenMenu={() => setIsMobileNavOpen(true)} />}

      {/* Mobile Drawer Navigation */}
      <SellerMobileDrawer
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        navItems={navItems}
        currentUser={currentUser}
      />

      {/* Desktop Persistent Sidebar */}
      {!isStudio && (
        <SellerDesktopSidebar
          navItems={navItems}
          currentUser={currentUser}
          onStartTour={() => setForceTour(true)}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`flex-1 bg-[#FAF7F8] ${
          isStudio ? "h-full overflow-hidden pt-0" : "overflow-y-auto pt-15 pb-24 lg:pt-0 lg:pb-10"
        }`}
        id="seller-main-content"
      >
        {!isStudio && (
          <div className="hidden lg:flex items-center justify-between px-8 h-16 border-b border-[#E0B4B2]/40 bg-white/95 backdrop-blur-xl sticky top-0 z-30">
            <div>
              <h2 className="text-base font-extrabold text-[#1A1836]">
                {activeNav?.label || t("Espace Vendeur Pro")}
              </h2>
              {activeNav?.subtitle && (
                <p className="text-xs text-[#622347]">{activeNav.subtitle}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <NotificationCenter />
            </div>
          </div>
        )}

        <div className={isStudio ? "h-full overflow-hidden" : "p-4 sm:p-6 lg:p-8 space-y-6"}>
          {!isStudio && <SellerDashboardAlerts userProfile={userProfile} />}
          <Outlet />
        </div>
      </main>
    </div>
  );
};
