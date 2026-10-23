import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { Response } from "express";
import request from "supertest";
import { requireSubscriptionFeature, SubscriptionAuthenticatedRequest } from "../middlewares/subscriptionAuth";

let mockUser: { uid: string; role: string } | null = null;
let mockSummaryResult = {
  hasActiveSubscription: false,
  subscription: null as Record<string, unknown> | null,
  daysRemaining: 0,
  permissions: [] as string[],
  limits: null as Record<string, unknown> | null,
  pendingRequest: null
};

vi.mock("../domains/seller/services/sellerSubscription.service", () => ({
  getSellerSubscriptionStatus: vi.fn(async () => mockSummaryResult)
}));

const app = express();
app.use((req, _res, next) => {
  (req as unknown as { user: unknown }).user = mockUser;
  next();
});

app.get(
  "/test/builder",
  requireSubscriptionFeature("custom_pages") as unknown as express.RequestHandler,
  (req: SubscriptionAuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: "Accès builder autorisé", plan: req.subscription?.planName });
  }
);

app.get(
  "/test/tiktok",
  requireSubscriptionFeature("tiktok_ads") as unknown as express.RequestHandler,
  (req: SubscriptionAuthenticatedRequest, res: Response) => {
    res.json({ success: true, message: "Accès TikTok autorisé", plan: req.subscription?.planName });
  }
);

describe("Subscription Middleware - Feature Gating", () => {
  beforeEach(() => {
    mockUser = null;
    mockSummaryResult = {
      hasActiveSubscription: false,
      subscription: null,
      daysRemaining: 0,
      permissions: [],
      limits: null,
      pendingRequest: null
    };
  });

  it("Rejects unauthenticated user with 401", async () => {
    const res = await request(app).get("/test/builder");
    expect(res.status).toBe(401);
  });

  it("Allows admin to access any feature unconditionally", async () => {
    mockUser = { uid: "admin_1", role: "admin" };
    const res = await request(app).get("/test/builder");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("Blocks seller without active subscription with 403 SUBSCRIPTION_REQUIRED", async () => {
    mockUser = { uid: "seller_dz_no_sub", role: "seller" };
    const res = await request(app).get("/test/builder");
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("SUBSCRIPTION_REQUIRED");
  });

  it("Blocks seller if feature not allowed by current plan with 403 FEATURE_NOT_IN_PLAN", async () => {
    mockUser = { uid: "seller_artisan", role: "seller" };
    mockSummaryResult = {
      hasActiveSubscription: true,
      subscription: {
        id: "sub_1",
        planName: "Pro Artisan & Créateur",
        permissions: ["custom_pages"],
        limits: { maxPages: 3, tiktokAdsAllowed: false }
      },
      daysRemaining: 20,
      permissions: ["custom_pages"],
      limits: { maxPages: 3, tiktokAdsAllowed: false },
      pendingRequest: null
    };

    const resBuilder = await request(app).get("/test/builder");
    expect(resBuilder.status).toBe(200);

    const resTikTok = await request(app).get("/test/tiktok");
    expect(resTikTok.status).toBe(403);
    expect(resTikTok.body.code).toBe("FEATURE_NOT_IN_PLAN");
  });

  it("Allows seller with Business plan to access TikTok Ads", async () => {
    mockUser = { uid: "seller_business", role: "seller" };
    mockSummaryResult = {
      hasActiveSubscription: true,
      subscription: {
        id: "sub_2",
        planName: "Business & Multicanal",
        permissions: ["custom_pages", "tiktok_ads"],
        limits: { maxPages: 25, tiktokAdsAllowed: true }
      },
      daysRemaining: 29,
      permissions: ["custom_pages", "tiktok_ads"],
      limits: { maxPages: 25, tiktokAdsAllowed: true },
      pendingRequest: null
    };

    const resTikTok = await request(app).get("/test/tiktok");
    expect(resTikTok.status).toBe(200);
    expect(resTikTok.body.success).toBe(true);
    expect(resTikTok.body.plan).toBe("Business & Multicanal");
  });
});
