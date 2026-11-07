import { Response, Router } from "express";
import { authenticateToken, authorizeAdmin, AuthenticatedRequest } from "../../../middlewares/auth";
import { ProductApprovalSchema } from "../../../validators/adminValidators";
import { AdminProductService } from "../services/adminProduct.service";
import { safeLogger } from "../../../utils/logger";

const router = Router();

// Tags management
router.get("/tags", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tags = await AdminProductService.listTags();
    res.json({ success: true, tags });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

router.post("/tags", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: "Name and slug required" });
    const tag = await AdminProductService.createTag({ name, slug });
    res.json({ success: true, tag });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

router.delete("/tags/:id", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await AdminProductService.deleteTag(req.params.id);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: List Products for Moderation
router.get("/admin/products", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = (req.query.status as "pending" | "active" | "rejected" | "pending_deletion") || "pending";
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;
    const startAfter = req.query.startAfter as string | undefined;
    const category = req.query.category as string | undefined;

    const result = await AdminProductService.listProducts({
      status,
      limit,
      startAfter,
      category,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// Recalculate Product Quality Scores
router.post("/admin/products/recalculate-scores", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminId = req.user?.uid || "";
    const result = await AdminProductService.recalculateProductScores({ adminId });
    res.json({ success: true, count: result.count });
  } catch (error: unknown) {
    safeLogger.error("Error recalculating quality scores", { err: error instanceof Error ? error.message : String(error) });
    const message = error instanceof Error ? error.message : "Erreur serveur";
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Approve Product
router.post("/admin/products/:id/approve", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const parsed = ProductApprovalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0].message });
  }

  const productId = req.params.id;
  const adminId = req.user?.uid || "";

  try {
    const result = await AdminProductService.approveProduct({ productId, adminId });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Produit non trouvé") {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    if (message.startsWith("Validation impossible")) {
      return res.status(400).json({ error: message });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Reject Product
router.post("/admin/products/:id/reject", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  let rejectionReasons: string[] = [];
  let comment: string | undefined = undefined;

  if (Array.isArray(req.body.rejectionReasons) && req.body.rejectionReasons.length > 0) {
    rejectionReasons = req.body.rejectionReasons;
    comment = req.body.comment;
  } else if (typeof req.body.reason === "string" && req.body.reason.trim().length > 0) {
    rejectionReasons = [req.body.reason.trim()];
    comment = req.body.comment || req.body.reason.trim();
  } else {
    return res.status(400).json({ error: "Au moins une raison de rejet est requise" });
  }

  const productId = req.params.id;
  const adminId = req.user?.uid || "";

  try {
    const result = await AdminProductService.rejectProduct({
      productId,
      adminId,
      rejectionReasons,
      comment,
    });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Produit non trouvé") {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Soft Delete Product
router.post("/admin/products/:id/delete", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const productId = req.params.id;
  const adminId = req.user?.uid || "";

  try {
    const result = await AdminProductService.deleteProduct({ productId, adminId });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Produit non trouvé") {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.status(500).json({ error: message });
  }
});

// ADMIN ONLY: Deny Delete Request (Restore/Keep Product Active)
router.post("/admin/products/:id/deny-delete", authenticateToken, authorizeAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const productId = req.params.id;
  const adminId = req.user?.uid || "";

  try {
    const result = await AdminProductService.denyDeleteProduct({ productId, adminId });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    if (message === "Produit non trouvé") {
      return res.status(404).json({ error: "Produit non trouvé" });
    }
    res.status(500).json({ error: message });
  }
});

export default router;
