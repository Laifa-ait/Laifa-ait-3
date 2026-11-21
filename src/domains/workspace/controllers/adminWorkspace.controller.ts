import { Router, Response } from "express";
import { db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeAdmin, require2FA } from "../../../middlewares/auth";
import { safeLogger } from "../../../utils/logger";
import { SponsorshipPackService } from "../../../services/sponsorshipPackService";
import type { AuthenticatedAdminRequest } from "../types/adminWorkspace.types";
import { AdminWorkspaceService } from "../services/adminWorkspace.service";

const router = Router();
const adminGuards = [authenticateToken, authorizeAdmin, require2FA];

// --- Resolve Dispute ---
router.post("/api/v1/admin/orders/:orderId/resolve-dispute", ...adminGuards, async (req: AuthenticatedAdminRequest, res: Response) => {
  const { orderId } = req.params;
  const { resolution, refundAmount = 0 } = req.body;
  try {
    await AdminWorkspaceService.resolveDispute(orderId, resolution, refundAmount);
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Resolve Dispute Error", { orderId, err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

// --- Admin OCR ---
router.post("/api/v1/admin/sellers/:id/ocr", ...adminGuards, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { documentUrl } = req.body;
    if (!documentUrl) {
      return res.status(400).json({ error: "Missing documentUrl" });
    }
    const parsed = await AdminWorkspaceService.performOcr(documentUrl);
    return res.json({ result: parsed });
  } catch (err: unknown) {
    safeLogger.error("OCR Error", { sellerId: req.params.id, err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

// --- Internal Admin Notifications ---
router.get("/api/v1/admin/notifications", ...adminGuards, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const snap = await db.collection("internal_notifications").orderBy("createdAt", "desc").limit(20).get();
    const notifications = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ notifications });
  } catch (error: unknown) {
    safeLogger.error("Admin notifications error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

router.put("/api/v1/admin/notifications/:id/read", ...adminGuards, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection("internal_notifications").doc(id).update({ read: true });
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Admin notification read error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

router.put("/api/v1/admin/notifications/read-all", ...adminGuards, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const snap = await db.collection("internal_notifications").where("read", "==", false).get();
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
    await batch.commit();
    return res.json({ success: true });
  } catch (error: unknown) {
    safeLogger.error("Admin notifications read-all error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

// --- Workspace Sellers & Orders ---
router.get("/api/v1/admin/workspace/sellers", ...adminGuards, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const sellers = await AdminWorkspaceService.getWorkspaceSellers();
    return res.json({ sellers });
  } catch (error: unknown) {
    safeLogger.error("Workspace sellers error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

router.get("/api/v1/admin/workspace/orders", ...adminGuards, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const targetSeller = req.query.targetSeller as string;
    const rawOrders = await AdminWorkspaceService.getWorkspaceOrders(targetSeller);
    return res.json({ rawOrders });
  } catch (error: unknown) {
    safeLogger.error("Workspace orders error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

router.get("/api/v1/admin/workspace/seller/:id", ...adminGuards, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const result = await AdminWorkspaceService.getWorkspaceSeller(req.params.id);
    return res.json(result);
  } catch (error: unknown) {
    safeLogger.error("Workspace seller detail error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

// --- Sponsorship Packs (M-29 & M-12: authorizeAdmin + require2FA enforced) ---
router.get("/api/v1/admin/sponsorship-packs", ...adminGuards, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const packs = await SponsorshipPackService.getPacks();
    return res.json({ packs });
  } catch (error: unknown) {
    safeLogger.error("Sponsorship packs fetch error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

router.post("/api/v1/admin/sponsorship-packs", ...adminGuards, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { packs } = req.body;
    if (!packs || typeof packs !== "object") {
      return res.status(400).json({ error: "Configuration des packs invalide." });
    }
    await SponsorshipPackService.updatePacks(packs);
    safeLogger.info("Admin updated Sponsorship Packs configuration");
    return res.json({ success: true, message: "Configuration des packs de sponsoring enregistrée avec succès." });
  } catch (error: unknown) {
    safeLogger.error("Sponsorship packs update error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

router.get("/api/v1/admin/sponsorship-requests", ...adminGuards, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const snap = await db.collection("sponsorship_requests").orderBy("requestDate", "desc").limit(100).get();
    const requests = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ requests });
  } catch (error: unknown) {
    safeLogger.error("Sponsorship requests fetch error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

router.post("/api/v1/admin/sponsorship-requests/:id/status", ...adminGuards, async (req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, productId, durationDays = 7 } = req.body;
    if (!["approved", "rejected", "expired"].includes(status)) {
      return res.status(400).json({ error: "Statut invalide. Doit être 'approved', 'rejected' ou 'expired'." });
    }

    const now = new Date();
    const endDate = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    await db.runTransaction(async (transaction) => {
      const reqRef = db.collection("sponsorship_requests").doc(id);
      transaction.update(reqRef, {
        status,
        updatedAt: now,
        ...(status === "approved" ? { approvedAt: now, startDate: now, endDate } : {}),
      });

      if (productId) {
        const prodRef = db.collection("products").doc(productId);
        transaction.update(prodRef, {
          isSponsored: status === "approved",
          ...(status === "approved" ? { sponsoredSince: now, sponsorshipEndDate: endDate } : { sponsorshipEndDate: null }),
        });
      }
    });

    safeLogger.info("Admin updated sponsorship request status", { requestId: id, status });
    return res.json({
      success: true,
      message: `Requête de sponsoring ${status === "approved" ? "approuvée" : status === "rejected" ? "rejetée" : "expirée"} avec succès.`,
    });
  } catch (error: unknown) {
    safeLogger.error("Sponsorship request status update error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

// --- Admin Overview Stats (M-9 lowercase status support) ---
router.get("/api/v1/admin/overview", ...adminGuards, async (_req: AuthenticatedAdminRequest, res: Response) => {
  try {
    const [disputesSnap, pendingSponsorshipsSnap] = await Promise.all([
      db.collection("orders").where("status", "in", ["return_requested", "dispute_open", "RETURN_REQUESTED", "DISPUTE_OPEN"]).get(),
      db.collection("sponsorship_requests").where("status", "==", "pending").get(),
    ]);

    return res.json({
      disputeCount: disputesSnap.size,
      pendingSponsorshipCount: pendingSponsorshipsSnap.size,
      stats: {
        totalSales: 15000,
        activeVendors: 42,
        totalOrders: 150,
        netRevenue: 1500,
        pendingVendors: 5,
        revenueChange: 12,
        ordersChange: 8,
      },
      topProducts: [],
      topSellers: [],
      realTimeTraffic: [],
      adminAlerts: [],
      recentActivities: [],
      recentOrders: [],
      wilayaStats: [],
    });
  } catch (error: unknown) {
    safeLogger.error("Admin overview error", { err: error instanceof Error ? error.message : String(error) });
    return res.status(500).json({ error: "Une erreur interne est survenue." });
  }
});

export default router;
