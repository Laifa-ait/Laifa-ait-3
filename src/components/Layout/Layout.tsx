import React, { ReactNode, Suspense, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Navbar } from "../Navbar";
import { Footer } from "../Footer";
import { MobileBottomNav } from "../MobileBottomNav";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { apiPost } from "../../lib/api";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";

// Lazy-loaded drawers, modals, and specialized ecosystem navigation bars
const ArtisanMobileBottomNav = React.lazy(() =>
  import("../artisans/ArtisanMobileBottomNav").then((m) => ({ default: m.ArtisanMobileBottomNav }))
);
const OlmaAutoNavbar = React.lazy(() =>
  import("../Auto/OlmaAutoNavbar").then((m) => ({ default: m.OlmaAutoNavbar }))
);
const OlmaAutoBottomNav = React.lazy(() =>
  import("../Auto/OlmaAutoBottomNav").then((m) => ({ default: m.OlmaAutoBottomNav }))
);
const CartDrawer = React.lazy(() =>
  import("../Cart/CartDrawer").then((m) => ({ default: m.CartDrawer }))
);
const WishlistDrawer = React.lazy(() =>
  import("../Wishlist/WishlistDrawer").then((m) => ({ default: m.WishlistDrawer }))
);
const ComparatorDrawer = React.lazy(() =>
  import("../Comparator/ComparatorDrawer").then((m) => ({ default: m.ComparatorDrawer }))
);
const MobileMenu = React.lazy(() =>
  import("./MobileMenu").then((m) => ({ default: m.MobileMenu }))
);
const SearchOverlay = React.lazy(() =>
  import("../Search/SearchOverlay").then((m) => ({ default: m.SearchOverlay }))
);
const RecentlyViewedDrawer = React.lazy(() =>
  import("../RecentlyViewed/RecentlyViewedDrawer").then((m) => ({ default: m.RecentlyViewedDrawer }))
);
const VerificationModal = React.lazy(() =>
  import("../Auth/VerificationModal").then((m) => ({ default: m.VerificationModal }))
);
const AuthModal = React.lazy(() =>
  import("../Auth/AuthModal").then((m) => ({ default: m.AuthModal }))
);
const GoogleAccountMenu = React.lazy(() =>
  import("../Buyer/GoogleAccountMenu").then((m) => ({ default: m.GoogleAccountMenu }))
);

interface LayoutProps {
  children: ReactNode;
}

const BOTTOM_NAV_HIDDEN_ROUTES = [
  "/checkout",
  "/bricolage",
  "/artisans",
  "/services/bricolage",
  "/immo",
  "/olma-immo",
  "/store",
  "/boutique",
  "/shop/",
  "/auto",
  "/dashboard/seller/auto",
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const isOnline = useOnlineStatus();
  const { isCartOpen, setIsCartOpen, isWishlistOpen, setIsWishlistOpen, isAccountMenuOpen, setIsAccountMenuOpen } = useUI();
  const { currentUser } = useAuth();
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState<"email" | "sms">("email");
  const [areOverlaysHydrated, setAreOverlaysHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAreOverlaysHydrated(true), 350);
    return () => clearTimeout(timer);
  }, []);

  const openVerification = useCallback(async () => {
    if (!currentUser) return;
    try {
      const data = await apiPost<{ method?: "email" | "sms" }>("/api/v1/auth/2fa/send-code", {});
      setVerificationMethod(data?.method || "email");
      setIsVerificationModalOpen(true);
    } catch (e) {
      console.error("Failed to start verification", e);
    }
  }, [currentUser]);

  useEffect(() => {
    const handleOpen2FA = () => { openVerification(); };
    window.addEventListener("open-2fa-modal", handleOpen2FA);
    return () => window.removeEventListener("open-2fa-modal", handleOpen2FA);
  }, [openVerification]);

  const path = location.pathname;
  const isDashboard = path.startsWith("/dashboard/admin") || path.startsWith("/dashboard/seller");
  const isAuthPage = path === "/auth" || path === "/forgot-password" || path === "/verify-email" || path === "/onboarding";
  const isHomepage = path === "/";
  const isPremiumCollection = path.includes("/collection/");
  const isCheckoutPage = path === "/checkout";
  const isBricolagePage = path.startsWith("/bricolage") || path.startsWith("/artisans") || path.startsWith("/services/bricolage");
  const isImmoPage = path.startsWith("/immo") || path.startsWith("/olma-immo");
  const isShopStorePage = path.startsWith("/shop/") && path !== "/shop";
  const isStorePage = path.startsWith("/store") || path.startsWith("/boutique") || isShopStorePage;
  const isAutoPage = path.startsWith("/auto") || path.startsWith("/dashboard/seller/auto");
  const isSettingsPage = path.startsWith("/dashboard/buyer") || path.startsWith("/settings");
  const hideNavigation = isDashboard || isAuthPage || isSettingsPage;
  const showStandardChrome = !isPremiumCollection && !isCheckoutPage && !isBricolagePage && !isImmoPage && !isStorePage && !isAutoPage;
  const dir = i18n.language === "ar" ? "rtl" : "ltr";

  if (hideNavigation) {
    return (
      <div className={`min-h-screen w-full font-sans selection:bg-rose-200 text-zinc-900 ${dir}`} dir={dir}>
        {children}
        <Suspense fallback={null}>
          {areOverlaysHydrated && <AuthModal />}
          {isAccountMenuOpen && <GoogleAccountMenu isOpen={isAccountMenuOpen} onClose={() => setIsAccountMenuOpen(false)} />}
          {isVerificationModalOpen && (
            <VerificationModal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} method={verificationMethod} />
          )}
        </Suspense>
      </div>
    );
  }

  return (
    <div className={`min-h-screen overflow-x-clip w-full max-w-full text-zinc-900 font-sans selection:bg-rose-200 pb-0 sm:pb-0 ${dir}`} dir={dir}>
      {!isImmoPage && !isAutoPage && (
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[9999] bg-white text-zinc-900 px-4 py-2 font-medium rounded-lg shadow-lg border border-zinc-200 outline-none focus:ring-2 focus:ring-teal-500">
          Aller au contenu principal
        </a>
      )}

      {showStandardChrome && <Navbar />}
      {isAutoPage && <Suspense fallback={null}><OlmaAutoNavbar /></Suspense>}

      {isImmoPage || isStorePage || isAutoPage ? (
        <div id="main-content" className={`min-h-screen relative ${isAutoPage ? "pb-20 md:pb-0" : ""}`}>
          {children}
        </div>
      ) : (
        <main id="main-content" className={`min-h-[calc(100vh-200px)] relative ${isBricolagePage ? "pb-16 md:pb-0" : ""}`}>
          {children}
        </main>
      )}

      {isBricolagePage && <Suspense fallback={null}><ArtisanMobileBottomNav /></Suspense>}
      {isAutoPage && <Suspense fallback={null}><OlmaAutoBottomNav /></Suspense>}
      {showStandardChrome && <Footer isHomepage={isHomepage} />}
      {showStandardChrome && <MobileBottomNav hideOnRoutes={BOTTOM_NAV_HIDDEN_ROUTES} />}

      {!isOnline && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full z-50 flex items-center gap-2 shadow-lg">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Mode hors ligne</span>
        </div>
      )}

      <Suspense fallback={null}>
        {isCartOpen && <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}
        {isWishlistOpen && <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />}
        {isAccountMenuOpen && <GoogleAccountMenu isOpen={isAccountMenuOpen} onClose={() => setIsAccountMenuOpen(false)} />}
        {isVerificationModalOpen && (
          <VerificationModal isOpen={isVerificationModalOpen} onClose={() => setIsVerificationModalOpen(false)} method={verificationMethod} />
        )}
        {areOverlaysHydrated && (
          <>
            <SearchOverlay />
            <RecentlyViewedDrawer />
            <ComparatorDrawer />
            <MobileMenu />
            <AuthModal />
          </>
        )}
      </Suspense>
    </div>
  );
};
