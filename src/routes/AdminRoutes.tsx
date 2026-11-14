import React from "react";
import { Route, Navigate } from "react-router-dom";
import { AppGuard } from "../components/AppGuard";
import { ROLES } from "../constants/roles";
import { lazyWithRetry } from "../utils/lazyWithRetry";

const AdminDashboardLayout = lazyWithRetry(() => import("../pages/Admin/AdminDashboardLayout"), "AdminDashboardLayout");
const AdminOverview = lazyWithRetry(() => import("../pages/Admin/Overview"), "Overview");
const SystemHealth = lazyWithRetry(() => import("../pages/Admin/SystemHealth"), "SystemHealth");
const OrdersAdmin = lazyWithRetry(() => import("../pages/Admin/OrdersAdmin"), "OrdersAdmin");
const PromotionsAdmin = lazyWithRetry(() => import("../pages/Admin/PromotionsAdmin"), "PromotionsAdmin");
const ReviewsAdmin = lazyWithRetry(() => import("../pages/Admin/ReviewsAdmin"), "ReviewsAdmin");
const ReportsAdmin = lazyWithRetry(() => import("../pages/Admin/ReportsAdmin"), "ReportsAdmin");
const SellerModeration = lazyWithRetry(() => import("../pages/Admin/SellerModeration"), "SellerModeration");
const ArtisansAdmin = lazyWithRetry(() => import("../pages/Admin/ArtisansAdmin"), "ArtisansAdmin");
const ProductModeration = lazyWithRetry(() => import("../pages/Admin/ProductModeration"), "ProductModeration");
const Curation = lazyWithRetry(() => import("../pages/Admin/Curation"), "Curation");
const SponsorshipsAdmin = lazyWithRetry(() => import("../pages/Admin/SponsorshipsAdmin"), "SponsorshipsAdmin");
const DBSeedAdmin = lazyWithRetry(() => import("../pages/Admin/DBSeedAdmin"), "DBSeedAdmin");
const DisputeManagement = lazyWithRetry(() => import("../pages/Admin/DisputeManagement"), "DisputeManagement");
const Newsletter = lazyWithRetry(() => import("../pages/Admin/Newsletter"), "Newsletter");
const BannerAdmin = lazyWithRetry(() => import("../pages/Admin/BannerAdmin"), "BannerAdmin");
const HomepageBuilder = lazyWithRetry(() => import("../pages/Admin/HomepageBuilder"), "HomepageBuilder");
const UniversAdmin = lazyWithRetry(() => import("../pages/Admin/UniversAdmin"), "UniversAdmin");
const SupportAdmin = lazyWithRetry(() => import("../pages/Admin/Support"), "SupportAdmin");
const CheckoutAuditAdmin = lazyWithRetry(() => import("../pages/Admin/CheckoutAuditAdmin"), "CheckoutAuditAdmin");
const SearchIndexAdmin = lazyWithRetry(() => import("../pages/Admin/SearchIndexAdmin"), "SearchIndexAdmin");
const CategoriesAdmin = lazyWithRetry(() => import("../pages/Admin/Categories"), "CategoriesAdmin");
const SettingsAdmin = lazyWithRetry(() => import("../pages/Admin/SettingsAdmin"), "SettingsAdmin");
const UsersAdmin = lazyWithRetry(() => import("../pages/Admin/UsersAdmin"), "UsersAdmin");
const AuditLogsAdmin = lazyWithRetry(() => import("../pages/Admin/AuditLogsAdmin"), "AuditLogsAdmin");
const TranslationAdmin = lazyWithRetry(() => import("../pages/Admin/TranslationAdmin"), "TranslationAdmin");
const SiteLogsAdmin = lazyWithRetry(() => import("../pages/Admin/SiteLogsAdmin"), "SiteLogsAdmin");
const AgentsAdmin = lazyWithRetry(() => import("../pages/Admin/AgentsAdmin"), "AgentsAdmin");
const AutoModerationAdmin = lazyWithRetry(() => import("../pages/Admin/AutoModerationAdmin"), "AutoModerationAdmin");
const ImmoModerationAdmin = lazyWithRetry(() => import("../pages/Admin/ImmoModerationAdmin"), "ImmoModerationAdmin");
const SubscriptionsAdmin = lazyWithRetry(() => import("../pages/Admin/SubscriptionsAdmin"), "SubscriptionsAdmin");
const CategoryPhotosAdmin = lazyWithRetry(() => import("../pages/Admin/CategoryPhotosAdmin"), "CategoryPhotosAdmin");

export const renderAdminRoutes = () => (
  <>
    <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
    <Route
      path="/dashboard/admin"
      element={
        <AppGuard allowedRoles={[ROLES.ADMIN, ROLES.SUPERADMIN]}>
          <AdminDashboardLayout />
        </AppGuard>
      }
    >
    <Route index element={<AdminOverview />} />
    <Route path="health" element={<SystemHealth />} />
    <Route path="orders" element={<OrdersAdmin />} />
    <Route path="promotions" element={<PromotionsAdmin />} />
    <Route path="reviews" element={<ReviewsAdmin />} />
    <Route path="reports" element={<ReportsAdmin />} />
    <Route path="sellers" element={<SellerModeration />} />
    <Route path="artisans" element={<ArtisansAdmin />} />
    <Route path="auto" element={<AutoModerationAdmin />} />
    <Route path="auto/moderation" element={<AutoModerationAdmin />} />
    <Route path="immo" element={<ImmoModerationAdmin />} />
    <Route path="products-moderation" element={<ProductModeration />} />
    <Route path="curation" element={<Curation />} />
    <Route path="sponsorships" element={<SponsorshipsAdmin />} />
    <Route path="subscriptions" element={<SubscriptionsAdmin />} />
    <Route path="seed" element={<DBSeedAdmin />} />
    <Route path="disputes" element={<DisputeManagement />} />
    <Route path="newsletter" element={<Newsletter />} />
    <Route path="category-photos" element={<CategoryPhotosAdmin />} />
    <Route path="banners" element={<BannerAdmin />} />
    <Route path="homepage" element={<HomepageBuilder />} />
    <Route path="univers" element={<UniversAdmin />} />
    <Route path="support" element={<SupportAdmin />} />
    <Route path="checkout-audit" element={<CheckoutAuditAdmin />} />
    <Route path="search-index" element={<SearchIndexAdmin />} />
    <Route path="categories" element={<CategoriesAdmin />} />
    <Route path="settings" element={<SettingsAdmin />} />
    <Route path="users" element={<UsersAdmin />} />
    <Route path="audit-logs" element={<AuditLogsAdmin />} />
    <Route path="translations" element={<TranslationAdmin />} />
    <Route path="site-logs" element={<SiteLogsAdmin />} />
    <Route path="agents" element={<AgentsAdmin />} />
    {/* Redirections de cohérence pour les anciennes routes obsolètes */}
    <Route path="marketing" element={<Navigate to="/dashboard/admin/categories" replace />} />
    <Route path="megamenu" element={<Navigate to="/dashboard/admin/categories" replace />} />
    <Route path="shops" element={<Navigate to="/dashboard/admin/sellers" replace />} />
    <Route path="push-notifications" element={<Navigate to="/dashboard/admin/newsletter" replace />} />
    <Route path="launch-checklist" element={<Navigate to="/dashboard/admin/health" replace />} />
  </Route>
  </>
);
