import React from "react";
import { Route, Navigate } from "react-router-dom";
import { AppGuard } from "../components/AppGuard";
import { ROLES } from "../constants/roles";
import { lazyWithRetry } from "../utils/lazyWithRetry";

const SellerDashboardLayout = lazyWithRetry(() => import("../pages/Seller/SellerDashboardLayout"), "SellerDashboardLayout");
const SellerOverview = lazyWithRetry(() => import("../pages/Seller/Overview"), "Overview");
const SellerAnalytics = lazyWithRetry(() => import("../pages/Seller/SellerAnalytics"), "SellerAnalytics");
const Catalog = lazyWithRetry(() => import("../pages/Seller/Catalog"), "Catalog");
const SellerOrders = lazyWithRetry(() => import("../pages/Seller/Orders"), "Orders");
const SellerShipping = lazyWithRetry(() => import("../pages/Seller/SellerShipping"), "SellerShipping");
const ReturnManagement = lazyWithRetry(() => import("../pages/Seller/ReturnManagement"), "ReturnManagement");
const Verification = lazyWithRetry(() => import("../pages/Seller/Verification"), "Verification");
const ShopSettings = lazyWithRetry(() => import("../pages/Seller/ShopSettings"), "ShopSettings");
const SellerDisputes = lazyWithRetry(() => import("../pages/Seller/Disputes"), "SellerDisputes");
const SellerSupport = lazyWithRetry(() => import("../pages/Seller/Support"), "Support");
const SellerReviews = lazyWithRetry(() => import("../pages/Seller/Reviews"), "SellerReviews");
const SellerSponsorships = lazyWithRetry(() => import("../pages/Seller/MarketingCenter"), "MarketingCenter");
const MarketingCenter = lazyWithRetry(() => import("../pages/Seller/MarketingCenter"), "MarketingCenter");
const SellerCoupons = lazyWithRetry(() => import("../pages/Seller/SellerCoupons"), "SellerCoupons");
const StoreBuilderGate = lazyWithRetry(() => import("../pages/Seller/StoreBuilderGate"), "StoreBuilderGate");

export const renderSellerRoutes = () => (
  <>
    <Route
      path="/seller"
      element={<Navigate to="/dashboard/seller" replace />}
    />
    <Route
      path="/seller/catalog"
      element={<Navigate to="/dashboard/seller/catalog" replace />}
    />
    <Route
      path="/dashboard/seller"
      element={
        <AppGuard allowedRoles={[ROLES.SELLER, ROLES.ADMIN]}>
          <SellerDashboardLayout />
        </AppGuard>
      }
    >
      <Route index element={<SellerOverview />} />
      <Route path="store-builder" element={<StoreBuilderGate />} />
      <Route path="studio" element={<StoreBuilderGate />} />
      <Route path="analytics" element={<SellerAnalytics />} />
      <Route path="catalog" element={<Catalog />} />
      <Route path="products" element={<Navigate to="/dashboard/seller/catalog" replace />} />
      <Route path="orders" element={<SellerOrders />} />
      <Route path="shipping" element={<SellerShipping />} />
      <Route path="returns" element={<ReturnManagement />} />
      <Route path="disputes" element={<SellerDisputes />} />
      <Route path="verification" element={<Verification />} />
      <Route path="settings" element={<ShopSettings />} />
      <Route path="support" element={<SellerSupport />} />
      <Route path="reviews" element={<SellerReviews />} />
      <Route path="sponsorships" element={<SellerSponsorships />} />
      <Route path="marketing" element={<MarketingCenter />} />
      <Route path="coupons" element={<SellerCoupons />} />
    </Route>
  </>
);
