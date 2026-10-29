import React from "react";
import { Route, Navigate } from "react-router-dom";
import { AppGuard } from "../components/AppGuard";
import { ROLES } from "../constants/roles";

const AdminDashboardLayout = React.lazy(() => import("../pages/Admin/AdminDashboardLayout").then((m) => ({ default: m.AdminDashboardLayout })));
const AdminOverview = React.lazy(() => import("../pages/Admin/Overview").then((m) => ({ default: m.Overview })));
const SystemHealth = React.lazy(() => import("../pages/Admin/SystemHealth").then((m) => ({ default: m.SystemHealth })));
const OrdersAdmin = React.lazy(() => import("../pages/Admin/OrdersAdmin").then((m) => ({ default: m.OrdersAdmin })));
const PromotionsAdmin = React.lazy(() => import("../pages/Admin/PromotionsAdmin").then((m) => ({ default: m.PromotionsAdmin })));
const ReviewsAdmin = React.lazy(() => import("../pages/Admin/ReviewsAdmin").then((m) => ({ default: m.ReviewsAdmin })));
const ReportsAdmin = React.lazy(() => import("../pages/Admin/ReportsAdmin").then((m) => ({ default: m.ReportsAdmin })));
const SellerModeration = React.lazy(() => import("../pages/Admin/SellerModeration").then((m) => ({ default: m.SellerModeration })));
const ArtisansAdmin = React.lazy(() => import("../pages/Admin/ArtisansAdmin").then((m) => ({ default: m.ArtisansAdmin })));
const ProductModeration = React.lazy(() => import("../pages/Admin/ProductModeration").then((m) => ({ default: m.ProductModeration })));
const Curation = React.lazy(() => import("../pages/Admin/Curation").then((m) => ({ default: m.Curation })));
const SponsorshipsAdmin = React.lazy(() => import("../pages/Admin/SponsorshipsAdmin").then((m) => ({ default: m.SponsorshipsAdmin })));
const DBSeedAdmin = React.lazy(() => import("../pages/Admin/DBSeedAdmin").then((m) => ({ default: m.DBSeedAdmin })));
const DisputeManagement = React.lazy(() => import("../pages/Admin/DisputeManagement").then((m) => ({ default: m.DisputeManagement })));
const Newsletter = React.lazy(() => import("../pages/Admin/Newsletter").then((m) => ({ default: m.Newsletter })));
const BannerAdmin = React.lazy(() => import("../pages/Admin/BannerAdmin").then((m) => ({ default: m.BannerAdmin })));
const HomepageBuilder = React.lazy(() => import("../pages/Admin/HomepageBuilder").then((m) => ({ default: m.HomepageBuilder })));
const UniversAdmin = React.lazy(() => import("../pages/Admin/UniversAdmin").then((m) => ({ default: m.UniversAdmin })));
const SupportAdmin = React.lazy(() => import("../pages/Admin/Support").then((m) => ({ default: m.SupportAdmin })));
const CheckoutAuditAdmin = React.lazy(() => import("../pages/Admin/CheckoutAuditAdmin").then((m) => ({ default: m.CheckoutAuditAdmin })));
const SearchIndexAdmin = React.lazy(() => import("../pages/Admin/SearchIndexAdmin").then((m) => ({ default: m.SearchIndexAdmin })));
const CategoriesAdmin = React.lazy(() => import("../pages/Admin/Categories").then((m) => ({ default: m.CategoriesAdmin })));
const SettingsAdmin = React.lazy(() => import("../pages/Admin/SettingsAdmin").then((m) => ({ default: m.SettingsAdmin })));
const UsersAdmin = React.lazy(() => import("../pages/Admin/UsersAdmin").then((m) => ({ default: m.UsersAdmin })));
const AuditLogsAdmin = React.lazy(() => import("../pages/Admin/AuditLogsAdmin").then((m) => ({ default: m.AuditLogsAdmin })));
const TranslationAdmin = React.lazy(() => import("../pages/Admin/TranslationAdmin").then((m) => ({ default: m.TranslationAdmin })));
const SiteLogsAdmin = React.lazy(() => import("../pages/Admin/SiteLogsAdmin").then((m) => ({ default: m.SiteLogsAdmin })));
const AgentsAdmin = React.lazy(() => import("../pages/Admin/AgentsAdmin").then((m) => ({ default: m.AgentsAdmin })));
const AutoModerationAdmin = React.lazy(() => import("../pages/Admin/AutoModerationAdmin").then((m) => ({ default: m.AutoModerationAdmin })));
const ImmoModerationAdmin = React.lazy(() => import("../pages/Admin/ImmoModerationAdmin").then((m) => ({ default: m.ImmoModerationAdmin })));
const SubscriptionsAdmin = React.lazy(() => import("../pages/Admin/SubscriptionsAdmin").then((m) => ({ default: m.SubscriptionsAdmin })));
const CategoryPhotosAdmin = React.lazy(() => import("../pages/Admin/CategoryPhotosAdmin").then((m) => ({ default: m.CategoryPhotosAdmin })));

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
