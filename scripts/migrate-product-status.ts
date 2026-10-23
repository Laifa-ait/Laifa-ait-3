import { db } from "../src/config/firebase-admin";
import { PRODUCT_STATUSES, ProductStatus } from "../src/domains/product/product.status";

/**
 * Normalizes any legacy or inconsistent product status to canonical ProductStatus
 */
export function normalizeLegacyProductStatus(statusRaw: unknown, isPublishedRaw?: unknown): ProductStatus {
  if (typeof statusRaw === "string") {
    const s = statusRaw.trim().toLowerCase();
    if (s === "published" || s === "approved" || s === "active") {
      return PRODUCT_STATUSES.ACTIVE;
    }
    if (s === "pending" || s === "en_attente") {
      return PRODUCT_STATUSES.PENDING;
    }
    if (s === "suspended" || s === "suspendu") {
      return PRODUCT_STATUSES.SUSPENDED;
    }
    if (s === "rejected" || s === "refusé" || s === "refuse") {
      return PRODUCT_STATUSES.REJECTED;
    }
    if (s === "archived" || s === "deleted" || s === "pending_deletion") {
      return PRODUCT_STATUSES.ARCHIVED;
    }
    if (s === "draft" || s === "brouillon") {
      return PRODUCT_STATUSES.DRAFT;
    }
  }

  if (isPublishedRaw === true) {
    return PRODUCT_STATUSES.ACTIVE;
  }

  return PRODUCT_STATUSES.DRAFT;
}

async function migrateProductStatus() {
  const args = process.argv.slice(2);
  const isConfirm = args.includes("--confirm");
  const isDryRun = !isConfirm || args.includes("--dry-run");
  const allowProd = args.includes("--i-know-this-is-production");

  if (!isDryRun && !process.env.FIRESTORE_EMULATOR_HOST && !allowProd) {
    console.error("❌ Refus: modification réelle en production sans émulateur. Utilisez --confirm ET --i-know-this-is-production.");
    process.exit(1);
  }

  console.log("================================================================================");
  console.log(`        📦 OLMART PRODUCT STATUS MIGRATION [${isDryRun ? "DRY-RUN MODE" : "LIVE MIGRATION"}]`);
  if (isDryRun) {
    console.log("        ℹ️ Preview mode only. Pass --confirm to commit updates to Firestore.");
  }
  console.log("================================================================================");

  const snapshot = await db.collection("products").get();
  console.log(`Total products scanned: ${snapshot.docs.length}`);

  let updatedCount = 0;
  let skippedCount = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const currentStatus = data.status;
    const isPublished = data.isPublished;

    const targetStatus = normalizeLegacyProductStatus(currentStatus, isPublished);
    const needsUpdate = currentStatus !== targetStatus || isPublished !== undefined;

    if (needsUpdate) {
      console.log(`Product [${doc.id}]: '${currentStatus}' (isPublished: ${isPublished}) -> '${targetStatus}'`);
      if (!isDryRun) {
        await doc.ref.update({
          status: targetStatus,
          isPublished: null, // clean up legacy field
        });
      }
      updatedCount++;
    } else {
      skippedCount++;
    }
  }

  console.log("================================================================================");
  console.log(`✅ MIGRATION SUMMARY:`);
  console.log(`   - Total scanned: ${snapshot.docs.length}`);
  console.log(`   - ${isDryRun ? "Would update" : "Updated"}: ${updatedCount}`);
  console.log(`   - Already canonical: ${skippedCount}`);
  console.log("================================================================================");
}

if (process.argv[1]?.endsWith("migrate-product-status.ts")) {
  migrateProductStatus()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration error:", err);
      process.exit(1);
    });
}
