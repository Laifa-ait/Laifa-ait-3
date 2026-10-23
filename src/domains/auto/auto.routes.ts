import { Router } from "express";
import { autoController } from "./auto.controller";
import { autoPartsController } from "./autoParts.controller";
import { autoAdminController } from "./autoAdmin.controller";
import { authenticateToken, optionalAuthenticateToken, authorizeAdmin } from "../../middlewares/auth";
import { autoContactLimiter } from "../../middlewares/rateLimiters";

export const autoRouter = Router();

// 1. Consultation publique Véhicules (Zéro PII)
autoRouter.get("/listings", autoController.getPublicListings);
autoRouter.get("/listings/:id", autoController.getPublicListingById);

// 2. Dévoilement de contact sécurisé Véhicules
autoRouter.post("/listings/:id/contact", optionalAuthenticateToken, autoContactLimiter, autoController.revealContact);

// 3. Espace personnel & gestion vendeur Véhicules
autoRouter.get("/my-listings", authenticateToken, autoController.getMyListings);
autoRouter.post("/listings", authenticateToken, autoController.createListing);
autoRouter.put("/listings/:id", authenticateToken, autoController.updateListing);
autoRouter.post("/listings/:id/status", authenticateToken, autoController.changeStatus);

// 4. Signalement d'annonce Véhicules
autoRouter.post("/listings/:id/report", authenticateToken, autoController.reportListing);

// 5. Pièces Détachées & Casse Automobile (Phase 4)
autoRouter.get("/parts", autoPartsController.listParts);
autoRouter.get("/parts/:id", autoPartsController.getPartById);
autoRouter.post("/parts/:id/contact", optionalAuthenticateToken, autoContactLimiter, autoPartsController.revealPartContact);
autoRouter.post("/parts", authenticateToken, autoPartsController.createPart);

// 6. Espace Administration & Modération (Phase 5 - RBAC Admin Strict)
autoRouter.get("/admin/pending", authenticateToken, authorizeAdmin, autoAdminController.getPending);
autoRouter.post("/admin/listings/:id/approve", authenticateToken, authorizeAdmin, autoAdminController.approve);
autoRouter.post("/admin/listings/:id/reject", authenticateToken, authorizeAdmin, autoAdminController.reject);
autoRouter.post("/admin/listings/:id/verify-badge", authenticateToken, authorizeAdmin, autoAdminController.toggleVerified);
autoRouter.get("/admin/reports", authenticateToken, authorizeAdmin, autoAdminController.getReports);
autoRouter.post("/admin/reports/:id/dismiss", authenticateToken, authorizeAdmin, autoAdminController.dismissReport);


