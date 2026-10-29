import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../context/AuthContext";
import { apiGet } from "../../../lib/api";
import { useDebounce } from "../../../hooks/useDebounce";
import { analyticsEngine, AnalyticsEvent } from "../../../utils/analyticsEngine";
import { fetchCollectionSample } from "../../../services/adminRepository";
import {
  AdminAlert,
  DashboardData,
  RecentActivity,
  GlobalOrder,
  TopProduct,
  TopSeller,
  WilayaStat,
  AnalyticsInsights,
  OverviewStats,
} from "../../../types/adminOverview";

interface OverviewApiResponse {
  stats: OverviewStats;
  disputeCount: number;
  chartData: DashboardData[];
  wilayaStats: WilayaStat[];
  topProducts: TopProduct[];
  topSellers: TopSeller[];
  recentEvents: RecentActivity[];
  globalOrders: GlobalOrder[];
  adminAlerts: AdminAlert[];
}

export function useAdminOverview() {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();

  const [stats, setStats] = useState<OverviewStats>({
    totalSales: 0,
    activeVendors: 0,
    totalOrders: 0,
    netRevenue: 0,
    pendingVendors: 0,
    revenueChange: 0,
    ordersChange: 0,
    activeSubscriptions: 0,
    pendingSubRequests: 0,
    pendingProducts: 0,
    unresolvedSiteErrors: 0,
    totalUsers: 0,
    totalProducts: 0,
  });

  const [adminAlerts, setAdminAlerts] = useState<AdminAlert[]>([]);
  const [data, setData] = useState<DashboardData[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentActivity[]>([]);
  const [globalOrders, setGlobalOrders] = useState<GlobalOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [disputeCount, setDisputeCount] = useState(0);
  const [dateFilter, setDateFilter] = useState<"today" | "week" | "month">("month");
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topSellers, setTopSellers] = useState<TopSeller[]>([]);
  const [wilayaStats, setWilayaStats] = useState<WilayaStat[]>([]);
  const [realTimeTraffic, setRealTimeTraffic] = useState<{ time: string; views: number; carts: number }[]>([]);
  const [loadingRefresh, setLoadingRefresh] = useState(false);

  const [insights, setInsights] = useState<AnalyticsInsights>(() => {
    try {
      return analyticsEngine.getInsights();
    } catch {
      return {
        totalViews: 0,
        totalCarts: 0,
        totalPurchases: 0,
        totalRevenue: 0,
        conversionRate: "0.0",
        addToCartRate: "0.0",
        categoryHits: [],
        productViews: [],
        searchQueries: [],
      };
    }
  });

  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>(() => {
    try {
      return analyticsEngine.getEvents().slice(-15).reverse();
    } catch {
      return [];
    }
  });

  const isAuthorizedAdmin = userProfile?.role === "admin" || userProfile?.role === "superadmin";

  const refreshAnalytics = useCallback(async () => {
    if (!currentUser || !isAuthorizedAdmin) return;
    setLoadingRefresh(true);
    try {
      setInsights(analyticsEngine.getInsights());
      setAnalyticsEvents(analyticsEngine.getEvents().slice(-15).reverse());

      const res = await apiGet<{ success: boolean; data: OverviewApiResponse }>("/api/v1/admin/overview");
      const payload = res?.data;
      if (payload) {
        setStats(payload.stats);
        setDisputeCount(payload.disputeCount);
        setData(payload.chartData || []);
        setWilayaStats(payload.wilayaStats || []);
        setTopProducts(payload.topProducts || []);
        setTopSellers(payload.topSellers || []);
        setRecentEvents(payload.recentEvents || []);
        setGlobalOrders(payload.globalOrders || []);
        setAdminAlerts(payload.adminAlerts || []);
      }

      try {
        const rtDocs = await fetchCollectionSample("analytics_events", 100);
        const intervalMinutes = 15;
        const trafficMap: Record<string, { views: number; carts: number }> = {};

        rtDocs.forEach((dataItem) => {
          if (!dataItem.serverTimestamp) return;
          const rawTs = dataItem.serverTimestamp as { toDate?: () => Date } | string | number;
          const date =
            typeof rawTs === "object" && rawTs !== null && typeof rawTs.toDate === "function"
              ? rawTs.toDate()
              : new Date(String(rawTs));
          const roundedMinutes = Math.floor(date.getMinutes() / intervalMinutes) * intervalMinutes;
          date.setMinutes(roundedMinutes, 0, 0);

          const timeKey = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          if (!trafficMap[timeKey]) trafficMap[timeKey] = { views: 0, carts: 0 };

          if (dataItem.name === "product_view" || dataItem.name === "search_query") trafficMap[timeKey].views++;
          if (dataItem.name === "add_to_cart") trafficMap[timeKey].carts++;
        });

        const formattedTraffic = Object.entries(trafficMap)
          .map(([time, statsItem]) => ({ time, ...statsItem }))
          .sort((a, b) => a.time.localeCompare(b.time));

        setRealTimeTraffic(formattedTraffic);
      } catch {
        setRealTimeTraffic([]);
      }
    } catch (err: unknown) {
      console.error("[useAdminOverview] Failed to fetch overview metrics:", err);
    } finally {
      setLoadingRefresh(false);
      setLoadingOrders(false);
    }
  }, [currentUser, isAuthorizedAdmin]);

  const debouncedRefresh = useDebounce(refreshAnalytics, 500);

  useEffect(() => {
    if (!currentUser || !isAuthorizedAdmin) return;
    refreshAnalytics();
  }, [currentUser, isAuthorizedAdmin, dateFilter, refreshAnalytics]);

  return {
    t,
    stats,
    adminAlerts,
    data,
    recentEvents,
    globalOrders,
    loadingOrders,
    insights,
    analyticsEvents,
    loadingRefresh,
    refreshAnalytics,
    debouncedRefresh,
    disputeCount,
    dateFilter,
    setDateFilter,
    topProducts,
    topSellers,
    wilayaStats,
    realTimeTraffic,
  };
}
