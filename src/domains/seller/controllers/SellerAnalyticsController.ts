import { Router, Response } from "express";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { SellerService } from "../../../services/SellerService";
import { SellerAnalyticsService } from "../services/sellerAnalytics.service";

const router = Router();

// GET seller overview stats
router.get("/api/v1/seller/overview-stats", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const data = await SellerService.getOverviewStats(req.user.uid);
    return res.json(data);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// GET seller analytics with strict COD separation and IDOR verification
router.get("/api/v1/seller/analytics", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const requestedSellerId = (req.query.sellerId as string) || uid;

    // Strict Anti-IDOR: seller can only access their own analytics
    SellerAnalyticsService.verifySellerAccess(uid, requestedSellerId);

    const period = (req.query.period as string) || "7d";
    const data = await SellerAnalyticsService.getSellerAnalytics(requestedSellerId, period);

    return res.json({
      success: true,
      revenue: data.deliveredRevenue,
      orderedRevenue: data.orderedRevenue,
      deliveredRevenue: data.deliveredRevenue,
      orders: data.totalOrders,
      totalOrders: data.totalOrders,
      aov: data.aov,
      conversionRate: data.conversionRate,
      trackingAvailable: data.trackingAvailable,
      storeViews: data.storeViews,
      productViews: data.productViews,
      cartAdds: data.cartAdds,
      statusBreakdown: data.statusBreakdown,
      trafficSources: data.trafficSources,
      topProducts: data.topProducts,
      chartData: data.chartData,
      followersCount: data.followersCount,
      reviewsCount: data.reviewsCount,
      averageRating: data.averageRating,
    });
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number }).statusCode || 500;
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(statusCode).json({ success: false, error: msg });
  }
});

export default router;
