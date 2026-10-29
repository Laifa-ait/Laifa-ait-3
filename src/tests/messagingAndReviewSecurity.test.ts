import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { NextFunction, Response } from "express";
import request from "supertest";
import type { CollectionReference } from "firebase-admin/firestore";
import { db } from "../config/firebase-admin";
import { AuthenticatedRequest, setUserProfileInCache, clearUserProfileCache } from "../middlewares/auth";
import orderChatRoutes from "../domains/messaging/orderChat.routes";
import authUserDataRoutes from "../domains/auth/authUserData.routes";
import { ReviewService } from "../domains/review/review.service";
import type { IReviewRepository } from "../domains/review/review.repository";
import type { ReviewDocument } from "../domains/review/review.types";

describe("Security Audit — Messaging IDOR, Review Ownership & User Data Hardening", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "test";
    clearUserProfileCache();
    vi.restoreAllMocks();
  });

  const createTestAppWithUser = (user: { uid: string; role: string; status?: string }) => {
    const app = express();
    app.use(express.json());
    app.use((req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
      req.user = {
        uid: user.uid,
        role: user.role,
        status: user.status || "active",
      };
      next();
    });
    app.use(orderChatRoutes);
    app.use("/api/v1", authUserDataRoutes);
    return app;
  };

  describe("1. Order Chat Anti-IDOR (POST /api/v1/messages/report & GET /api/v1/orders/:orderId/chat)", () => {
    it("denies 403 when an unrelated user attempts to report a message in another user's order", async () => {
      const mockOrderDocGet = vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({
          buyerId: "buyer_legit_1",
          sellerId: "seller_legit_2",
        }),
      });
      const mockDoc = vi.fn().mockReturnValue({ get: mockOrderDocGet });
      vi.spyOn(db, "collection").mockReturnValue({ doc: mockDoc } as unknown as CollectionReference);

      const app = createTestAppWithUser({ uid: "attacker_user_999", role: "buyer" });

      const res = await request(app)
        .post("/api/v1/messages/report")
        .send({ orderId: "order_abc_123", messageId: "msg_xyz_456" });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("Accès refusé");
    });

    it("allows 200 when the legitimate buyer reports a message in their order", async () => {
      const mockMsgUpdate = vi.fn().mockResolvedValueOnce(undefined);
      const mockMsgGet = vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ text: "Suspicious content" }),
      });
      const mockMsgDoc = vi.fn().mockReturnValue({
        get: mockMsgGet,
        update: mockMsgUpdate,
      });
      const mockOrderGet = vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({
          buyerId: "buyer_legit_1",
          sellerId: "seller_legit_2",
        }),
      });
      const mockOrderDoc = vi.fn().mockReturnValue({
        get: mockOrderGet,
        collection: vi.fn().mockReturnValue({ doc: mockMsgDoc }),
      });
      const mockAlertAdd = vi.fn().mockResolvedValueOnce({ id: "alert_1" });

      vi.spyOn(db, "collection").mockImplementation(((colName: string) => {
        if (colName === "admin_alerts") {
          return { add: mockAlertAdd } as unknown as CollectionReference;
        }
        return { doc: mockOrderDoc } as unknown as CollectionReference;
      }) as typeof db.collection);

      const app = createTestAppWithUser({ uid: "buyer_legit_1", role: "buyer" });

      const res = await request(app)
        .post("/api/v1/messages/report")
        .send({ orderId: "order_abc_123", messageId: "msg_xyz_456" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockMsgUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          flagged: true,
          flaggedBy: "buyer_legit_1",
        })
      );
      expect(mockAlertAdd).toHaveBeenCalled();
    });

    it("rejects malformed orderId or messageId containing injection characters with 400", async () => {
      const app = createTestAppWithUser({ uid: "buyer_legit_1", role: "buyer" });

      const res = await request(app)
        .post("/api/v1/messages/report")
        .send({ orderId: "order/../etc", messageId: "msg_123" });

      expect(res.status).toBe(400);
    });

    it("denies 403 when an unrelated user tries to read messages of another user's order", async () => {
      const mockOrderGet = vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({
          buyerId: "buyer_legit_1",
          sellerId: "seller_legit_2",
        }),
      });
      const mockOrderDoc = vi.fn().mockReturnValue({ get: mockOrderGet });
      vi.spyOn(db, "collection").mockReturnValue({ doc: mockOrderDoc } as unknown as CollectionReference);

      const app = createTestAppWithUser({ uid: "attacker_user_999", role: "buyer" });

      const res = await request(app).get("/api/v1/orders/order_abc_123/chat");
      expect(res.status).toBe(403);
    });
  });

  describe("2. Review Reply Anti-IDOR (ReviewService.replyToReview)", () => {
    const sampleReview: ReviewDocument = {
      id: "rev_1",
      orderId: "ord_1",
      productId: "prod_owned_by_seller_A",
      userId: "buyer_1",
      userName: "Amine",
      rating: 5,
      comment: "Très bon produit",
      images: [],
      status: "approved",
      flags: 0,
    };

    const createMockRepo = (): IReviewRepository => ({
      getReview: vi.fn().mockResolvedValue(sampleReview),
      addReview: vi.fn().mockResolvedValue(undefined),
      updateReview: vi.fn().mockResolvedValue(undefined),
      reportReview: vi.fn().mockResolvedValue(undefined),
      addReply: vi.fn().mockResolvedValue(undefined),
      approveReview: vi.fn().mockResolvedValue(undefined),
      deleteReview: vi.fn().mockResolvedValue(undefined),
      listAdminReviews: vi.fn().mockResolvedValue({ reviews: [], total: 0, flaggedCount: 0, avgRating: 0 }),
    });

    it("blocks seller_B from replying to a review on a product owned by seller_A", async () => {
      const repo = createMockRepo();
      const service = new ReviewService(repo);

      const mockProductGet = vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ sellerId: "seller_A", title: "Laptop Pro" }),
      });
      vi.spyOn(db, "collection").mockReturnValue({
        doc: vi.fn().mockReturnValue({ get: mockProductGet }),
      } as unknown as CollectionReference);

      await expect(
        service.replyToReview("rev_1", "seller_B_attacker", "Merci pour votre achat !", false)
      ).rejects.toThrow("Accès refusé");

      expect(repo.addReply).not.toHaveBeenCalled();
    });

    it("allows the legitimate product owner seller_A to reply to the review", async () => {
      const repo = createMockRepo();
      const service = new ReviewService(repo);

      const mockProductGet = vi.fn().mockResolvedValueOnce({
        exists: true,
        data: () => ({ sellerId: "seller_A", title: "Laptop Pro" }),
      });
      vi.spyOn(db, "collection").mockReturnValue({
        doc: vi.fn().mockReturnValue({ get: mockProductGet }),
      } as unknown as CollectionReference);

      const result = await service.replyToReview("rev_1", "seller_A", "Merci beaucoup pour votre retour !", false);
      expect(result.success).toBe(true);
      expect(repo.addReply).toHaveBeenCalledWith("rev_1", {
        sellerId: "seller_A",
        text: "Merci beaucoup pour votre retour !",
      });
    });
  });

  describe("3. Profile Secret Stripping & Cart/Wishlist Payload Bounds", () => {
    it("strips twoFactorSecret, mfaSecret, otpSecret, and internalNotes from GET /api/v1/profile", async () => {
      setUserProfileInCache("user_sec_1", {
        uid: "user_sec_1",
        displayName: "Karim",
        role: "buyer",
        status: "active",
        twoFactorSecret: "JBSWY3DPEHPK3PXP",
        mfaSecret: "SECRET_MFA_KEY",
        otpSecret: "SECRET_OTP_KEY",
        internalNotes: "Internal fraud watch note",
      });

      const app = createTestAppWithUser({ uid: "user_sec_1", role: "buyer" });
      const res = await request(app).get("/api/v1/profile");

      expect(res.status).toBe(200);
      expect(res.body.displayName).toBe("Karim");
      expect(res.body.twoFactorSecret).toBeUndefined();
      expect(res.body.mfaSecret).toBeUndefined();
      expect(res.body.otpSecret).toBeUndefined();
      expect(res.body.internalNotes).toBeUndefined();
    });

    it("rejects oversized cart (> 100 items) and wishlist (> 200 items) payloads with 400", async () => {
      const app = createTestAppWithUser({ uid: "user_sec_1", role: "buyer" });

      const oversizedCart = Array.from({ length: 101 }, (_, i) => ({ id: `prod_${i}`, qty: 1 }));
      const cartRes = await request(app).post("/api/v1/cart").send({ items: oversizedCart });
      expect(cartRes.status).toBe(400);

      const oversizedWishlist = Array.from({ length: 201 }, (_, i) => `prod_${i}`);
      const wishRes = await request(app).post("/api/v1/wishlist").send({ items: oversizedWishlist });
      expect(wishRes.status).toBe(400);
    });
  });
});
