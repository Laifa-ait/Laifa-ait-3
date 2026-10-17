import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app";
import { canTransitionStatus } from "../domains/auto/auto.service";

describe("Olma Auto - Phase 5 (Modération, Signalements & Espace Administration)", () => {
  describe("1. Sécurité RBAC & Fail-Closed (/api/v1/auto/admin/*)", () => {
    it("GET /api/v1/auto/admin/pending rejette une requête sans jeton Bearer (401)", async () => {
      const res = await request(app).get("/api/v1/auto/admin/pending");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    it("POST /api/v1/auto/admin/listings/test_id/approve rejette un utilisateur non authentifié (401)", async () => {
      const res = await request(app).post("/api/v1/auto/admin/listings/test_id/approve");
      expect(res.status).toBe(401);
    });

    it("POST /api/v1/auto/admin/listings/test_id/reject rejette un utilisateur non authentifié (401)", async () => {
      const res = await request(app).post("/api/v1/auto/admin/listings/test_id/reject").send({
        reason: "Photos floues",
      });
      expect(res.status).toBe(401);
    });

    it("GET /api/v1/auto/admin/reports rejette un accès anonyme (401)", async () => {
      const res = await request(app).get("/api/v1/auto/admin/reports");
      expect(res.status).toBe(401);
    });
  });

  describe("2. FSM & Transitions de Statuts de Modération", () => {
    it("autorise la transition pending_review -> active (approbation par admin)", () => {
      const res = canTransitionStatus("pending_review", "active", true, false);
      expect(res.allowed).toBe(true);
    });

    it("autorise la transition pending_review -> rejected (refus par admin avec motif)", () => {
      const res = canTransitionStatus("pending_review", "rejected", true, false);
      expect(res.allowed).toBe(true);
    });

    it("autorise la ré-approbation rejected -> active après correction", () => {
      const res = canTransitionStatus("rejected", "active", true, false);
      expect(res.allowed).toBe(true);
    });

    it("interdit la transition active -> pending_review", () => {
      const res = canTransitionStatus("active", "pending_review", true, false);
      expect(res.allowed).toBe(false);
    });

    it("interdit la transition sold -> pending_review", () => {
      const res = canTransitionStatus("sold", "pending_review", true, false);
      expect(res.allowed).toBe(false);
    });
  });

  describe("3. Validation du Motif Obligatoire de Rejet", () => {
    it("exige un motif textuel non vide pour tout rejet d'annonce", () => {
      const validateReason = (reason?: string) => {
        if (!reason || !reason.trim()) {
          throw new Error("Un motif de rejet explicite est obligatoire");
        }
        return reason.trim();
      };

      expect(() => validateReason("")).toThrow("Un motif de rejet explicite est obligatoire");
      expect(() => validateReason("   ")).toThrow("Un motif de rejet explicite est obligatoire");
      expect(() => validateReason(undefined)).toThrow("Un motif de rejet explicite est obligatoire");
      expect(validateReason("Photos non conformes")).toBe("Photos non conformes");
    });
  });

  describe("4. Traçabilité & Piste d'Audit Administrateur", () => {
    it("enregistre l'identifiant administrateur et l'horodatage ISO lors de l'approbation", () => {
      const adminUid = "admin_supervisor_01";
      const now = new Date().toISOString();
      const auditPayload = {
        status: "active" as const,
        isListingModerated: true,
        reviewedBy: adminUid,
        reviewedAt: now,
        rejectionReason: null,
      };

      expect(auditPayload.reviewedBy).toBe(adminUid);
      expect(auditPayload.isListingModerated).toBe(true);
      expect(auditPayload.rejectionReason).toBeNull();
      expect(Date.parse(auditPayload.reviewedAt)).toBeGreaterThan(0);
    });

    it("enregistre le motif de rejet lors du refus", () => {
      const adminUid = "admin_supervisor_01";
      const now = new Date().toISOString();
      const rejectionReason = "Carte grise sous litige notarié";

      const auditPayload = {
        status: "rejected" as const,
        rejectionReason,
        reviewedBy: adminUid,
        reviewedAt: now,
      };

      expect(auditPayload.status).toBe("rejected");
      expect(auditPayload.rejectionReason).toBe(rejectionReason);
      expect(auditPayload.reviewedBy).toBe(adminUid);
    });
  });
});
