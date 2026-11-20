import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiGet } from "../../../lib/api";
import {
  SellerOverviewStatsData,
  SellerOverviewPayoutStats,
  SellerOverviewWilayaStat,
  SellerOverviewChartPoint,
  SellerOverviewTopProduct,
  SellerOverviewRecentOrder,
  SellerOverviewApiResponse,
} from "../../../types/seller";

export function useSellerOverview() {
  const { currentUser, userProfile } = useAuth();
  const [stats, setStats] = useState<SellerOverviewStatsData>({
    totalSales: 0,
    orderCount: 0,
    productCount: 0,
    growth: "N/A",
    pendingReturns: 0,
  });
  const [recentOrders, setRecentOrders] = useState<SellerOverviewRecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<SellerOverviewTopProduct[]>([]);
  const [payoutStats, setPayoutStats] = useState<SellerOverviewPayoutStats>({ available: 0, nextPaymentDate: "" });
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [wilayaStats, setWilayaStats] = useState<SellerOverviewWilayaStat[]>([]);
  const [chartData, setChartData] = useState<SellerOverviewChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setError(null);
    setLoading(true);
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const fetchData = async () => {
      try {
        setError(null);
        const data = await apiGet<SellerOverviewApiResponse>("/api/v1/seller/overview-stats");
        if (!cancelled && data) {
          if (data.stats) setStats(data.stats);
          if (data.recentOrders) setRecentOrders(data.recentOrders);
          if (data.topProducts) setTopProducts(data.topProducts);
          if (data.payoutStats) setPayoutStats(data.payoutStats);
          if (data.outOfStockCount !== undefined) setOutOfStockCount(data.outOfStockCount);
          if (data.wilayaStats) setWilayaStats(data.wilayaStats);
          if (data.chartData) setChartData(data.chartData);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error && err.message && !err.message.trim().startsWith("<")
              ? err.message
              : "Impossible de charger les statistiques de la boutique pour le moment.";
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [currentUser, refreshKey]);

  return {
    currentUser,
    userProfile,
    stats,
    recentOrders,
    topProducts,
    payoutStats,
    outOfStockCount,
    wilayaStats,
    chartData,
    loading,
    error,
    refetch,
  };
}
