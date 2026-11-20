import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import adminFirebaseCleanupRouter from "../domains/admin/routes/adminFirebaseCleanup.routes";

interface FakeDoc {
  id: string;
  data: Record<string, unknown>;
}

const collectionsStore = new Map<string, Map<string, Record<string, unknown>>>();
const deletedKeys: string[] = [];

function getCollectionMap(name: string): Map<string, Record<string, unknown>> {
  let map = collectionsStore.get(name);
  if (!map) {
    map = new Map<string, Record<string, unknown>>();
    collectionsStore.set(name, map);
  }
  return map;
}

function makeQuery(name: string, filters: Array<{ field: string; op: string; value: unknown }> = [], lim = 1000) {
  const exec = (): FakeDoc[] => {
    const map = getCollectionMap(name);
    const items: FakeDoc[] = [];
    for (const [id, data] of map.entries()) {
      const ok = filters.every((f) => {
        const val = data[f.field];
        if (f.op === "==") return val === f.value;
        if (f.op === "in" && Array.isArray(f.value)) return f.value.includes(val);
        return true;
      });
      if (ok) items.push({ id, data });
    }
    return items.slice(0, lim);
  };

  return {
    where: (field: string, op: string, value: unknown) =>
      makeQuery(name, [...filters, { field, op, value }], lim),
    limit: (n: number) => makeQuery(name, filters, n),
    get: async () => {
      const docs = exec();
      return {
        size: docs.length,
        empty: docs.length === 0,
        docs: docs.map((d) => ({ id: d.id, data: () => d.data })),
      };
    },
    doc: (id: string) => ({ collection: name, id }),
    add: async (payload: Record<string, unknown>) => {
      const id = `auto_${Math.random().toString(36).slice(2, 8)}`;
      getCollectionMap(name).set(id, payload);
      return { id };
    },
  };
}

vi.mock("../config/firebase-admin", () => ({
  admin: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => "mock-ts",
      },
    },
  },
  db: {
    collection: (name: string) => makeQuery(name),
    batch: () => {
      const pending: Array<{ collection: string; id: string }> = [];
      return {
        delete: (ref: { collection: string; id: string }) => {
          pending.push(ref);
        },
        commit: async () => {
          for (const ref of pending) {
            getCollectionMap(ref.collection).delete(ref.id);
            deletedKeys.push(`${ref.collection}/${ref.id}`);
          }
        },
      };
    },
  },
}));

vi.mock("../middlewares/auth", () => ({
  authenticateToken: (req: Request & { user?: { uid: string; role: string } }, res: Response, next: NextFunction) => {
    if (req.headers.authorization === "Bearer admin-token") {
      req.user = { uid: "admin_uid_1", role: "admin" };
      return next();
    }
    return res.status(401).json({ error: "Unauthorized" });
  },
  authorizeAdmin: (req: Request & { user?: { uid: string; role: string } }, res: Response, next: NextFunction) => {
    if (req.user?.role === "admin") return next();
    return res.status(403).json({ error: "Forbidden" });
  },
}));

describe("Firebase Cleanup Audit & Purge Engine", () => {
  let app: express.Express;

  beforeEach(() => {
    collectionsStore.clear();
    deletedKeys.length = 0;

    // Données réelles protégées
    getCollectionMap("products").set("real_prod_1", {
      name: "Vrai Téléphone Samsung",
      price: 42000,
      sellerId: "real_seller_123",
      status: "active",
    });
    getCollectionMap("auto_parts").set("real_part_1", {
      title: "Alternateur Clio 4",
      sellerId: "real_auto_seller",
      status: "active",
    });
    getCollectionMap("real_estate_properties").set("real_immo_1", {
      title: "Appartement F4 Hydra",
      ownerId: "real_owner_99",
    });

    // Données inutiles / démo / corrompues
    getCollectionMap("products").set("seed_prod_1", {
      name: "Canapé Modular 'Atlas'",
      price: 145000,
      sellerId: "admin_seed",
      isSeed: true,
      status: "active",
    });
    getCollectionMap("products").set("corrupted_prod_1", {
      name: "",
      price: -100,
      sellerId: "some_seller",
      status: "active",
    });
    getCollectionMap("auto_parts").set("seed_part_1", {
      title: "Moteur 2.0 TDI démo",
      sellerId: "seller_moteur_dz",
    });
    getCollectionMap("real_estate_properties").set("PROP-ALG-001", {
      title: "Villa Démo Alger",
      ownerId: "owner_demo_1",
    });
    getCollectionMap("search_logs").set("slog_1", { query: "test" });
    getCollectionMap("site_errors").set("err_1", { message: "403 Forbidden dev" });
    getCollectionMap("_health").set("probe_1", { status: "ok" });
    getCollectionMap("internal_notifications").set("notif_read", { title: "Old", read: true });
    getCollectionMap("internal_notifications").set("notif_unread", { title: "New", read: false });

    app = express();
    app.use(express.json());
    app.use("/api/v1", adminFirebaseCleanupRouter);
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).get("/api/v1/admin/firebase-cleanup/audit");
    expect(res.status).toBe(401);
  });

  it("audits junk data accurately even in production while preserving real records", async () => {
    const prevEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const res = await request(app)
        .get("/api/v1/admin/firebase-cleanup/audit")
        .set("Authorization", "Bearer admin-token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalJunkCount).toBe(8);

      const byId = new Map<string, number>(
        res.body.data.categories.map((c: { id: string; count: number }) => [c.id, c.count])
      );
      expect(byId.get("seed_products")).toBe(1);
      expect(byId.get("corrupted_products")).toBe(1);
      expect(byId.get("seed_auto_parts")).toBe(1);
      expect(byId.get("seed_real_estate")).toBe(1);
      expect(byId.get("search_logs")).toBe(1);
      expect(byId.get("site_errors")).toBe(1);
      expect(byId.get("system_noise")).toBe(1);
      expect(byId.get("read_notifications")).toBe(1);
    } finally {
      process.env.NODE_ENV = prevEnv;
    }
  });

  it("purges ONLY selected junk categories and never deletes real products or unread notifications", async () => {
    const res = await request(app)
      .post("/api/v1/admin/firebase-cleanup/purge")
      .set("Authorization", "Bearer admin-token")
      .send({
        categories: [
          "seed_products",
          "corrupted_products",
          "seed_auto_parts",
          "seed_real_estate",
          "search_logs",
          "site_errors",
          "system_noise",
          "read_notifications",
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDeleted).toBe(8);

    // Les vraies données sont intactes
    expect(getCollectionMap("products").has("real_prod_1")).toBe(true);
    expect(getCollectionMap("auto_parts").has("real_part_1")).toBe(true);
    expect(getCollectionMap("real_estate_properties").has("real_immo_1")).toBe(true);
    expect(getCollectionMap("internal_notifications").has("notif_unread")).toBe(true);

    // Les données inutiles ont disparu
    expect(getCollectionMap("products").has("seed_prod_1")).toBe(false);
    expect(getCollectionMap("products").has("corrupted_prod_1")).toBe(false);
    expect(getCollectionMap("auto_parts").has("seed_part_1")).toBe(false);
    expect(getCollectionMap("real_estate_properties").has("PROP-ALG-001")).toBe(false);
    expect(getCollectionMap("search_logs").size).toBe(0);
    expect(getCollectionMap("site_errors").size).toBe(0);
    expect(getCollectionMap("_health").size).toBe(0);
    expect(getCollectionMap("internal_notifications").has("notif_read")).toBe(false);
  });

  it("rejects empty or invalid category arrays with 400", async () => {
    const res = await request(app)
      .post("/api/v1/admin/firebase-cleanup/purge")
      .set("Authorization", "Bearer admin-token")
      .send({ categories: ["users"] });

    expect(res.status).toBe(400);
  });
});
