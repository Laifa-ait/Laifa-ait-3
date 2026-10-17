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
    if (!currentMockUser || currentMockUser.role !== "admin") {
      return res.status(403).json({ error: "Accès administrateur requis" });
    }
    next();
  },
  require2FA: (_req: Request, _res: Response, next: NextFunction) => next()
}));

const mockStore: Record<string, Record<string, unknown>> = {
  subscription_plans: {},
  subscription_requests: {},
  seller_subscriptions: {},
  audit_logs: {},
  user_notifications: {}
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
    batch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn() })),
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

describe("Olmart Commerce Studio - Security, Grant Restrictions & IDOR Verification", () => {
  beforeEach(() => {
    currentMockUser = null;
    for (const key of Object.keys(mockStore)) {
      mockStore[key] = {};
    }
  });

  it("STRICT RULE 1: grantSubscriptionTx MUST BE REJECTED if status is payment_declared", async () => {
    mockStore.subscription_requests["req_declared_only"] = {
      id: "req_declared_only",
      sellerId: "seller_test_01",
      planId: "plan_artisan_pro",
      planSnapshot: { durationDays: 30, name: "Artisan Pro", features: [], limits: {} },
      status: "payment_declared" // declared by seller but NOT yet confirmed by admin
    };

    currentMockUser = { uid: "admin_1", role: "admin" };
    const res = await request(app)
      .post("/api/v1/admin/subscriptions/requests/req_declared_only/grant")
      .send({ notes: "Tentative d'attribution prématurée" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Attribution refusée");
    expect(mockStore.subscription_requests["req_declared_only"].status).toBe("payment_declared");
    expect(Object.keys(mockStore.seller_subscriptions).length).toBe(0);
  });

  it("STRICT RULE 2: grantSubscriptionTx SUCCEEDS ONLY AFTER payment_confirmed", async () => {
    mockStore.subscription_requests["req_confirmed_ok"] = {
      id: "req_confirmed_ok",
      sellerId: "seller_test_01",
      planId: "plan_artisan_pro",
      planSnapshot: { durationDays: 30, name: "Artisan Pro", features: ["custom_pages"], limits: {} },
      status: "payment_confirmed"
    };

    currentMockUser = { uid: "admin_1", role: "admin" };
    const res = await request(app)
      .post("/api/v1/admin/subscriptions/requests/req_confirmed_ok/grant")
      .send({ notes: "Validation après audit bancaire" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockStore.subscription_requests["req_confirmed_ok"].status).toBe("granted");
    expect(mockStore.seller_subscriptions["sub_seller_test_01_req_confirmed_ok"]).toBeDefined();
  });

  it("STRICT RULE 3: Double grant is strictly prevented on the same request", async () => {
    mockStore.subscription_requests["req_already_granted"] = {
      id: "req_already_granted",
      sellerId: "seller_test_01",
      planId: "plan_artisan_pro",
      status: "granted",
      grantDetails: { grantedAt: new Date().toISOString(), subscriptionId: "sub_1" }
    };

    currentMockUser = { uid: "admin_1", role: "admin" };
    const res = await request(app)
      .post("/api/v1/admin/subscriptions/requests/req_already_granted/grant")
      .send({ notes: "Deuxième clic accidentel" });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("double attribution strictement interdite");
  });

  it("STRICT RULE 4: Cross-seller access is blocked (Seller A cannot declare payment for Seller B)", async () => {
    mockStore.subscription_requests["req_seller_b"] = {
      id: "req_seller_b",
      sellerId: "seller_b",
      status: "payment_requested"
    };

    currentMockUser = { uid: "seller_a_attacker", role: "seller" };
    const res = await request(app)
      .post("/api/v1/seller/subscription/declare-payment")
      .send({
        requestId: "req_seller_b",
        transactionReference: "ATTACK-001",
        paymentDate: "2026-10-13"
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("Accès refusé");
  });

  it("STRICT RULE 5: Invalid or non-HTTPS proofFileUrl is strictly rejected", async () => {
    mockStore.subscription_requests["req_safe"] = {
      id: "req_safe",
      sellerId: "seller_alice",
      status: "payment_requested"
    };

    currentMockUser = { uid: "seller_alice", role: "seller" };
    const resXss = await request(app)
      .post("/api/v1/seller/subscription/declare-payment")
      .send({
        requestId: "req_safe",
        transactionReference: "SAFE-REF-01",
        paymentDate: "2026-10-13",
        proofFileUrl: "javascript:alert('xss')"
      });
    expect(resXss.status).toBe(400);
    expect(resXss.body.error).toContain("HTTPS");

    const resHttp = await request(app)
      .post("/api/v1/seller/subscription/declare-payment")
      .send({
        requestId: "req_safe",
        transactionReference: "SAFE-REF-01",
        paymentDate: "2026-10-13",
        proofFileUrl: "http://unsecure-site.com/receipt.pdf"
      });
    expect(resHttp.status).toBe(400);
    expect(resHttp.body.error).toContain("HTTPS");
  });
});
