import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { assertAdminCanMutateTargetRole } from "../domains/admin/routes/adminSystem.routes";

const ROOT_DIR = path.resolve(__dirname, "../..");
const FIRESTORE_RULES_PATH = path.join(ROOT_DIR, "firestore.rules");
const STORAGE_RULES_PATH = path.join(ROOT_DIR, "storage.rules");
const ADMIN_SYSTEM_ROUTES_PATH = path.join(ROOT_DIR, "src/domains/admin/routes/adminSystem.routes.ts");

describe("Audit Étapes 1 & 2 — Sécurité Critique (C-02, C-03, C-04, M-02, M-06)", () => {
  const firestoreRules = fs.readFileSync(FIRESTORE_RULES_PATH, "utf-8");
  const storageRules = fs.readFileSync(STORAGE_RULES_PATH, "utf-8");
  const adminSystemSource = fs.readFileSync(ADMIN_SYSTEM_ROUTES_PATH, "utf-8");

  it("C-02: bloque l'auto-activation et l'auto-sponsoring produit par le vendeur dans firestore.rules", () => {
    const productMatchStart = firestoreRules.indexOf("match /products/{productId}");
    const productMatchEnd = firestoreRules.indexOf("// 5. ", productMatchStart);
    const productBlock = firestoreRules.slice(
      productMatchStart,
      productMatchEnd > productMatchStart ? productMatchEnd : productMatchStart + 2200
    );

    const protectedFields = [
      "status",
      "isApproved",
      "moderationStatus",
      "isFeatured",
      "isSponsored",
      "sponsoredUntil",
      "sponsorshipTier",
      "salesCount",
      "reviewCount",
      "flashSaleActive",
      "flashSalePrice",
      "commission",
      "sellerTrustScore",
      "trustScore",
      "rating",
    ];

    for (const field of protectedFields) {
      expect(productBlock).toContain(`'${field}'`);
    }
  });

  it("C-03 & M-06: protège la hiérarchie des rôles (superadmin/admin), interdit l'auto-suppression, exige require2FA et journalise INITIATED -> COMPLETED sur bulk-delete/bulk-status", () => {
    // 1. Auto-ciblage interdit
    const selfAttempt = assertAdminCanMutateTargetRole("admin_1", "admin", "admin_1", "admin");
    expect(selfAttempt.allowed).toBe(false);
    if (!selfAttempt.allowed) {
      expect(selfAttempt.status).toBe(400);
    }

    // 2. Un admin ne peut pas supprimer ou suspendre un superadmin ni un autre admin
    const adminVsSuperadmin = assertAdminCanMutateTargetRole("admin_1", "admin", "super_1", "superadmin");
    expect(adminVsSuperadmin).toEqual({
      allowed: false,
      status: 403,
      error: "Action interdite : vous n'avez pas l'autorisation d'agir sur un rôle supérieur ou équivalent.",
    });

    const adminVsAdmin = assertAdminCanMutateTargetRole("admin_1", "admin", "admin_2", "admin");
    expect(adminVsAdmin.allowed).toBe(false);
    if (!adminVsAdmin.allowed) {
      expect(adminVsAdmin.status).toBe(403);
    }

    // 3. Un superadmin ne peut pas supprimer un autre superadmin
    const superVsSuper = assertAdminCanMutateTargetRole("super_1", "superadmin", "super_2", "superadmin");
    expect(superVsSuper).toEqual({
      allowed: false,
      status: 403,
      error: "Action interdite : impossible de supprimer un superadministrateur.",
    });

    // 4. Un admin peut gérer un buyer/seller, et un superadmin peut gérer un admin
    expect(assertAdminCanMutateTargetRole("admin_1", "admin", "seller_1", "seller")).toEqual({ allowed: true });
    expect(assertAdminCanMutateTargetRole("super_1", "superadmin", "admin_1", "admin")).toEqual({ allowed: true });

    // 5. Vérification statique de require2FA et de la trace d'audit INITIATED -> COMPLETED sur les routes bulk
    expect(adminSystemSource).toContain(
      'router.post("/admin/users/bulk-status", authenticateToken, authorizeAdmin, require2FA'
    );
    expect(adminSystemSource).toContain(
      'router.post("/admin/users/bulk-delete", authenticateToken, authorizeAdmin, require2FA'
    );
    expect(adminSystemSource).toContain(
      'router.delete("/admin/users/:id", authenticateToken, authorizeAdmin, require2FA'
    );
    expect(adminSystemSource).toContain('status: "INITIATED"');
    expect(adminSystemSource).toContain('status: "COMPLETED"');
    expect(adminSystemSource).toContain("userIds.forEach((uid: string) => clearUserProfileCache(uid))");
  });

  it("C-04: impose l'appartenance aux participants (&&) à la création d'un chat et lors de l'envoi d'un message dans firestore.rules", () => {
    const chatsStart = firestoreRules.indexOf("match /chats/{chatId}");
    const chatsBlock = firestoreRules.slice(chatsStart, chatsStart + 2400);

    // Pas de court-circuit || entre userId et participants lors du create
    expect(chatsBlock).toContain(
      "(!('userId' in incoming()) || incoming().userId == request.auth.uid) &&"
    );
    expect(chatsBlock).toContain(
      "('participants' in incoming() && incoming().participants is list && request.auth.uid in incoming().participants)"
    );

    // Envoi de message exige senderId == request.auth.uid ET existence/appartenance au document parent /chats/$(chatId)
    const messagesStart = chatsBlock.indexOf("match /messages/{messageId}");
    const messagesBlock = chatsBlock.slice(messagesStart);
    expect(messagesBlock).toContain("'senderId' in incoming() &&");
    expect(messagesBlock).toContain("incoming().senderId == request.auth.uid &&");
    expect(messagesBlock).toContain("exists(/databases/$(database)/documents/chats/$(chatId))");
  });

  it("M-02: verrouille user_documents.userId, retire followersCount libre sur shops, restreint seller_custom_pages et corrige storage.rules homepage_media", () => {
    expect(firestoreRules).toContain(
      "allow update: if isSignedIn() && (isAdmin() || (resource.data.userId == request.auth.uid && incoming().userId == existing().userId));"
    );
    expect(firestoreRules).not.toContain("incoming().diff(existing()).affectedKeys().hasOnly(['followersCount'])");
    expect(firestoreRules).toContain("(!('status' in incoming()) || incoming().status in ['draft', 'pending'])");
    expect(storageRules).toContain("request.resource.contentType.matches('video/.*')");
    expect(storageRules).not.toContain("request.resource.contentType == 'video/.*'");
  });
});
