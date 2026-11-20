import { admin, db } from "../../../config/firebase-admin";
import {
  CleanupAuditReport,
  CleanupCategoryId,
  CleanupCategoryMeta,
  CleanupCategorySummary,
  CleanupPurgeResult,
  CleanupTargetDoc,
} from "../../../types/firebaseCleanup";
import { CoreService } from "../../../services/CoreService";
import { clearProductSearchCache } from "../../../services/ProductSearchService";
import { TrendingSearchesService } from "../../../services/TrendingSearchesService";
import { clearProductCatalogCache } from "../../product/controllers/productCatalog.controller";
import { clearProductStoreCache } from "../../product/controllers/productStore.controller";
import { safeLogger } from "../../../utils/logger";
import { collectTargetsForCategory } from "./firebaseCleanupCollectors";

const BATCH_LIMIT = 400;
const MAX_PURGE_ROUNDS = 15;

export const PROTECTED_COLLECTIONS: string[] = [
  "users",
  "publicProfiles",
  "user_secrets",
  "products",
  "orders",
  "order_masters",
  "reviews",
  "tags",
  "settings",
  "banners",
  "homepage_sections",
  "homepage_categories_v2",
  "store_configs",
  "store_layouts",
  "store_slugs",
  "seller_analytics",
  "subscription_plans",
  "subscription_requests",
  "seller_subscriptions",
  "sponsorship_requests",
  "user_notifications",
  "supportMessages",
  "supportTickets",
  "newsletter_campaigns",
  "newsletter_subscribers",
  "real_estate_properties",
  "artisan_profiles",
  "artisan_offers",
  "artisan_quote_requests",
  "artisan_job_broadcasts",
  "olma_univers_apps",
  "disputes",
  "coupons",
];

export const CLEANUP_CATEGORIES: CleanupCategoryMeta[] = [
  {
    id: "obsolete_legacy_collections",
    title: "Collections obsolètes & orphelines (wilayas, bricolage_*, user_habits...)",
    description:
      "Collections totalement inutilisées par l'application : wilayas (remplacée par constante locale), bricolage_* (ancien module), user_habits, olma_univers_app, payment_we* et anciennes collections newsletter orphelines.",
    collections: ["wilayas", "bricolage_*", "user_habits", "payment_we*", "olma_univers_app"],
    riskLevel: "safe",
  },
  {
    id: "duplicate_shadow_collections",
    title: "Collections doublons jamais lues (notifications, adminActions)",
    description:
      "Doublons obsolètes désormais unifiés dans user_notifications et audit_logs. Plus aucune route n'y écrit.",
    collections: ["notifications", "adminActions"],
    riskLevel: "safe",
  },
  {
    id: "write_only_bloat",
    title: "Collections écriture seule (product_history, confirmed_delivery_info, security_alerts)",
    description:
      "Données redondantes qui n'étaient jamais lues dans l'interface et dont les écritures inutiles ont été coupées pour réduire votre facture Firebase.",
    collections: ["product_history", "confirmed_delivery_info", "security_alerts"],
    riskLevel: "safe",
  },
  {
    id: "analytics_and_expired_keys",
    title: "Événements analytics, clés idempotence expirées (>48h) & textes mensuels",
    description:
      "Purge les logs analytics_events (écritures brutes désormais coupées), les verrous idempotency_keys expirés (>48h) et site_content_monthly en plusieurs lots automatiques.",
    collections: ["analytics_events", "idempotency_keys", "site_content_monthly"],
    riskLevel: "safe",
  },
  {
    id: "seed_products",
    title: "Produits de démonstration & supprimés",
    description: "Faux produits injectés (admin_seed, isSeed, isDemo, Boutique Officielle Olmart) et fiches au statut 'deleted'.",
    collections: ["products"],
    riskLevel: "safe",
  },
  {
    id: "corrupted_products",
    title: "Produits invalides / corrompus",
    description: "Fiches produits sans nom/titre ou avec un prix invalide (négatif ou non numérique).",
    collections: ["products"],
    riskLevel: "moderate",
  },
  {
    id: "seed_auto_parts",
    title: "Pièces auto de démonstration (Olma Auto)",
    description: "Annonces auto-générées par les comptes fictifs seller_moteur_dz, seller_optique_oran et casse_setif_pro.",
    collections: ["auto_parts"],
    riskLevel: "safe",
  },
  {
    id: "seed_real_estate",
    title: "Biens immobiliers de démonstration (Olma Immo)",
    description: "Annonces fictives (PROP-ALG-*, owner_demo_*) injectées par l'ancien script de démo.",
    collections: ["real_estate_properties"],
    riskLevel: "safe",
  },
  {
    id: "search_logs",
    title: "Journaux de recherche inutiles",
    description: "Documents bruts de recherches accumulés dans search_logs (les tendances fonctionnent déjà en mémoire).",
    collections: ["search_logs"],
    riskLevel: "safe",
  },
  {
    id: "site_errors",
    title: "Logs d'erreurs techniques obsolètes",
    description: "Anciennes traces d'erreurs frontend accumulées pendant le développement dans site_errors.",
    collections: ["site_errors"],
    riskLevel: "safe",
  },
  {
    id: "system_noise",
    title: "Sondes système, verrous & bruit interne",
    description: "Sondes de test (_health), verrous cron expirés (system_locks), historiques techniques (category_history, admin_activities).",
    collections: ["_health", "system_locks", "category_history", "admin_activities"],
    riskLevel: "safe",
  },
  {
    id: "read_notifications",
    title: "Notifications internes déjà lues",
    description: "Alertes internes marquées comme lues (read == true) dans internal_notifications.",
    collections: ["internal_notifications"],
    riskLevel: "safe",
  },
];

const VALID_CATEGORY_IDS = new Set<string>(CLEANUP_CATEGORIES.map((c) => c.id));

export function isValidCleanupCategory(id: string): id is CleanupCategoryId {
  return VALID_CATEGORY_IDS.has(id);
}

async function deleteTargetsInBatches(targets: CleanupTargetDoc[]): Promise<number> {
  if (targets.length === 0) return 0;
  let deleted = 0;
  for (let i = 0; i < targets.length; i += BATCH_LIMIT) {
    const chunk = targets.slice(i, i + BATCH_LIMIT);
    const batch = db.batch();
    for (const item of chunk) {
      batch.delete(db.collection(item.collection).doc(item.id));
    }
    await batch.commit();
    deleted += chunk.length;
  }
  return deleted;
}

export class FirebaseCleanupService {
  static async auditJunkData(): Promise<CleanupAuditReport> {
    const summaries: CleanupCategorySummary[] = await Promise.all(
      CLEANUP_CATEGORIES.map(async (meta) => {
        try {
          const collected = await collectTargetsForCategory(meta.id);
          return {
            ...meta,
            count: collected.totalCount ?? collected.targets.length,
            truncated: collected.truncated,
            samples: collected.targets.slice(0, 6),
          };
        } catch (err: unknown) {
          safeLogger.warn(`[FirebaseCleanup] Scan partiel échoué pour ${meta.id}`, {
            err: err instanceof Error ? err.message : String(err),
          });
          return {
            ...meta,
            count: 0,
            truncated: false,
            samples: [],
          };
        }
      })
    );

    const totalJunkCount = summaries.reduce((acc, item) => acc + item.count, 0);
    return {
      scannedAt: new Date().toISOString(),
      totalJunkCount,
      categories: summaries,
      protectedCollections: PROTECTED_COLLECTIONS,
    };
  }

  static async purgeJunkData(categories: CleanupCategoryId[], adminUid: string): Promise<CleanupPurgeResult> {
    const uniqueCategories = Array.from(new Set(categories)).filter(isValidCleanupCategory);
    const deletedByCategory: Record<string, number> = {};
    const errors: string[] = [];
    const globalSeen = new Set<string>();
    let totalDeleted = 0;

    for (const categoryId of uniqueCategories) {
      let categoryDeleted = 0;
      try {
        for (let round = 0; round < MAX_PURGE_ROUNDS; round++) {
          const collected = await collectTargetsForCategory(categoryId);
          const dedupedTargets = collected.targets.filter((target) => {
            const key = `${target.collection}/${target.id}`;
            if (globalSeen.has(key)) return false;
            globalSeen.add(key);
            return true;
          });

          if (dedupedTargets.length === 0) break;

          const deleted = await deleteTargetsInBatches(dedupedTargets);
          categoryDeleted += deleted;
          totalDeleted += deleted;

          if (!collected.truncated || deleted === 0) break;
        }
        deletedByCategory[categoryId] = categoryDeleted;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`${categoryId}: ${message}`);
        deletedByCategory[categoryId] = categoryDeleted;
        safeLogger.error(`[FirebaseCleanup] ❌ Échec purge ${categoryId}`, { err: message });
      }
    }

    if (totalDeleted > 0) {
      CoreService.invalidateHomeDataCache();
      clearProductCatalogCache();
      clearProductStoreCache();
      clearProductSearchCache();
      TrendingSearchesService.resetCacheForTesting();

      try {
        await db.collection("audit_logs").add({
          type: "ADMIN_ACTION",
          action: "FIREBASE_JUNK_PURGED",
          adminId: adminUid,
          categories: uniqueCategories,
          deletedByCategory,
          totalDeleted,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch {
        // Ne pas bloquer la réponse si l'écriture du log d'audit échoue
      }
    }

    safeLogger.info(`[FirebaseCleanup] 🟢 Purge terminée (${totalDeleted} doc(s)) par ${adminUid}`, {
      deletedByCategory,
    });

    return {
      purgedAt: new Date().toISOString(),
      totalDeleted,
      deletedByCategory,
      errors,
    };
  }
}
