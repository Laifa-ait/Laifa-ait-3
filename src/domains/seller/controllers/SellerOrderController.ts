import { Router, Response } from "express";
import { db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";

interface TimedDocument {
  createdAt?: { toDate?: () => Date } | string | number | Date;
  [key: string]: unknown;
}

const getTimestamp = (doc: TimedDocument): number => {
  if (doc.createdAt && typeof (doc.createdAt as { toDate?: () => Date }).toDate === "function") {
    return (doc.createdAt as { toDate: () => Date }).toDate().getTime();
  }
  return new Date((doc.createdAt as string | number | Date) || 0).getTime();
};

const router = Router();

// GET seller orders
router.get("/api/v1/seller/orders", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const snap = await db.collection("orders").where("sellerIds", "array-contains", uid).get();
    const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a: TimedDocument, b: TimedDocument) => getTimestamp(b) - getTimestamp(a));
    return res.json({ orders });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// GET seller order by id
router.get("/api/v1/seller/orders/:id", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { id } = req.params;
    const docSnap = await db.collection("orders").doc(id).get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data?.sellerIds?.includes(uid) || req.user.role === "admin") {
        return res.json({ order: { id: docSnap.id, ...data } });
      }
    }
    return res.status(404).json({ error: "Commande introuvable ou accès non autorisé" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

// PATCH seller order status & delivery method (Self-delivery / Carrier)
router.patch("/api/v1/seller/orders/:id/status", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ error: "Authentification requise" });
    }
    const uid = req.user.uid;
    const { id } = req.params;
    const { status, deliveryMethod, trackingNumber, note, returnStatus } = req.body;

    if (!status && !returnStatus && !deliveryMethod && trackingNumber === undefined) {
      return res.status(400).json({ error: "Aucun champ de mise à jour fourni" });
    }

    const orderRef = db.collection("orders").doc(id);
    const docSnap = await orderRef.get();
    if (!docSnap.exists) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    const data = docSnap.data();
    if (!data?.sellerIds?.includes(uid) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Accès non autorisé à cette commande" });
    }

    const updatePayload: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (status) {
      updatePayload.status = status;
    }
    if (deliveryMethod) {
      updatePayload.deliveryMethod = deliveryMethod;
    }
    if (trackingNumber !== undefined) {
      updatePayload.trackingNumber = trackingNumber;
    }
    if (note) {
      updatePayload.fulfillmentNote = note;
    }
    if (returnStatus) {
      updatePayload.returnStatus = returnStatus;
    }

    await orderRef.update(updatePayload);

    return res.json({ success: true, message: "Commande mise à jour avec succès", orderId: id, ...updatePayload });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
