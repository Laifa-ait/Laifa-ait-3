import { Response, Router } from "express";
import { AuthenticatedRequest, authenticateToken, authorizeAdmin } from "../../../middlewares/auth";
import { CleanupCategoryId } from "../../../types/firebaseCleanup";
import { safeLogger } from "../../../utils/logger";
import {
  FirebaseCleanupService,
  isValidCleanupCategory,
} from "../services/firebaseCleanup.service";

const router = Router();

/**
 * GET /api/v1/admin/firebase-cleanup/audit
 * Analyse en lecture seule des données inutiles / démo / corrompues dans Firestore.
 */
router.get(
  "/admin/firebase-cleanup/audit",
  authenticateToken,
  authorizeAdmin,
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const report = await FirebaseCleanupService.auditJunkData();
      return res.json({ success: true, data: report });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'audit Firebase";
      safeLogger.error("[FirebaseCleanup] ❌ Erreur audit Firestore", { err: message });
      return res.status(500).json({ error: message });
    }
  }
);

/**
 * POST /api/v1/admin/firebase-cleanup/purge
 * Supprime en lots sécurisés uniquement les catégories de données inutiles sélectionnées.
 */
router.post(
  "/admin/firebase-cleanup/purge",
  authenticateToken,
  authorizeAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const body = req.body as { categories?: unknown };
      if (!Array.isArray(body?.categories) || body.categories.length === 0) {
        return res.status(400).json({
          error: "Veuillez sélectionner au moins une catégorie de données à nettoyer.",
        });
      }

      const validCategories: CleanupCategoryId[] = body.categories.filter(
        (item): item is CleanupCategoryId => typeof item === "string" && isValidCleanupCategory(item)
      );

      if (validCategories.length === 0) {
        return res.status(400).json({
          error: "Aucune catégorie de nettoyage valide fournie.",
        });
      }

      const adminUid = req.user?.uid || "unknown_admin";
      const result = await FirebaseCleanupService.purgeJunkData(validCategories, adminUid);
      return res.json({ success: true, data: result });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erreur lors de la purge Firebase";
      safeLogger.error("[FirebaseCleanup] ❌ Erreur purge Firestore", { err: message });
      return res.status(500).json({ error: message });
    }
  }
);

export default router;
