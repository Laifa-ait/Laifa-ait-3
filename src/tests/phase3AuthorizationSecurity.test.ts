import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import { authorizePropertyOwner, AuthenticatedRequest } from "../middlewares/auth";
import { ROLES, ALL_ROLES } from "../constants/roles";
import { Response, NextFunction } from "express";

// In-memory test store for admin system tests
const testUsersStore = new Map<string, Record<string, unknown>>();

const mockAuthDeleteUser = vi.fn().mockResolvedValue(undefined);
const mockAuthRevokeRefreshTokens = vi.fn().mockResolvedValue(undefined);
const mockAuthUpdateUser = vi.fn().mockResolvedValue(undefined);

vi.mock("../config/firebase-admin", () => {
  return {
    admin: {
      auth: () => ({
        deleteUser: mockAuthDeleteUser,
        revokeRefreshTokens: mockAuthRevokeRefreshTokens,
        updateUser: mockAuthUpdateUser,
      }),
      firestore: {
        FieldValue: {
          serverTimestamp: () => "mock-server-timestamp",
        },
      },
    },
    db: {
      collection: (colName: string) => {
        if (colName === "users") {
          return {
            doc: (docId: string) => ({
              get: vi.fn().mockImplementation(async () => {
                const data = testUsersStore.get(docId);
                return {
                  exists: Boolean(data),
                  id: docId,
                  data: () => data,
                };
              }),
              set: vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
                testUsersStore.set(docId, data);
              }),
              update: vi.fn().mockImplementation(async (data: Record<string, unknown>) => {
                const existing = testUsersStore.get(docId) || {};
                testUsersStore.set(docId, { ...existing, ...data });
              }),
              delete: vi.fn().mockImplementation(async () => {
                testUsersStore.delete(docId);
              }),
            }),
            where: vi.fn().mockReturnThis(),
            limit: (limitCount: number) => ({
              get: vi.fn().mockImplementation(async () => {
                const entries = Array.from(testUsersStore.entries()).slice(0, limitCount);
                return {
                  docs: entries.map(([id, data]) => ({
                    id,
                    data: () => data,
                  })),
                };
              }),
            }),
            get: vi.fn().mockImplementation(async () => {
              const entries = Array.from(testUsersStore.entries());
              return {
                docs: entries.map(([id, data]) => ({
                  id,
                  data: () => data,
                })),
              };
            }),
          };
        }

        // audit_logs or other collections
        return {
          add: vi.fn().mockResolvedValue({ id: "audit-log-1" }),
          limit: vi.fn().mockReturnThis(),
          get: vi.fn().mockResolvedValue({ docs: [], size: 0, empty: true }),
        };
      },
      batch: () => ({
        delete: vi.fn(),
        update: vi.fn(),
        commit: vi.fn().mockResolvedValue(true),
      }),
    },
  };
});

// Import router after mocking firebase-admin
import adminSystemRouter from "../domains/admin/routes/adminSystem.routes";

const firestoreRulesContent = fs.readFileSync(path.resolve(process.cwd(), "firestore.rules"), "utf8");
const storageRulesContent = fs.readFileSync(path.resolve(process.cwd(), "storage.rules"), "utf8");

describe("Phase 3: Authorization, Rules & RBAC Security Verification", () => {
  let app: express.Express;

  beforeEach(() => {
    testUsersStore.clear();
    mockAuthDeleteUser.mockClear();
    mockAuthRevokeRefreshTokens.mockClear();

    // Populate test users
    testUsersStore.set("test_admin", {
      role: "admin",
      status: "active",
      displayName: "Admin Test",
      email: "admin@olmart.dz",
    });

    testUsersStore.set("test_superadmin", {
      role: "superadmin",
      status: "active",
      displayName: "Super Admin Test",
      email: "superadmin@olmart.dz",
    });

    testUsersStore.set("test_buyer", {
      role: "buyer",
      status: "active",
      displayName: "Buyer Test",
      email: "buyer@olmart.dz",
    });

    testUsersStore.set("test_seller", {
      role: "seller",
      status: "active",
      displayName: "Seller Test",
      email: "seller@olmart.dz",
    });

    testUsersStore.set("user_with_sensitive_pii", {
      role: "seller",
      status: "active",
      displayName: "Boutique Sensible",
      email: "seller_pii@olmart.dz",
      rib: "00799999000123456789",
      nif: "123456789012345",
      nifNumber: "123456789012345",
      nifTaxId: "123456789012345",
      nis: "987654321",
      commercialRegister: "16/00-1234567B18",
      rcNumber: "16/00-1234567B18",
      artisanCardNumber: "ART-9999",
      documents: [{ type: "kbis", url: "https://storage/private.pdf" }],
      twoFactorSecret: "JBSWY3DPEHPK3PXP",
      mfa: { enabled: true },
      soldes: 50000,
      balance: 50000,
    });

    app = express();
    app.use(express.json());

    // Test authorization mock middleware setting req.user
    app.use((req, _res, next) => {
      const authHeader = req.headers.authorization;
      const testRole = (req.headers["x-test-role"] as string) || "admin";
      const testUid = (req.headers["x-test-uid"] as string) || "test_admin";

      if (authHeader && authHeader.startsWith("Bearer ")) {
        (req as AuthenticatedRequest).user = {
          uid: testUid,
          role: testRole,
          status: "active",
          adminValidated: testRole === "admin" || testRole === "superadmin",
        };
      }
      next();
    });

    app.use(adminSystemRouter);
  });

  describe("1. Firestore Rules AST & Verification", () => {
    it("interdit formellement l'auto-modification de 'rib', 'email', 'nif*', 'documents', etc.", () => {
      const forbiddenInUsers = [
        "rib",
        "email",
        "nis",
        "commercialRegister",
        "rcNumber",
        "artisanCardNumber",
        "documents",
        "nif",
        "nifNumber",
        "nifTaxId",
      ];

      for (const field of forbiddenInUsers) {
        expect(firestoreRulesContent).toContain(`'${field}'`);
      }

      // Check affectedKeys().hasAny contains rib
      expect(firestoreRulesContent).toMatch(/affectedKeys\(\)\.hasAny\(\[[\s\S]*?'rib'[\s\S]*?\]\)/);

      // Check users allow update hasOnly array does NOT contain rib or email
      const usersUpdateMatch = firestoreRulesContent.match(/match\s+\/users\/\{userId\}[\s\S]*?allow\s+update:[\s\S]*?hasOnly\(\[([\s\S]*?)\]\)/);
      expect(usersUpdateMatch).not.toBeNull();
      const usersHasOnlyContent = usersUpdateMatch![1];
      expect(usersHasOnlyContent).not.toContain("'rib'");
      expect(usersHasOnlyContent).not.toContain("'email'");
      expect(usersHasOnlyContent).not.toContain("'documents'");
      expect(usersHasOnlyContent).not.toContain("'nif'");
      expect(usersHasOnlyContent).not.toContain("'commercialRegister'");
    });

    it("vérifie que match /translations n'a qu'une seule déclaration", () => {
      const matches = firestoreRulesContent.match(/match\s+\/translations\/[a-zA-Z0-9_{}]+/g) || [];
      expect(matches.length).toBe(1);
    });

    it("vérifie que la collection dupliquée public_profiles a été retirée au profit de publicProfiles", () => {
      expect(firestoreRulesContent).toContain("match /publicProfiles/{id}");
      expect(firestoreRulesContent).not.toContain("match /public_profiles/{id}");
    });

    it("impose allow write: if false pour order_logs (écriture serveur uniquement)", () => {
      expect(firestoreRulesContent).toMatch(/match\s+\/order_logs\/\{logId\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false;/);
    });

    it("impose allow write: if false pour withdrawals (création serveur uniquement)", () => {
      expect(firestoreRulesContent).toMatch(/match\s+\/withdrawals\/\{id\}\s*\{[\s\S]*?allow\s+write:\s*if\s+false;/);
    });

    it("vérifie la propriété du produit sur la création dans product_history", () => {
      expect(firestoreRulesContent).toMatch(/match\s+\/product_history\/\{id\}\s*\{[\s\S]*?exists\(\/databases\/\$\(database\)\/documents\/products\/\$\(incoming\(\)\.productId\)\)/);
    });

    it("permet à superadmin d'effectuer toute opération autorisée à admin (superadmin ⊇ admin)", () => {
      expect(firestoreRulesContent).toMatch(/request\.auth\.token\.role\s*==\s*'admin'\s*\|\|\s*request\.auth\.token\.role\s*==\s*'superadmin'/);
      expect(firestoreRulesContent).toMatch(/'admin'\s*in\s*request\.auth\.token\s*&&\s*request\.auth\.token\.admin\s*==\s*true/);
      expect(firestoreRulesContent).toMatch(/'isAdmin'\s*in\s*request\.auth\.token\s*&&\s*request\.auth\.token\.isAdmin\s*==\s*true/);
    });
  });

  describe("2. Storage Rules Verification", () => {
    it("interdit l'upload d'images produits par un simple acheteur (isActiveSeller requis)", () => {
      expect(storageRulesContent).toContain("isActiveSeller()");
      expect(storageRulesContent).toMatch(/match\s+\/products\/\{sellerId\}\/\{type\}\/\{fileName\}\s*\{[\s\S]*?request\.auth\.uid\s*==\s*sellerId\s*&&\s*isActiveSeller\(\)/);
    });

    it("vérifie que superadmin bénéficie des privilèges d'administrateur dans Storage", () => {
      expect(storageRulesContent).toMatch(/request\.auth\.token\.role\s*==\s*'admin'\s*\|\|\s*request\.auth\.token\.role\s*==\s*'superadmin'/);
    });

    it("vérifie les tickets support avec optimisation des métadonnées participantUid pour éviter les lectures Firestore", () => {
      expect(storageRulesContent).toContain("participantUid");
      expect(storageRulesContent).toContain("isTicketParticipant(ticketId)");
    });
  });

  describe("3. GET /admin/users Sanitization & Zod Limits", () => {
    it("ne renvoie plus rib, documents, nif, nis, commercialRegister", async () => {
      const res = await request(app)
        .get("/admin/users")
        .set("Authorization", "Bearer valid_admin_token")
        .set("x-test-role", "admin")
        .set("x-test-uid", "test_admin");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.users)).toBe(true);

      const targetUser = res.body.users.find((u: { id: string }) => u.id === "user_with_sensitive_pii");
      expect(targetUser).toBeDefined();

      // Check strictly stripped fields
      expect(targetUser.rib).toBeUndefined();
      expect(targetUser.documents).toBeUndefined();
      expect(targetUser.nif).toBeUndefined();
      expect(targetUser.nifNumber).toBeUndefined();
      expect(targetUser.nifTaxId).toBeUndefined();
      expect(targetUser.nis).toBeUndefined();
      expect(targetUser.commercialRegister).toBeUndefined();
      expect(targetUser.rcNumber).toBeUndefined();
      expect(targetUser.artisanCardNumber).toBeUndefined();
      expect(targetUser.twoFactorSecret).toBeUndefined();
      expect(targetUser.mfa).toBeUndefined();
      expect(targetUser.soldes).toBeUndefined();
      expect(targetUser.balance).toBeUndefined();

      // Non-sensitive fields should be preserved
      expect(targetUser.displayName).toBe("Boutique Sensible");
      expect(targetUser.role).toBe("seller");
      expect(targetUser.status).toBe("active");
    });

    it("valide limit via Zod (rejette limit > 100)", async () => {
      const res = await request(app)
        .get("/admin/users?limit=150")
        .set("Authorization", "Bearer valid_admin_token")
        .set("x-test-role", "admin")
        .set("x-test-uid", "test_admin");

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("Paramètres de requête invalides");
    });
  });

  describe("4. DELETE /admin/users/:id Role Hierarchy & Self-Action Guard", () => {
    it("interdit formellement à un administrateur de supprimer son propre compte", async () => {
      const res = await request(app)
        .delete("/admin/users/test_admin")
        .set("Authorization", "Bearer valid_admin_token")
        .set("x-test-role", "admin")
        .set("x-test-uid", "test_admin");

      expect(res.status).toBe(400);
      expect(res.body.error).toContain("supprimer votre propre compte");
    });

    it("interdit à un admin standard de supprimer un superadmin", async () => {
      const res = await request(app)
        .delete("/admin/users/test_superadmin")
        .set("Authorization", "Bearer valid_admin_token")
        .set("x-test-role", "admin")
        .set("x-test-uid", "test_admin");

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("rôle supérieur ou équivalent");
    });

    it("autorise un superadmin à supprimer un compte utilisateur ordinaire", async () => {
      const res = await request(app)
        .delete("/admin/users/test_buyer")
        .set("Authorization", "Bearer valid_admin_token")
        .set("x-test-role", "superadmin")
        .set("x-test-uid", "test_superadmin");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      expect(testUsersStore.has("test_buyer")).toBe(false);
      expect(mockAuthDeleteUser).toHaveBeenCalledWith("test_buyer");
    });
  });

  describe("5. Capabilities & Suspended Account Protection", () => {
    it("refuse l'accès à un utilisateur suspendu même s'il possède la capability", () => {
      let nextCalled = false;
      const req = {
        user: {
          uid: "suspended_user_1",
          role: "suspended",
          status: "suspended",
          capabilities: ["property_owner"],
        },
      } as unknown as AuthenticatedRequest;

      let statusCode = 0;
      let jsonPayload: unknown = null;
      const res = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (payload: unknown) => {
              jsonPayload = payload;
            },
          };
        },
      } as unknown as Response;

      const next = (() => {
        nextCalled = true;
      }) as NextFunction;

      authorizePropertyOwner(req, res, next);

      expect(nextCalled).toBe(false);
      expect(statusCode).toBe(403);
      expect(jsonPayload).toMatchObject({ error: expect.stringContaining("suspendu") });
    });

    it("autorise un utilisateur actif possédant la capability property_owner", () => {
      let nextCalled = false;
      const req = {
        user: {
          uid: "active_user_1",
          role: "buyer",
          status: "active",
          capabilities: ["property_owner"],
        },
      } as unknown as AuthenticatedRequest;

      const res = {} as Response;
      const next = (() => {
        nextCalled = true;
      }) as NextFunction;

      authorizePropertyOwner(req, res, next);
      expect(nextCalled).toBe(true);
    });
  });

  describe("6. Canonical Roles Invariance", () => {
    it("garantit que ROLES contient uniquement les 6 rôles canoniques de l'application", () => {
      expect(ALL_ROLES).toEqual([
        "buyer",
        "seller",
        "artisan",
        "property_owner",
        "admin",
        "superadmin",
      ]);
      expect(ROLES.BUYER).toBe("buyer");
      expect(ROLES.SELLER).toBe("seller");
      expect(ROLES.ARTISAN).toBe("artisan");
      expect(ROLES.PROPERTY_OWNER).toBe("property_owner");
      expect(ROLES.ADMIN).toBe("admin");
      expect(ROLES.SUPERADMIN).toBe("superadmin");
    });
  });
});
