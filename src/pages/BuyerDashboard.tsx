import React, { useEffect, useState } from "react";
import { ArrowLeft, Store } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../lib/api";
import { UserAvatar } from "../components/ui/UserAvatar";
import { BUYER_ORDERS_PER_PAGE } from "../constants/ui";

// Core Modular Sub-Views
import { ProfileSettings } from "../components/Buyer/ProfileSettings";
import { AddressManager } from "../components/Buyer/AddressManager";
import { SecuritySettings } from "../components/Buyer/SecuritySettings";
import { CustomerPreferences } from "../components/Buyer/CustomerPreferences";
import { GeneralSettings } from "../components/Buyer/GeneralSettings";
import { OrdersSection, BuyerOrder } from "../components/Buyer/OrdersSection";
import { ReturnManagement } from "../components/Buyer/ReturnManagement";
import { MyReviews } from "../components/Buyer/MyReviews";
import { FollowedStores } from "../components/Buyer/FollowedStores";
import { UserDocumentsSection } from "../components/Buyer/UserDocumentsSection";
import { AboutSection } from "../components/Buyer/AboutSection";
import { BuyerSupport } from "./BuyerSupport";
import {
  BuyerNavigationMenu,
  SettingTab,
  useBuyerMenuGroups,
} from "../components/Buyer/BuyerNavigationMenu";
import { BuyerOverviewPanel } from "../components/Buyer/BuyerOverviewPanel";

export type { SettingTab };

const VALID_TABS: SettingTab[] = [
  "general",
  "profile",
  "addresses",
  "orders",
  "security",
  "preferences",
  "following",
  "reviews",
  "returns",
  "documents",
  "support",
  "about",
];

export const BuyerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser, userProfile } = useAuth();

  const [orders, setOrders] = useState<BuyerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const rawTab = searchParams.get("tab");
  const activeTab: SettingTab =
    rawTab && VALID_TABS.includes(rawTab as SettingTab) ? (rawTab as SettingTab) : "index";

  const setActiveTab = (tab: SettingTab) => {
    if (tab === "index") {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth", { replace: true });
      return;
    }

    let cancelled = false;
    const fetchInitialOrders = async () => {
      setLoadingOrders(true);
      try {
        const data = await apiGet<{ orders: BuyerOrder[]; lastVisible: string | null }>(
          `/api/v1/buyer/orders?limit=${BUYER_ORDERS_PER_PAGE}`
        );
        if (!cancelled && data?.orders) {
          setOrders(data.orders);
          setLastVisible(data.lastVisible);
        }
      } catch (err) {
        if (!cancelled) console.error("Error fetching buyer orders:", err);
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };

    fetchInitialOrders();
    return () => {
      cancelled = true;
    };
  }, [currentUser, navigate]);

  const loadMoreOrders = async () => {
    if (!currentUser || !lastVisible || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await apiGet<{ orders: BuyerOrder[]; lastVisible: string | null }>(
        `/api/v1/buyer/orders?limit=${BUYER_ORDERS_PER_PAGE}&startAfter=${lastVisible}`
      );
      if (data?.orders) {
        setOrders((prev) => [...prev, ...data.orders]);
        setLastVisible(data.lastVisible);
      }
    } catch (err) {
      console.error("Error loading more orders:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const addressesCount = userProfile?.shippingAddresses?.length || 0;
  const menuGroups = useBuyerMenuGroups(orders.length, addressesCount);
  const activeItem = menuGroups.flatMap((g) => g.items).find((item) => item.id === activeTab);

  return (
    <div id="buyer-dashboard-root" className="min-h-screen bg-[#FAF7F8] text-[#1A1836] pb-20">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 border-b border-[#E0B4B2]/40 bg-white/95 shadow-2xs backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (activeTab === "index") {
                  navigate("/");
                } else {
                  setActiveTab("index");
                }
              }}
              aria-label={activeTab === "index" ? t("Retour à l'accueil") : t("Retour au menu")}
              title={activeTab === "index" ? t("Retour à l'accueil") : t("Retour")}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-[#42164B] hover:bg-[#FAF7F8] transition-colors border border-[#E0B4B2]/40 bg-white cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-extrabold text-[#1A1836] tracking-tight truncate">
                {activeTab === "index"
                  ? t("Mon Espace Client")
                  : activeItem?.title || t("Mon Espace Client")}
              </h1>
              <p className="text-[11px] text-[#622347] hidden sm:block truncate">
                {activeTab === "index"
                  ? t("Gérez vos commandes, vos adresses 69 wilayas et vos préférences Olmart")
                  : activeItem?.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F8] hover:bg-[#E0B4B2]/25 text-[#42164B] font-bold text-xs border border-[#E0B4B2]/50 transition-colors cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-[#A54055]" />
              <span>{t("Boutique")}</span>
            </button>

            <UserAvatar
              photoURL={userProfile?.photoURL || currentUser?.photoURL}
              displayName={userProfile?.displayName || currentUser?.displayName}
              email={currentUser?.email}
              providerData={currentUser?.providerData}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Navigation Panel (Visible on Desktop OR on Mobile when activeTab === 'index') */}
          <div className={`lg:col-span-4 space-y-5 ${activeTab !== "index" ? "hidden lg:block" : "block"}`}>
            {/* Compact Mobile Summary Header */}
            <div className="lg:hidden">
              <BuyerOverviewPanel
                currentUser={currentUser}
                userProfile={userProfile}
                orders={orders}
                loadingOrders={loadingOrders}
                onSelectTab={setActiveTab}
                compactMobile
              />
            </div>

            <BuyerNavigationMenu
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              ordersCount={orders.length}
              addressesCount={addressesCount}
            />
          </div>

          {/* Right Detail Panel */}
          <div className={`lg:col-span-8 ${activeTab === "index" ? "hidden lg:block" : "block"}`}>
            {activeTab === "index" ? (
              <BuyerOverviewPanel
                currentUser={currentUser}
                userProfile={userProfile}
                orders={orders}
                loadingOrders={loadingOrders}
                onSelectTab={setActiveTab}
              />
            ) : (
              <div className="animate-in fade-in duration-150">
                {activeTab === "general" && <GeneralSettings />}
                {activeTab === "profile" && (
                  <ProfileSettings currentUser={currentUser} userProfile={userProfile} />
                )}
                {activeTab === "addresses" && (
                  <AddressManager currentUser={currentUser} userProfile={userProfile} />
                )}
                {activeTab === "orders" && (
                  <OrdersSection
                    orders={orders}
                    loading={loadingOrders}
                    loadingMore={loadingMore}
                    hasMore={Boolean(lastVisible)}
                    onLoadMore={loadMoreOrders}
                  />
                )}
                {activeTab === "security" && (
                  <SecuritySettings currentUser={currentUser} userProfile={userProfile} />
                )}
                {activeTab === "preferences" && (
                  <CustomerPreferences currentUser={currentUser} userProfile={userProfile} />
                )}
                {activeTab === "following" && <FollowedStores />}
                {activeTab === "reviews" && <MyReviews />}
                {activeTab === "returns" && <ReturnManagement currentUser={currentUser} />}
                {activeTab === "documents" && <UserDocumentsSection />}
                {activeTab === "support" && <BuyerSupport />}
                {activeTab === "about" && <AboutSection />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
