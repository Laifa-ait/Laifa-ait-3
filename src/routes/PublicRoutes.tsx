import React from "react";
import { Route, Navigate } from "react-router-dom";
import { PageWrapper } from "../components/common/PageWrapper";
import { lazyWithRetry } from "../utils/lazyWithRetry";

// Core Public Pages (Lazy Loaded)
const Home = lazyWithRetry(() => import("../pages/Public/Home").then((m) => m.Home), "Home");
const Shop = lazyWithRetry(() => import("../pages/Public/Shop").then((m) => m.Shop), "Shop");
const ProductDetails = lazyWithRetry(() => import("../pages/Public/ProductDetails"));
const Auth = lazyWithRetry(() => import("../pages/Public/Auth").then((m) => m.Auth), "Auth");
const Cart = lazyWithRetry(() => import("../pages/Public/Cart").then((m) => m.Cart), "Cart");
const Checkout = lazyWithRetry(() => import("../pages/Public/Checkout").then((m) => m.Checkout), "Checkout");
const PrivacyPolicy = lazyWithRetry(() => import("../pages/Public/PrivacyPolicy").then((m) => m.PrivacyPolicy), "PrivacyPolicy");
const RefundPolicy = lazyWithRetry(() => import("../pages/Public/RefundPolicy").then((m) => m.RefundPolicy), "RefundPolicy");
const Support = lazyWithRetry(() => import("../pages/Public/Support").then((m) => m.Support), "Support");
const MobileCategories = lazyWithRetry(() => import("../components/MobileCategories"), "MobileCategories");

const StoreProfile = lazyWithRetry(() => import("../pages/Public/StoreProfile"), "StoreProfile");
const ProductFilterPage = lazyWithRetry(() => import("../pages/Public/ProductFilterPage"), "ProductFilterPage");
const CampaignCollection = lazyWithRetry(() => import("../pages/Public/CampaignCollection"), "CampaignCollection");
const CampaignPage = lazyWithRetry(() => import("../pages/Public/CampaignPage"), "CampaignPage");
const TagCollectionPage = lazyWithRetry(() => import("../pages/Public/TagCollectionPage"), "TagCollectionPage");
const PremiumCollection = lazyWithRetry(() => import("../pages/Public/PremiumCollection"), "PremiumCollection");
const DynamicCollectionPage = lazyWithRetry(() => import("../pages/Public/DynamicCollectionPage"), "DynamicCollectionPage");
const FeaturedProducts = lazyWithRetry(() => import("../pages/Public/FeaturedProducts"), "FeaturedProducts");
const ShippingCalculatorPage = lazyWithRetry(() => import("../pages/Public/ShippingCalculatorPage"), "ShippingCalculatorPage");
const ShopsDirectory = lazyWithRetry(() => import("../pages/Public/ShopsDirectory"), "ShopsDirectory");
const ComparatorPage = lazyWithRetry(() => import("../pages/Public/ComparatorPage"), "ComparatorPage");
const VerifyEmail = lazyWithRetry(() => import("../pages/Public/VerifyEmail"), "VerifyEmail");
const Onboarding = lazyWithRetry(() => import("../pages/Public/Onboarding"), "Onboarding");
const SellerOnboarding = lazyWithRetry(() => import("../pages/Public/SellerOnboarding"), "SellerOnboarding");
const ForgotPassword = lazyWithRetry(() => import("../pages/Public/ForgotPassword"), "ForgotPassword");

export const renderPublicRoutes = () => (
  <>
    <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
    <Route path="/univers" element={<PageWrapper><MobileCategories /></PageWrapper>} />
    <Route path="/univers/:categorySlug" element={<Navigate to="/shop" replace />} />
    <Route path="/shop" element={<PageWrapper><Shop /></PageWrapper>} />
    <Route path="/shop/:sellerId" element={<PageWrapper><StoreProfile /></PageWrapper>} />
    <Route path="/store/:sellerId" element={<PageWrapper><StoreProfile /></PageWrapper>} />
    <Route path="/boutique/:sellerId" element={<PageWrapper><StoreProfile /></PageWrapper>} />
    <Route path="/catalogue/:tagSlug" element={<PageWrapper><ProductFilterPage /></PageWrapper>} />
    <Route path="/premium-collection" element={<PageWrapper><PremiumCollection /></PageWrapper>} />
    <Route path="/collection/:collectionName" element={<PageWrapper><DynamicCollectionPage /></PageWrapper>} />
    <Route path="/featured" element={<PageWrapper><FeaturedProducts /></PageWrapper>} />
    <Route path="/campaign-collection/:bannerId" element={<PageWrapper><CampaignCollection /></PageWrapper>} />
    <Route path="/campaign/:bannerId" element={<PageWrapper><CampaignPage /></PageWrapper>} />
    <Route path="/tags/:tagId" element={<PageWrapper><TagCollectionPage /></PageWrapper>} />
    <Route path="/compare" element={<PageWrapper><ComparatorPage /></PageWrapper>} />
    <Route path="/product/:id" element={<PageWrapper><ProductDetails /></PageWrapper>} />
    <Route path="/auth" element={<PageWrapper><Auth /></PageWrapper>} />
    <Route path="/forgot-password" element={<PageWrapper><ForgotPassword /></PageWrapper>} />
    <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
    <Route path="/privacy-policy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
    <Route path="/refund-policy" element={<PageWrapper><RefundPolicy /></PageWrapper>} />
    <Route path="/support" element={<PageWrapper><Support /></PageWrapper>} />
    <Route path="/categories" element={<PageWrapper><MobileCategories /></PageWrapper>} />
    <Route path="/shipping-calculator" element={<PageWrapper><ShippingCalculatorPage /></PageWrapper>} />
    <Route path="/shops" element={<PageWrapper><ShopsDirectory /></PageWrapper>} />
    <Route path="/search" element={<Navigate to="/shop" replace />} />
    <Route path="/comparator" element={<Navigate to="/compare" replace />} />
    <Route path="/login" element={<Navigate to="/auth" replace />} />
    <Route path="/register" element={<Navigate to="/auth" replace />} />
    <Route path="/terms-of-service" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
    <Route path="/terms" element={<Navigate to="/terms-of-service" replace />} />
    <Route path="/aide" element={<Navigate to="/support" replace />} />
    <Route path="/olma-immo" element={<Navigate to="/immo" replace />} />
    <Route path="/verify-email" element={<PageWrapper><VerifyEmail /></PageWrapper>} />
    <Route path="/onboarding" element={<PageWrapper><Onboarding /></PageWrapper>} />
    <Route path="/seller-onboarding" element={<PageWrapper><SellerOnboarding /></PageWrapper>} />
    <Route path="/become-seller" element={<Navigate to="/seller-onboarding" replace />} />
    <Route path="/checkout" element={<PageWrapper><Checkout /></PageWrapper>} />
  </>
);
