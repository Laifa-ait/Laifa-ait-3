import { Router, Request, Response } from "express";
import { z } from "zod";
import { db, admin } from "../../config/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { safeLogger } from "../../utils/logger";

export const analyticsRouter = Router();

const MAX_EVENTS_PER_BATCH = 50;
const MAX_PAYLOAD_BYTES = 32 * 1024;

const AnalyticsEventSchema = z
  .object({
    name: z.string().min(1).max(64).optional(),
    type: z.string().min(1).max(64).optional(),
    eventName: z.string().min(1).max(64).optional(),
    path: z.string().max(256).optional(),
    page: z.string().max(256).optional(),
    category: z.string().max(100).optional(),
    productId: z.string().max(128).optional(),
    sellerId: z.string().max(128).optional(),
    campaignId: z.string().max(128).optional(),
    sessionId: z.string().max(128).optional(),
    userId: z.string().max(128).optional(),
    clientTimestamp: z.union([z.number(), z.string().max(64)]).optional(),
    metadata: z
      .record(z.string().max(64), z.union([z.string().max(256), z.number(), z.boolean(), z.null()]))
      .optional(),
  })
  .strict()
  .refine((e) => Boolean(e.name || e.type || e.eventName || e.path || e.page), {
    message: "Événement analytics invalide : identifiant d'événement requis.",
  });

const SponsorshipTrackSchema = z.object({
  productId: z.string().min(1).max(128),
  campaignId: z.string().min(1).max(128).optional(),
  action: z.enum(["impression", "click"]),
});

interface AnalyticsPayload {
  events?: unknown[];
  event?: unknown;
}

export const isBillingOrQuotaError = (err: unknown): boolean => {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const code = typeof err === "object" && err !== null && "code" in err ? (err as { code: unknown }).code : undefined;
  return (
    code === 7 ||
    code === 8 ||
    code === "PERMISSION_DENIED" ||
    code === "RESOURCE_EXHAUSTED" ||
    msg.includes("PERMISSION_DENIED") ||
    msg.includes("requires billing to be enabled") ||
    msg.includes("Quota limit exceeded") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("billing")
  );
};

export const getTargetDb = () => {
  if (db) return db;
  if (admin.apps.length > 0) {
    const dbId = process.env.FIREBASE_DATABASE_ID || process.env.VITE_FIREBASE_DATABASE_ID;
    return dbId && dbId !== "(default)" ? getFirestore(admin.app(), dbId) : admin.app().firestore();
  }
  return undefined;
};

// POST analytics track
analyticsRouter.post("/api/v1/analytics/track", async (req: Request, res: Response) => {
  try {
    const payloadSize = Buffer.byteLength(JSON.stringify(req.body || {}), "utf8");
    if (payloadSize > MAX_PAYLOAD_BYTES) {
      return res.status(413).json({ success: false, error: "Charge utile analytics trop volumineuse." });
    }

    const body = (req.body || {}) as AnalyticsPayload;
    const rawEvents = Array.isArray(req.body)
      ? req.body
      : Array.isArray(body.events)
      ? body.events
      : body.event
      ? [body.event]
      : [];

    if (rawEvents.length === 0) {
      return res.status(200).json({ ok: true, success: true, count: 0 });
    }

    if (rawEvents.length > MAX_EVENTS_PER_BATCH) {
      return res.status(400).json({ success: false, error: `Maximum ${MAX_EVENTS_PER_BATCH} événements par lot.` });
    }

    const validatedEvents: Array<z.infer<typeof AnalyticsEventSchema>> = [];
    for (const raw of rawEvents) {
      const parsed = AnalyticsEventSchema.safeParse(raw);
      if (!parsed.success) {
        return res.status(400).json({ success: false, error: "Format d'événement analytics invalide." });
      }
      validatedEvents.push(parsed.data);
    }

    // Écritures brutes Firestore `analytics_events` désactivées pour éviter l'explosion de quota.
    return res.status(200).json({ ok: true, success: true, count: validatedEvents.length });
  } catch (error: unknown) {
    if (isBillingOrQuotaError(error)) {
      safeLogger.debug("[Analytics] Track payload deferred: project billing restriction");
    } else {
      safeLogger.warn("[Analytics] Track payload parsing notice", {
        err: error instanceof Error ? error.message : String(error),
      });
    }
    return res.status(200).json({ ok: true, success: true, count: 0 });
  }
});

// POST sponsorship analytics track
analyticsRouter.post("/api/v1/sponsorship/analytics/track", async (req: Request, res: Response) => {
  try {
    const parsed = SponsorshipTrackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: "productId and valid action required" });
    }
    const { productId, campaignId, action } = parsed.data;

    const firestoreDb = getTargetDb();
    if (firestoreDb) {
      const fieldToIncrement = action === "impression" ? "impressions" : "clicks";
      if (campaignId) {
        const campaignRef = firestoreDb.collection("sponsored_campaigns").doc(campaignId);
        const campaignDoc = await campaignRef.get();
        if (campaignDoc.exists && campaignDoc.data()?.productId === productId && campaignDoc.data()?.status === "active") {
          await campaignRef.update({
            [fieldToIncrement]: admin.firestore.FieldValue.increment(1),
            updatedAt: new Date().toISOString(),
          });
        }
      } else {
        const snap = await firestoreDb
          .collection("sponsored_campaigns")
          .where("productId", "==", productId)
          .where("moderationStatus", "==", "approved")
          .where("status", "==", "active")
          .limit(1)
          .get();

        if (!snap.empty) {
          const docRef = snap.docs[0].ref;
          await docRef.update({
            [fieldToIncrement]: admin.firestore.FieldValue.increment(1),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    return res.status(200).json({ ok: true, success: true });
  } catch (error: unknown) {
    if (isBillingOrQuotaError(error)) {
      safeLogger.debug("[Analytics] Sponsorship tracking deferred due to billing status");
      return res.status(200).json({ ok: true, success: true, deferred: true });
    }
    safeLogger.warn("[Analytics] Sponsorship analytics notice", {
      err: error instanceof Error ? error.message : String(error),
    });
    return res.status(200).json({ ok: true, success: true, deferred: true });
  }
});

export default analyticsRouter;
