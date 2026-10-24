import { Router, Response } from "express";
import { db } from "../../../config/firebase-admin";
import { authenticateToken, authorizeSeller, AuthenticatedRequest } from "../../../middlewares/auth";
import { OrderStatusService, BusinessError } from "../../order/services/orderStatus.service";

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

// Update seller fulfillment metadata and order/return state through the central state machine.
router.patch("/api/v1/seller/orders/:id/status", authenticateToken, authorizeSeller, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ error: "Authentification requise" });
    const { id } = req.params;
    const { status, deliveryMethod, trackingNumber, note, returnStatus } = req.body as {
      status?: string; deliveryMethod?: string; trackingNumber?: string; note?: string; returnStatus?: string;
    };
    if (status !== undefined && typeof status !== "string") return res.status(400).json({ error: "Statut de commande invalide" });
    if (deliveryMethod !== undefined && (typeof deliveryMethod !== "string" || deliveryMethod.length > 80)) return res.status(400).json({ error: "Mode de livraison invalide" });
    if (trackingNumber !== undefined && (typeof trackingNumber !== "string" || trackingNumber.length > 120)) return res.status(400).json({ error: "Numéro de suivi invalide" });
    if (note !== undefined && (typeof note !== "string" || note.length > 1000)) return res.status(400).json({ error: "Note de livraison invalide" });
    if (!status && !returnStatus && !deliveryMethod && trackingNumber === undefined && note === undefined) return res.status(400).json({ error: "Aucun champ de mise à jour fourni" });
    if (status && returnStatus) return res.status(400).json({ error: "Mettez à jour un seul statut à la fois" });

    const orderRef = db.collection("orders").doc(id);
    const docSnap = await orderRef.get();
    if (!docSnap.exists) return res.status(404).json({ error: "Commande introuvable" });
    const data = docSnap.data();
    const isAdmin = req.user?.role === "admin" || req.user?.role === "superadmin";
    if (!data?.sellerIds?.includes(uid) && !isAdmin) return res.status(403).json({ error: "Accès non autorisé à cette commande" });

    let statusToApply = status?.toLowerCase();
    if (returnStatus !== undefined) {
      const currentReturnStatus = String(data?.returnStatus || (data?.returnRequest as { status?: string } | undefined)?.status || "").toLowerCase();
      const transitions: Record<string, string[]> = {
        requested: ["approved", "rejected"], pending: ["approved", "rejected"],
        approved: ["returning"], returning: ["completed"], rejected: [], completed: []
      };
      if (typeof returnStatus !== "string" || !transitions[currentReturnStatus]?.includes(returnStatus)) {
        return res.status(409).json({ error: "Transition de retour invalide" });
      }
      statusToApply = ({ approved: "return_approved", rejected: "return_rejected", returning: "returning", completed: "returned" } as Record<string, string>)[returnStatus];
    }

    if (statusToApply) {
      await OrderStatusService.updateOrderStatus({
        orderIds: [id], status: statusToApply, sellerId: uid, isUserAdmin: isAdmin, authUid: uid
      });
    }
    const updatePayload: Record<string, unknown> = {};
    if (deliveryMethod !== undefined) updatePayload.deliveryMethod = deliveryMethod;
    if (trackingNumber !== undefined) updatePayload.trackingNumber = trackingNumber;
    if (note !== undefined) updatePayload.fulfillmentNote = note;
    if (returnStatus !== undefined) updatePayload.returnStatus = returnStatus;
    if (Object.keys(updatePayload).length) {
      updatePayload.updatedAt = new Date().toISOString();
      await orderRef.update(updatePayload);
    }
    return res.json({ success: true, message: "Commande mise à jour avec succès", orderId: id, ...(statusToApply ? { status: statusToApply } : {}), ...updatePayload });
  } catch (error: unknown) {
    if (error instanceof BusinessError) return res.status(error.statusCode).json({ error: error.message });
    const msg = error instanceof Error ? error.message : "Internal error";
    return res.status(500).json({ error: msg });
  }
});

export default router;
