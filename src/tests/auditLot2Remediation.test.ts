import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { projectPublicStoreProfile } from "../domains/product/controllers/publicStoreProjection";
import { buildPartialProductStockUpdate } from "../domains/order/services/orderStatusNotificationHelper";
import { BusinessError, OrderStatusService } from "../domains/order/services/orderStatus.service";

const { mockCollection, mockRunTransaction, mockAdmin } = vi.hoisted(() => {
  const mCollection = vi.fn();
  const mRunTransaction = vi.fn();
  const mAdmin = {
    firestore: {
      FieldPath: {
        documentId: () => "__name__",
      },
      FieldValue: {
        serverTimestamp: vi.fn(() => "mock-timestamp"),
        increment: vi.fn((val: number) => ({ val, type: "increment" })),
      },
    },
  };
  return {
    mockCollection: mCollection,
    mockRunTransaction: mRunTransaction,
    mockAdmin: mAdmin,
  };
});

vi.mock("../config/firebase-admin", () => ({
  db: {
    collection: mockCollection,
    runTransaction: mockRunTransaction,
  },
  admin: mockAdmin,
}));

import { productCatalogRouter } from "../domains/product/controllers/productCatalog.controller";
import adminWorkspaceRouter from "../domains/workspace/controllers/adminWorkspace.controller";

describe("Audit Lot 2 — PII Protection, Active Catalog Filtering, Delivery Escrow & Admin RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("M-1: Public Seller Store Profile Projection (Zero PII Leak)", () => {
    it("strips sensitive PII, banking, and MFA fields from users/{sellerId} while preserving public storefront metadata", () => {
      const rawUserDoc = {
        uid: "seller_123",
        email: "private.seller@gmail.com",
        phone: "0550998877",
        phoneNumber: "+213550998877",
        rib: "00799999000123456789",
        nif: "199016100012345",
        nis: "099016100012345",
        commercialRegister: "16/00-1234567B20",
        documents: ["https://storage.googleapis.com/kyc/id.pdf"],
        fcmToken: "secret_fcm_token_1",
        fcmTokens: ["secret_fcm_token_1"],
        verification: { verified: true, code: "123456" },
        is2FAEnabled: true,
        twoFactorSecret: "totp_secret",
        soldes: 450000,
        walletBalance: 450000,
        address: "14 Rue privée Hydra, Alger",
        shopName: "Maison Kabyle Authentique",
        shopDescription: "Artisanat d'excellence",
        wilaya: "15 - Tizi Ouzou",
        logoUrl: "https://olmart.dz/logo.png",
        rating: 4.9,
      };

      const projected = projectPublicStoreProfile("seller_123", { userData: rawUserDoc });

      expect(projected.id).toBe("seller_123");
      expect(projected.shopName).toBe("Maison Kabyle Authentique");
      expect(projected.shopDescription).toBe("Artisanat d'excellence");
      expect(projected.wilaya).toBe("15 - Tizi Ouzou");
      expect(projected.rating).toBe(4.9);

      const forbiddenKeys = [
        "email",
        "phone",
        "phoneNumber",
        "rib",
        "nif",
        "nis",
        "commercialRegister",
        "documents",
        "fcmToken",
        "fcmTokens",
        "verification",
        "is2FAEnabled",
        "twoFactorSecret",
        "soldes",
        "walletBalance",
        "address",
      ];
      for (const key of forbiddenKeys) {
        expect(projected).not.toHaveProperty(key);
      }
    });
  });

  describe("H-6 & M-4: Public Product Catalog Active-Only Filtering & Batch Cap", () => {
    const app = express();
    app.use(express.json());
    app.use(productCatalogRouter);

    it("rejects POST /api/v1/products/batch with more than 50 IDs (M-4)", async () => {
      const tooManyIds = Array.from({ length: 51 }, (_, i) => `prod_${i}`);
      const res = await request(app).post("/api/v1/products/batch").send({ ids: tooManyIds });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain("50");
    });

    it("filters out non-active products (draft, pending, rejected, suspended, archived) in POST /api/v1/products/batch (H-6)", async () => {
      mockCollection.mockImplementation(() => ({
        where: () => ({
          get: vi.fn().mockResolvedValue({
            docs: [
              { id: "p_active", data: () => ({ name: "Produit Actif", status: "active", price: 2500 }) },
              { id: "p_draft", data: () => ({ name: "Brouillon Secret", status: "draft", price: 999 }) },
              { id: "p_rejected", data: () => ({ name: "Produit Rejeté", status: "rejected", price: 1200 }) },
              { id: "p_suspended", data: () => ({ name: "Produit Suspendu", status: "suspended", price: 1500 }) },
            ],
          }),
        }),
      }));

      const res = await request(app)
        .post("/api/v1/products/batch")
        .send({ ids: ["p_active", "p_draft", "p_rejected", "p_suspended"] });

      expect(res.status).toBe(200);
      expect(res.body.products).toHaveLength(1);
      expect(res.body.products[0].id).toBe("p_active");
    });

    it("returns 404 on GET /api/v1/products/:id when product status is not active (H-6)", async () => {
      for (const nonPublicStatus of ["draft", "pending", "rejected", "suspended", "archived"]) {
        mockCollection.mockImplementationOnce(() => ({
          doc: () => ({
            get: vi.fn().mockResolvedValue({
              exists: true,
              id: `prod_${nonPublicStatus}`,
              data: () => ({ name: "Secret Product", status: nonPublicStatus }),
            }),
          }),
        }));

        const res = await request(app).get(`/api/v1/products/prod_${nonPublicStatus}`);
        expect(res.status).toBe(404);
      }
    });
  });

  describe("H-7 & M-11: Unilateral Seller Delivery Block & Partial Restock Update", () => {
    it("blocks seller from marking order as delivered without buyer confirmation or admin role (H-7)", async () => {
      mockCollection.mockImplementation(() => ({
        doc: vi.fn(() => ({
          collection: vi.fn(() => ({ doc: vi.fn(() => "log-ref") })),
        })),
      }));
      mockRunTransaction.mockImplementationOnce(async (callback) => {
        const tx = {
          get: vi.fn(async () => ({
            exists: true,
            data: () => ({
              status: "shipped",
              sellerId: "seller-1",
              sellerIds: ["seller-1"],
              confirmedByBuyer: false,
            }),
          })),
          getAll: vi.fn(async () => []),
          update: vi.fn(),
          set: vi.fn(),
        };
        return callback(tx);
      });

      await expect(
        OrderStatusService.updateOrderStatus({
          orderIds: ["order-1"],
          status: "delivered",
          sellerId: "seller-1",
          isUserAdmin: false,
          authUid: "seller-1",
        })
      ).rejects.toThrow(BusinessError);
    });

    it("allows transition to delivered when buyer has confirmed receipt (H-7)", async () => {
      mockRunTransaction.mockImplementationOnce(async (callback) => {
        const tx = {
          get: vi.fn(async () => ({
            exists: true,
            data: () => ({
              status: "shipped",
              sellerId: "seller-1",
              sellerIds: ["seller-1"],
              confirmedByBuyer: true,
              total: 5000,
              subtotal: 5000,
            }),
          })),
          getAll: vi.fn(async () => []),
          update: vi.fn(),
          set: vi.fn(),
        };
        mockCollection.mockImplementation(() => ({
          doc: vi.fn(() => ({
            collection: vi.fn(() => ({ doc: vi.fn(() => "log-ref") })),
          })),
        }));
        return callback(tx);
      });

      await expect(
        OrderStatusService.updateOrderStatus({
          orderIds: ["order-1"],
          status: "delivered",
          sellerId: "seller-1",
          isUserAdmin: false,
          authUid: "seller-1",
        })
      ).resolves.not.toThrow();
    });

    it("builds a minimal partial product stock update without overwriting price, description, or status (M-11)", () => {
      const fullProductDoc = {
        name: "Manteau Laine",
        price: 12000,
        status: "active",
        description: "Ne doit pas être réécrit",
        stock: 8,
        salesCount: 4,
      };
      const partialUpdate = buildPartialProductStockUpdate(fullProductDoc);
      expect(partialUpdate).toEqual({ stock: 8, salesCount: 4 });
      expect(partialUpdate).not.toHaveProperty("price");
      expect(partialUpdate).not.toHaveProperty("name");
      expect(partialUpdate).not.toHaveProperty("status");
    });
  });

  describe("M-29 & M-12: Admin Sponsorship Packs Authorization", () => {
    it("rejects non-admin authenticated user on GET /api/v1/admin/sponsorship-packs with 403", async () => {
      const app = express();
      app.use((req, _res, next) => {
        (req as unknown as { user: Record<string, unknown> }).user = {
          uid: "buyer_user_1",
          role: "buyer",
          status: "active",
        };
        next();
      });
      app.use(adminWorkspaceRouter);

      const res = await request(app).get("/api/v1/admin/sponsorship-packs");
      expect(res.status).toBe(403);
    });
  });
});
