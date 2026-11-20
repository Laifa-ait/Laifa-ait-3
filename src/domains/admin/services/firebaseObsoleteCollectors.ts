import { db } from "../../../config/firebase-admin";
import { CleanupCollectorResult, CleanupTargetDoc } from "../../../types/firebaseCleanup";

const MAX_DOCS_PER_CATEGORY = 500;
const IDEMPOTENCY_TTL_MS = 48 * 60 * 60 * 1000;

/**
 * Ensemble strictement protégé : aucune découverte dynamique ne pourra jamais
 * cibler l'une de ces collections actives.
 */
const STRICTLY_PROTECTED = new Set<string>([
  "users",
  "publicProfiles",
  "user_secrets",
  "user_secrets_backup",
  "products",
  "orders",
  "order_masters",
  "reviews",
  "tags",
  "settings",
  "banners",
  "homepage_categories_v2",
  "homepage_sections",
  "store_configs",
  "store_layouts",
  "store_slugs",
  "seller_analytics",
  "subscription_plans",
  "subscription_requests",
  "seller_subscriptions",
  "sponsorship_requests",
  "sponsored_campaigns",
  "user_notifications",
  "internal_notifications",
  "supportMessages",
  "supportTickets",
  "supportAttachments",
  "newsletter_campaigns",
  "newsletter_subscribers",
  "real_estate_properties",
  "real_estate_bookings",
  "real_estate_visits",
  "real_estate_pro_applications",
  "artisan_profiles",
  "artisan_offers",
  "artisan_quote_requests",
  "artisan_trades",
  "artisan_reviews",
  "artisan_job_broadcasts",
  "olma_univers_apps",
  "olma_univers_waitlist",
  "conversations",
  "disputes",
  "disputeMessages",
  "disputeAttachments",
  "coupons",
  "coupon_codes",
  "audit_logs",
  "withdrawals",
  "user_affinities",
  "user_documents",
  "translations",
]);

const EXPLICIT_OBSOLETE_LEGACY = [
  "wilayas",
  "user_habits",
  "bricolage_artisans",
  "bricolage_categories",
  "bricolage_quote_requests",
  "bricolage_reviews",
  "olma_univers_app",
  "payment_webhooks",
  "payment_webhook_events",
  "payment_webhook_logs",
  "newsletters",
  "newsletter_logs",
  "newsletter_queue",
  "newsletter_templates",
];

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function addTarget(map: Map<string, CleanupTargetDoc>, collection: string, id: string, label: string): void {
  if (STRICTLY_PROTECTED.has(collection)) return;
  const key = `${collection}/${id}`;
  if (!map.has(key) && map.size < MAX_DOCS_PER_CATEGORY) {
    map.set(key, { collection, id, label });
  }
}

async function discoverDynamicObsoleteCollections(): Promise<string[]> {
  const discovered = new Set<string>(EXPLICIT_OBSOLETE_LEGACY);
  try {
    const rootCollections = await db.listCollections();
    for (const colRef of rootCollections) {
      const name = colRef.id;
      if (STRICTLY_PROTECTED.has(name)) continue;

      const isLegacyBricolage = name.startsWith("bricolage_");
      const isLegacyPaymentWebhook = name.startsWith("payment_we");
      const isOrphanNewsletter =
        name.startsWith("newsletter") &&
        name !== "newsletter_campaigns" &&
        name !== "newsletter_subscribers";

      if (isLegacyBricolage || isLegacyPaymentWebhook || isOrphanNewsletter) {
        discovered.add(name);
      }
    }
  } catch {
    // Fallback silencieux sur EXPLICIT_OBSOLETE_LEGACY si listCollections n'est pas autorisé
  }
  return Array.from(discovered).filter((name) => !STRICTLY_PROTECTED.has(name));
}

async function collectFromCollections(
  collectionNames: string[],
  perCollectionLimit: number
): Promise<CleanupCollectorResult> {
  const targets = new Map<string, CleanupTargetDoc>();
  let truncated = false;

  const snaps = await Promise.all(
    collectionNames.map(async (name) => {
      try {
        const snap = await db.collection(name).limit(perCollectionLimit).get();
        return { name, snap };
      } catch {
        return { name, snap: null };
      }
    })
  );

  for (const { name, snap } of snaps) {
    if (!snap || snap.empty) continue;
    if (snap.size >= perCollectionLimit) truncated = true;
    for (const doc of snap.docs) {
      const data = doc.data() as Record<string, unknown>;
      const hint = asString(
        data.title || data.name || data.action || data.message || data.email || data.domain,
        doc.id
      );
      addTarget(targets, name, doc.id, `[${name}] ${hint.slice(0, 70)}`);
    }
  }

  const list = Array.from(targets.values());
  return { targets: list, truncated: truncated || list.length >= MAX_DOCS_PER_CATEGORY };
}

export async function collectObsoleteLegacyCollections(): Promise<CleanupCollectorResult> {
  const collections = await discoverDynamicObsoleteCollections();
  return collectFromCollections(collections, 150);
}

export async function collectDuplicateShadowCollections(): Promise<CleanupCollectorResult> {
  return collectFromCollections(["notifications", "adminActions"], 250);
}

export async function collectWriteOnlyBloatCollections(): Promise<CleanupCollectorResult> {
  return collectFromCollections(["product_history", "confirmed_delivery_info", "security_alerts"], 200);
}

function extractTimestampMs(data: Record<string, unknown>): number | null {
  const candidate = data.createdAt ?? data.timestamp ?? data.updatedAt;
  if (!candidate) return null;
  if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
  if (typeof candidate === "string") {
    const parsed = Date.parse(candidate);
    return Number.isNaN(parsed) ? null : parsed;
  }
  if (typeof candidate === "object" && candidate !== null && "toMillis" in candidate) {
    const fn = (candidate as { toMillis?: () => number }).toMillis;
    if (typeof fn === "function") return fn.call(candidate);
  }
  return null;
}

export async function collectAnalyticsAndExpiredKeys(): Promise<CleanupCollectorResult> {
  const targets = new Map<string, CleanupTargetDoc>();
  let truncated = false;
  const cutoffMs = Date.now() - IDEMPOTENCY_TTL_MS;

  const [analyticsSnap, analyticsCountSnap, idempotencySnap, monthlySnap] = await Promise.all([
    db.collection("analytics_events").limit(400).get().catch(() => null),
    db.collection("analytics_events").count().get().catch(() => null),
    db.collection("idempotency_keys").limit(200).get().catch(() => null),
    db.collection("site_content_monthly").limit(100).get().catch(() => null),
  ]);

  let extraAnalyticsCount = 0;
  if (analyticsSnap && !analyticsSnap.empty) {
    if (analyticsSnap.size >= 400) truncated = true;
    for (const doc of analyticsSnap.docs) {
      const data = doc.data() as Record<string, unknown>;
      addTarget(
        targets,
        "analytics_events",
        doc.id,
        `[analytics_events] ${asString(data.event || data.name || data.type, doc.id).slice(0, 70)}`
      );
    }
    const exactAnalytics = analyticsCountSnap?.data().count ?? analyticsSnap.size;
    if (exactAnalytics > analyticsSnap.size) {
      extraAnalyticsCount = exactAnalytics - analyticsSnap.size;
      truncated = true;
    }
  }

  if (idempotencySnap && !idempotencySnap.empty) {
    if (idempotencySnap.size >= 200) truncated = true;
    for (const doc of idempotencySnap.docs) {
      const data = doc.data() as Record<string, unknown>;
      const ts = extractTimestampMs(data);
      if (ts === null || ts < cutoffMs) {
        addTarget(targets, "idempotency_keys", doc.id, `[idempotency_keys] Expirée (${doc.id.slice(0, 28)})`);
      }
    }
  }

  if (monthlySnap && !monthlySnap.empty) {
    for (const doc of monthlySnap.docs) {
      addTarget(targets, "site_content_monthly", doc.id, `[site_content_monthly] ${doc.id}`);
    }
  }

  const list = Array.from(targets.values());
  return {
    targets: list,
    truncated: truncated || list.length >= MAX_DOCS_PER_CATEGORY,
    totalCount: list.length + extraAnalyticsCount,
  };
}
