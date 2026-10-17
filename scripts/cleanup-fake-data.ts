import { db } from "../src/config/firebase-admin";

async function cleanupFakeData() {
  const args = process.argv.slice(2);
  const isConfirm = args.includes("--confirm");
  const isDryRun = !isConfirm || args.includes("--dry-run");
  const allowProd = args.includes("--i-know-this-is-production");

  // Refuse live deletions outside emulator unless explicitly confirmed with production override
  if (!isDryRun && !process.env.FIRESTORE_EMULATOR_HOST && !allowProd) {
    console.error("❌ Refus de suppression : FIRESTORE_EMULATOR_HOST est absent. La suppression réelle en production nécessite --confirm ET --i-know-this-is-production.");
    process.exit(1);
  }

  console.log("================================================================================");
  console.log(`             🧹 OLMART DATABASE CLEANUP [${isDryRun ? "DRY-RUN MODE" : "LIVE DELETION"}]`);
  if (isDryRun) {
    console.log("             ℹ️ Running in safe preview mode. Pass --confirm to execute deletes.");
  }
  console.log("================================================================================");

  let deletedUsers = 0;
  let deletedPublicProfiles = 0;
  let deletedProducts = 0;

  // 1. Clean Users & PublicProfiles
  const usersSnap = await db.collection("users").get();
  console.log(`Analyzing ${usersSnap.docs.length} users...`);

  for (const doc of usersSnap.docs) {
    const data = doc.data() || {};
    const email = (data.email || "").toLowerCase();
    const name = (data.displayName || data.name || data.shopName || "").toLowerCase();
    const uid = doc.id;

    // Explicit flag targeting with fallback to load test identifiers
    const isFake =
      data.isMock === true ||
      data.isDemo === true ||
      data.isTest === true ||
      name.includes("load test") ||
      name.includes("test merchant") ||
      email.includes("loadtest") ||
      email.includes("testmerchant") ||
      email.includes("fake@");

    if (isFake) {
      console.log(`🗑️ [${isDryRun ? "WOULD DELETE" : "DELETING"}] fake user: [${uid}] ${name} (${email})`);
      if (!isDryRun) {
        await db.collection("users").doc(uid).delete();
      }
      deletedUsers++;

      // Delete associated publicProfile if exists
      const pubDoc = await db.collection("publicProfiles").doc(uid).get();
      if (pubDoc.exists) {
        if (!isDryRun) {
          await db.collection("publicProfiles").doc(uid).delete();
        }
        deletedPublicProfiles++;
      }

      // Delete products belonging to this fake seller
      const sellerProds = await db.collection("products").where("sellerId", "==", uid).get();
      for (const p of sellerProds.docs) {
        console.log(`   🗑️ [${isDryRun ? "WOULD DELETE" : "DELETING"}] fake seller product: [${p.id}] ${p.data()?.title}`);
        if (!isDryRun) {
          await db.collection("products").doc(p.id).delete();
        }
        deletedProducts++;
      }
    }
  }

  // 2. Clean orphaned or fake publicProfiles
  const pubSnap = await db.collection("publicProfiles").get();
  for (const doc of pubSnap.docs) {
    const data = doc.data() || {};
    const name = (data.shopName || data.name || "").toLowerCase();
    const isFake =
      data.isMock === true ||
      data.isDemo === true ||
      data.isTest === true ||
      name.includes("load test") ||
      name.includes("test merchant");

    if (isFake) {
      console.log(`🗑️ [${isDryRun ? "WOULD DELETE" : "DELETING"}] fake publicProfile: [${doc.id}] ${name}`);
      if (!isDryRun) {
        await db.collection("publicProfiles").doc(doc.id).delete();
      }
      deletedPublicProfiles++;
    }
  }

  // 3. Clean fake/test products
  const prodsSnap = await db.collection("products").get();
  console.log(`Analyzing ${prodsSnap.docs.length} products...`);

  for (const doc of prodsSnap.docs) {
    const data = doc.data() || {};
    const title = (data.title || data.name || "").toLowerCase();
    const description = (data.description || "").toLowerCase();

    const isFakeProduct =
      data.isMock === true ||
      data.isDemo === true ||
      data.isTest === true ||
      title.includes("test product") ||
      title.includes("load test") ||
      description.includes("load test generated");

    if (isFakeProduct) {
      console.log(`🗑️ [${isDryRun ? "WOULD DELETE" : "DELETING"}] fake product: [${doc.id}] ${data.title}`);
      if (!isDryRun) {
        await db.collection("products").doc(doc.id).delete();
      }
      deletedProducts++;
    }
  }

  console.log("================================================================================");
  console.log(`✅ CLEANUP SUMMARY [${isDryRun ? "DRY RUN - 0 DELETED" : "COMPLETED"}]:`);
  console.log(`   - Fake Users ${isDryRun ? "Identified" : "Deleted"}: ${deletedUsers}`);
  console.log(`   - Fake Public Profiles ${isDryRun ? "Identified" : "Deleted"}: ${deletedPublicProfiles}`);
  console.log(`   - Fake Products ${isDryRun ? "Identified" : "Deleted"}: ${deletedProducts}`);
  console.log("================================================================================");
}

cleanupFakeData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  });
