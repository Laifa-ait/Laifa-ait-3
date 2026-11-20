import { db } from "../../../config/firebase-admin";
import { CleanupCategoryId, CleanupCollectorResult, CleanupTargetDoc } from "../../../types/firebaseCleanup";
import { SEED_PRODUCTS } from "../routes/adminSeed.routes";
import { SEED_REAL_ESTATE_PROPERTIES } from "../../realEstate/data/realEstateSeed";
import {
  collectAnalyticsAndExpiredKeys,
  collectDuplicateShadowCollections,
  collectObsoleteLegacyCollections,
  collectWriteOnlyBloatCollections,
} from "./firebaseObsoleteCollectors";

const MAX_DOCS_PER_CATEGORY = 500;
const SEED_AUTO_SELLER_IDS = ["seller_moteur_dz", "seller_optique_oran", "casse_setif_pro"];
const SEED_PRODUCT_NAMES = new Set<string>([
  ...SEED_PRODUCTS.map((p) => p.name),
  "Machine à Café Espresso DZ Pro",
]);
const SEED_OFFICIAL_SELLER_NAMES = new Set<string>([
  "Boutique Officielle",
  "Boutique Officielle Olmart",
]);
const SEED_REAL_ESTATE_IDS = new Set<string>(SEED_REAL_ESTATE_PROPERTIES.map((p) => p.id));

function addTarget(map: Map<string, CleanupTargetDoc>, collection: string, id: string, label: string): void {
  const key = `${collection}/${id}`;
  if (!map.has(key) && map.size < MAX_DOCS_PER_CATEGORY) {
    map.set(key, { collection, id, label });
  }
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

async function collectSeedProducts(): Promise<CleanupCollectorResult> {
  const targets = new Map<string, CleanupTargetDoc>();
  const productsCol = db.collection("products");

  const [bySeller, byIsSeed, byIsDemo, byDeleted] = await Promise.all([
    productsCol.where("sellerId", "==", "admin_seed").limit(MAX_DOCS_PER_CATEGORY).get(),
    productsCol.where("isSeed", "==", true).limit(MAX_DOCS_PER_CATEGORY).get(),
    productsCol.where("isDemo", "==", true).limit(MAX_DOCS_PER_CATEGORY).get(),
    productsCol.where("status", "==", "deleted").limit(MAX_DOCS_PER_CATEGORY).get(),
  ]);

  for (const snap of [bySeller, byIsSeed, byIsDemo, byDeleted]) {
    for (const doc of snap.docs) {
      const data = doc.data() as Record<string, unknown>;
      const label = asString(data.name || data.title, doc.id);
      addTarget(targets, "products", doc.id, label);
    }
  }

  // Vérifier les anciens produits de démonstration créés sans sellerId = admin_seed
  const officialSnap = await productsCol
    .where("sellerName", "in", Array.from(SEED_OFFICIAL_SELLER_NAMES))
    .limit(100)
    .get();
  for (const doc of officialSnap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const name = asString(data.name || data.title);
    if (SEED_PRODUCT_NAMES.has(name)) {
      addTarget(targets, "products", doc.id, name);
    }
  }

  const list = Array.from(targets.values());
  return { targets: list, truncated: list.length >= MAX_DOCS_PER_CATEGORY };
}

async function collectCorruptedProducts(): Promise<CleanupCollectorResult> {
  const targets = new Map<string, CleanupTargetDoc>();
  const snap = await db.collection("products").limit(250).get();

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const status = asString(data.status);
    if (status === "deleted" || data.sellerId === "admin_seed" || data.isSeed === true || data.isDemo === true) {
      continue;
    }
    const name = asString(data.name).trim();
    const title = asString(data.title).trim();
    const missingName = name.length === 0 && title.length === 0;
    const rawPrice = data.price;
    const invalidPrice =
      rawPrice !== undefined &&
      (typeof rawPrice !== "number" || !Number.isFinite(rawPrice) || rawPrice < 0);

    if (missingName || invalidPrice) {
      const reason = missingName ? "Sans nom" : `Prix invalide (${String(rawPrice)})`;
      addTarget(targets, "products", doc.id, `${name || title || doc.id} — ${reason}`);
    }
  }

  const list = Array.from(targets.values());
  return { targets: list, truncated: false };
}

async function collectSeedAutoParts(): Promise<CleanupCollectorResult> {
  const targets = new Map<string, CleanupTargetDoc>();
  const col = db.collection("auto_parts");

  const [bySeller, bySeed] = await Promise.all([
    col.where("sellerId", "in", SEED_AUTO_SELLER_IDS).limit(MAX_DOCS_PER_CATEGORY).get(),
    col.where("isSeed", "==", true).limit(MAX_DOCS_PER_CATEGORY).get(),
  ]);

  for (const snap of [bySeller, bySeed]) {
    for (const doc of snap.docs) {
      const data = doc.data() as Record<string, unknown>;
      addTarget(targets, "auto_parts", doc.id, asString(data.title, doc.id));
    }
  }

  const list = Array.from(targets.values());
  return { targets: list, truncated: list.length >= MAX_DOCS_PER_CATEGORY };
}

async function collectSeedRealEstate(): Promise<CleanupCollectorResult> {
  const targets = new Map<string, CleanupTargetDoc>();
  const snap = await db.collection("real_estate_properties").limit(300).get();

  for (const doc of snap.docs) {
    const data = doc.data() as Record<string, unknown>;
    const ownerId = asString(data.ownerId);
    const isDemoOwner = ownerId.startsWith("owner_demo_");
    const isSeedId = SEED_REAL_ESTATE_IDS.has(doc.id);
    const isSeedFlag = data.isSeed === true || data.isDemo === true;

    if (isDemoOwner || isSeedId || isSeedFlag) {
      addTarget(targets, "real_estate_properties", doc.id, asString(data.title, doc.id));
    }
  }

  const list = Array.from(targets.values());
  return { targets: list, truncated: snap.size >= 300 && list.length >= MAX_DOCS_PER_CATEGORY };
}

async function collectCollectionBatch(collectionName: string, labelField: string): Promise<CleanupCollectorResult> {
  const snap = await db.collection(collectionName).limit(MAX_DOCS_PER_CATEGORY).get();
  const targets: CleanupTargetDoc[] = snap.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    const rawLabel = asString(data[labelField] || data.message || data.action || data.query, doc.id);
    return {
      collection: collectionName,
      id: doc.id,
      label: rawLabel.slice(0, 90),
    };
  });
  return { targets, truncated: snap.size >= MAX_DOCS_PER_CATEGORY };
}

async function collectSystemNoise(): Promise<CleanupCollectorResult> {
  const targets = new Map<string, CleanupTargetDoc>();
  const noiseCollections: Array<{ name: string; labelField: string; limit: number }> = [
    { name: "_health", labelField: "status", limit: 150 },
    { name: "system_locks", labelField: "owner", limit: 150 },
    { name: "category_history", labelField: "action", limit: 150 },
    { name: "admin_activities", labelField: "action", limit: 150 },
  ];

  const snaps = await Promise.all(
    noiseCollections.map((c) => db.collection(c.name).limit(c.limit).get())
  );

  let truncated = false;
  snaps.forEach((snap, idx) => {
    const cfg = noiseCollections[idx];
    if (snap.size >= cfg.limit) truncated = true;
    for (const doc of snap.docs) {
      const data = doc.data() as Record<string, unknown>;
      const detail = asString(data[cfg.labelField] || data.type || data.message, doc.id);
      addTarget(targets, cfg.name, doc.id, `[${cfg.name}] ${detail.slice(0, 70)}`);
    }
  });

  const list = Array.from(targets.values());
  return { targets: list, truncated: truncated || list.length >= MAX_DOCS_PER_CATEGORY };
}

async function collectReadNotifications(): Promise<CleanupCollectorResult> {
  const snap = await db
    .collection("internal_notifications")
    .where("read", "==", true)
    .limit(MAX_DOCS_PER_CATEGORY)
    .get();

  const targets: CleanupTargetDoc[] = snap.docs.map((doc) => {
    const data = doc.data() as Record<string, unknown>;
    return {
      collection: "internal_notifications",
      id: doc.id,
      label: asString(data.title || data.message, doc.id).slice(0, 90),
    };
  });
  return { targets, truncated: snap.size >= MAX_DOCS_PER_CATEGORY };
}

export async function collectTargetsForCategory(categoryId: CleanupCategoryId): Promise<CleanupCollectorResult> {
  switch (categoryId) {
    case "obsolete_legacy_collections":
      return collectObsoleteLegacyCollections();
    case "duplicate_shadow_collections":
      return collectDuplicateShadowCollections();
    case "write_only_bloat":
      return collectWriteOnlyBloatCollections();
    case "analytics_and_expired_keys":
      return collectAnalyticsAndExpiredKeys();
    case "seed_products":
      return collectSeedProducts();
    case "corrupted_products":
      return collectCorruptedProducts();
    case "seed_auto_parts":
      return collectSeedAutoParts();
    case "seed_real_estate":
      return collectSeedRealEstate();
    case "search_logs":
      return collectCollectionBatch("search_logs", "query");
    case "site_errors":
      return collectCollectionBatch("site_errors", "message");
    case "system_noise":
      return collectSystemNoise();
    case "read_notifications":
      return collectReadNotifications();
  }
}
