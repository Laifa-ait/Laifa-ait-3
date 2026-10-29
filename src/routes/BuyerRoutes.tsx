import React from "react";
import { Route, Navigate } from "react-router-dom";
import { AppGuard } from "../components/AppGuard";
import { ROLES } from "../constants/roles";
import { lazyWithRetry } from "../utils/lazyWithRetry";

const BuyerDashboard = lazyWithRetry(
  () => import("../pages/BuyerDashboard").then((m) => m.BuyerDashboard),
  "BuyerDashboard"
);
const OrderDetails = React.lazy(() =>
  import("../pages/Public/OrderDetails").then((m) => ({ default: m.OrderDetails }))
);

export const renderBuyerRoutes = () => (
  <>
    <Route
      path="/buyer"
      element={<Navigate to="/dashboard/buyer" replace />}
    />
    <Route
      path="/dashboard/buyer"
      element={
        <AppGuard allowedRoles={[ROLES.BUYER, ROLES.ADMIN, ROLES.SELLER]}>
          <BuyerDashboard />
        </AppGuard>
      }
    />
    <Route
      path="/dashboard/buyer/settings"
      element={<Navigate to="/dashboard/buyer?tab=general" replace />}
    />
    <Route
      path="/buyer/orders"
      element={<Navigate to="/dashboard/buyer?tab=orders" replace />}
    />
    <Route
      path="/profile"
      element={<Navigate to="/dashboard/buyer?tab=profile" replace />}
    />
    <Route
      path="/account"
      element={<Navigate to="/dashboard/buyer" replace />}
    />
    <Route
      path="/messages"
      element={<Navigate to="/dashboard/buyer?tab=support" replace />}
    />
    <Route
      path="/dashboard/buyer/order/:id"
      element={
        <AppGuard allowedRoles={[ROLES.BUYER, ROLES.ADMIN, ROLES.SELLER]}>
          <OrderDetails />
        </AppGuard>
      }
    />
    <Route
      path="/orders/:id"
      element={
        <AppGuard allowedRoles={[ROLES.BUYER, ROLES.ADMIN, ROLES.SELLER]}>
          <OrderDetails />
        </AppGuard>
      }
    />
    <Route
      path="/order/:id"
      element={
        <AppGuard allowedRoles={[ROLES.BUYER, ROLES.ADMIN, ROLES.SELLER]}>
          <OrderDetails />
        </AppGuard>
      }
    />
  </>
);
