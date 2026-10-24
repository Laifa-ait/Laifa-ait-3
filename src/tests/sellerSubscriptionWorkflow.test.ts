import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { Request, Response, NextFunction } from "express";
import request from "supertest";

let currentMockUser: { uid: string; role: string; email?: string } | null = null;

vi.mock("../middlewares/auth", () => ({
  authenticateToken: (req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser) return res.status(401).json({ error: "Authentification requise" });
    (req as unknown as { user: unknown }).user = currentMockUser;
    next();
  },
  authorizeSeller: (_req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser || (currentMockUser.role !== "seller" && currentMockUser.role !== "admin")) {
      return res.status(403).json({ error: "Accès réservé aux vendeurs" });
    }
    next();
  },
  authorizeAdmin: (_req: Request, res: Response, next: NextFunction) => {
    if (!currentMockUser || currentMockUser.role !== "admin") return res.status(403).json({ error: "Accès administrateur requis" });
    next();
  },
  require2FA: (_req: Request, _res: Response, next: NextFunction) => next()
}));

interface MockSubscriptionRecord { status?: string; [key: string]: unknown; }
const mockStore: Record<string, Record<string, MockSubscriptionRecord>> = {
  subscription_plans: {}, subscription_requests: {}, seller_subscriptions: {}, audit_logs: {}, user_notifications: {}
};

vi.mock("../config/firebase-admin", () => {
  const getCollection = (colName: string) => ({
    doc: (docId?: string) => {
      const id = docId || `mock_id_${Math.random().toString(36).substring(2, 9)}`;
      return {
        id,
        get: vi.fn(async () => {
          const data = mockStore[colName]?.[id];
          return { exists: Boolean(data), data: () => data, id };
        }),
        set: vi.fn(async (data: Record<string, unknown>, opts?: { merge?: boolean }) => {
          if (!mockStore[colName]) mockStore[colName] = {};
          if (opts?.merge && mockStore[colName][id]) {
            mockStore[colName][id] = { ...(mockStore[colName][id] as object), ...data };
          } else {
            mockStore[colName][id] = data;
          }
          return { id };
        }),
        update: vi.fn(async (data: Record<string, unknown>) => {
          if (!mockStore[colName]?.[id]) throw new Error("Document introuvable");
          mockStore[colName][id] = { ...(mockStore[colName][id] as object), ...data };
        })
      };
    },
    get: vi.fn(async () => {
      const docs = Object.entries(mockStore[colName] || {}).map(([id, d]) => ({ id, data: () => d }));
      return { empty: docs.length === 0, docs };
    }),
    where: vi.fn(function () {
      return {
        where: vi.fn(() => ({ limit: vi.fn(() => ({ get: vi.fn(async () => ({ empty: true, docs: [] })) })) })),
        orderBy: vi.fn(() => ({ limit: vi.fn(async () => ({ empty: true, docs: [] })) })),
        limit: vi.fn(async () => ({
          empty: Object.keys(mockStore[colName] || {}).length === 0,
          docs: Object.entries(mockStore[colName] || {}).map(([id, d]) => ({ id, data: () => d }))
        })),
        get: vi.fn(async () => ({
          empty: Object.keys(mockStore[colName] || {}).length === 0,
          docs: Object.entries(mockStore[colName] || {}).map(([id, d]) => ({ id, data: () => d }))
        }))
      };
    }),
    orderBy: vi.fn(() => ({
      limit: vi.fn(async () => ({
        empty: Object.keys(mockStore[colName] || {}).length === 0,
        docs: Object.entries(mockStore[colName] || {}).map(([id, d]) => ({ id, data: () => d }))
      }))
    })),
    add: vi.fn(async (data: Record<string, unknown>) => {
      const id = `mock_add_${Math.random().toString(36).substring(2, 9)}`;
      if (!mockStore[colName]) mockStore[colName] = {};
      mockStore[colName][id] = data;
      return { id };
    })
  });

  const mockDb = {
    collection: vi.fn(getCollection),
    batch: vi.fn(() => ({
      set: vi.fn(),
      commit: vi.fn()
    })),
    runTransaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        get: vi.fn(async (ref: { id: string }) => {
          const docId = ref.id;
          for (const col of Object.keys(mockStore)) {
            if (mockStore[col][docId]) return { exists: true, data: () => mockStore[col][docId], id: docId };
          }
          return { exists: false, data: () => undefined, id: docId };
        }),
        set: vi.fn((ref: { id: string }, data: Record<string, unknown>) => {
          const col = ref.id.startsWith("sub_") ? "seller_subscriptions" : "audit_logs";
          if (!mockStore[col]) mockStore[col] = {};
          mockStore[col][ref.id] = data;
        }),
        update: vi.fn((ref: { id: string }, data: Record<string, unknown>) => {
          for (const col of Object.keys(mockStore)) {
            if (mockStore[col][ref.id]) mockStore[col][ref.id] = { ...(mockStore[col][ref.id] as object), ...data };
          }
        })
      };
      return await callback(tx);
    })
  };

  return { db: mockDb, admin: { firestore: () => mockDb } };
});

import sellerSubscriptionRouter from "../domains/seller/controllers/SellerSubscriptionController";
import adminSubscriptionRouter from "../domains/admin/routes/adminSubscription.routes";

const app = express();
app.use(express.json());
app.use(sellerSubscriptionRouter);
app.use(adminSubscriptionRouter);

describe("Olmart Commerce Studio - Subscription Workflow (Steps A to F)", () => {
  beforeEach(() => {
    currentMockUser = null;
    for (const key of Object.keys(mockStore)) {
      mockStore[key] = {};
    }
    mockStore.subscription_plans["plan_business_performance"] = {
      id: "plan_business_performance",
      name: "Business & Multicanal",
      price: 7900,
      currency: "DZD",
      durationDays: 30,
      features: ["custom_pages", "tiktok_ads"],
      limits: { maxPages: 25, maxCustomSections: 50, tiktokAdsAllowed: true, analyticsAdvanced: true },
      isActive: true
    };
  });

  it("seller access is free and paid plans cannot be requested", async () => {
    mockStore.subscription_plans["plan_decouverte"] = {
      id: "plan_decouverte",
      name: "Boutique Olmart",
      price: 0,
      currency: "DZD",
      durationDays: 365,
      features: ["standard_store"],
      limits: { maxPages: 25 },
      isActive: true
    };
    currentMockUser = { uid: "seller_dz_101", role: "seller", email: "vendeur@olmart.dz" };
    const free = await request(app).post("/api/v1/seller/subscription/request").send({ planId: "plan_decouverte" });
    expect(free.status).toBe(200);
    expect(free.body.data.status).toBe("granted");
    expect(Object.keys(mockStore.seller_subscriptions)).toHaveLength(1);

    const paid = await request(app).post("/api/v1/seller/subscription/request").send({ planId: "plan_business_performance" });
    expect(paid.status).toBe(400);
  });

  it("seller cannot declare subscription payments", async () => {
    currentMockUser = { uid: "seller_dz_101", role: "seller" };
    const response = await request(app).post("/api/v1/seller/subscription/declare-payment").send({
      requestId: "req_123", transactionReference: "REF", paymentDate: "2026-10-24"
    });
    expect(response.status).toBe(404);
  });

  it("IDOR protection: Seller cannot declare payment on another seller's request", async () => {
    mockStore.subscription_requests["req_456"] = {
      id: "req_456",
      sellerId: "seller_victim",
      status: "payment_requested"
    };

    currentMockUser = { uid: "seller_attacker", role: "seller" };
    const res = await request(app)
      .post("/api/v1/seller/subscription/declare-payment")
      .send({
        requestId: "req_456",
        transactionReference: "FRAUD-REF-123",
        paymentDate: "2026-10-13"
      });

    expect(res.status).toBe(400);
    expect(mockStore.subscription_requests["req_456"].status).toBe("payment_requested");
  });
});
