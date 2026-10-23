import { Router, Request, Response } from "express";
import { db, admin } from "../../config/firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import { safeLogger } from "../../utils/logger";

export const analyticsRouter = Router();

interface AnalyticsPayload {
  events?: Record<string, unknown>[];
  event?: Record<string, unknown>;
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
    const body = (req.body || {}) as AnalyticsPayload;
    const rawEvents = Array.isArray(req.body)
      ? (req.body as Record<string, unknown>[])
      : Array.isArray(body.events)
      ? body.events
      : body.event
      ? [body.event]
      : [];

    if (rawEvents.length === 0) {
      return res.status(200).json({ ok: true, success: true, count: 0 });
    }

    const firestoreDb = getTargetDb();
    if (firestoreDb) {
      try {
        const batch = firestoreDb.batch();
        rawEvents.slice(0, 50).forEach((evt: Record<string, unknown>) => {
          const ref = firestoreDb.collection("analytics_events").doc();
          batch.set(ref, {
            ...evt,
            serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
        });
        await batch.commit();
      } catch (dbErr: unknown) {
        if (isBillingOrQuotaError(dbErr)) {
          safeLogger.debug("[Analytics] Write deferred: billing or quota limits active on project");
        } else {
          safeLogger.warn("[Analytics] Batch tracking non-fatal write error", {
            err: dbErr instanceof Error ? dbErr.message : String(dbErr),
          });
        }
      }
    }

    return res.status(200).json({ ok: true, success: true, count: rawEvents.length });
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
    const { productId, action } = req.body;
    if (!productId || !["impression", "click"].includes(action)) {
      return res.status(400).json({ error: "productId and valid action required" });
    }

    const firestoreDb = getTargetDb();
    if (firestoreDb) {
      const snap = await firestoreDb.collection("sponsorship_requests")
        .where("productId", "==", productId)
        .where("status", "==", "approved")
        .limit(1)
        .get();

      if (!snap.empty) {
        const docRef = snap.docs[0].ref;
        const fieldToIncrement = action === "impression" ? "impressionsCount" : "clicksCount";
        await docRef.update({
          [fieldToIncrement]: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
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
