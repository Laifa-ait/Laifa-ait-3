import { firestore } from "firebase-admin";
import { admin, db } from "../../../config/firebase-admin";
import { traceTransactionExecution } from "../../../utils/transactionTrace";
import { ProductVariant } from "../../product/product.types";

export class BusinessError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = "BusinessError";
  }
}

export interface PartialProductStockSource {
  stock?: number;
  salesCount?: number;
  variants?: ProductVariant[];
  hasOutOfStockVariants?: boolean;
}

/**
 * Builds a minimal partial Firestore update payload containing only stock, variants,
 * and salesCount fields so concurrent product edits (price, description, status) are never overwritten (M-11).
 */
export function buildPartialProductStockUpdate(
  pData: PartialProductStockSource
): firestore.UpdateData<PartialProductStockSource> {
  const payload: Record<string, unknown> = {};
  if (typeof pData.stock === "number") {
    payload.stock = pData.stock;
  }
  if (Array.isArray(pData.variants)) {
    payload.variants = pData.variants;
    payload.hasOutOfStockVariants = Boolean(pData.hasOutOfStockVariants);
  }
  if (typeof pData.salesCount === "number") {
    payload.salesCount = pData.salesCount;
  }
  return payload as firestore.UpdateData<PartialProductStockSource>;
}

export function applyItemsRestockToProductMap(
  items: Array<{ id?: string; quantity?: number; selectedVariant?: string }>,
  productUpdates: Map<string, PartialProductStockSource>
): boolean {
  let modified = false;
  for (const item of items) {
    if (!item.id || !item.quantity) continue;
    const pData = productUpdates.get(item.id);
    if (!pData) continue;
    modified = true;
    if (item.selectedVariant) {
      pData.variants = (pData.variants || []).map((v: ProductVariant) => {
        if (v.name === item.selectedVariant) {
          return {
            ...v,
            stock: Number(v.stock || 0) + Number(item.quantity || 1),
          };
        }
        return v;
      });
      pData.stock = (pData.variants || []).reduce(
        (acc: number, curr: ProductVariant) => acc + Math.max(0, Number(curr.stock) || 0),
        0
      );
      pData.hasOutOfStockVariants = (pData.variants || []).some(
        (v: ProductVariant) => Math.max(0, Number(v.stock) || 0) <= 0
      );
    } else {
      pData.stock = Number(pData.stock || 0) + Number(item.quantity || 1);
    }
  }
  return modified;
}

const ORDER_STATUS_TRANSLATIONS: Record<string, { fr: string; ar: string; en: string }> = {
  processing: { fr: "En préparation", ar: "جاري التحضير", en: "Processing" },
  picked_up: { fr: "Prise en charge / Colis ramassé", ar: "تم الاستلام من البائع", en: "Picked up" },
  in_transit: { fr: "En cours d'acheminement (En transit)", ar: "في الطريق إليك", en: "In transit" },
  shipped: { fr: "Expédiée", ar: "تم الشحن", en: "Shipped" },
  delivered: { fr: "Livrée à destination", ar: "تم التوصيل بنجاح", en: "Delivered" },
  canceled: { fr: "Annulée par le vendeur", ar: "ملغاة من قبل البائع", en: "Canceled" },
  returned: { fr: "Retournée au vendeur", ar: "تم الإرجاع للبائع", en: "Returned" },
};

export function enqueueOrderStatusNotificationInTx(
  t: firestore.Transaction,
  orderId: string,
  recipientUserId: string,
  targetStatus: string
): void {
  const translated = ORDER_STATUS_TRANSLATIONS[targetStatus] || {
    fr: targetStatus,
    ar: targetStatus,
    en: targetStatus,
  };
  const shortOrder = orderId.substring(0, 8).toUpperCase();
  const notifRef = db.collection("user_notifications").doc();
  t.set(notifRef, {
    recipientId: recipientUserId,
    userId: recipientUserId,
    title: {
      fr: "Mise à jour de votre livraison Olmart",
      ar: "تحديث حالة التوصيل في أولمارت",
      en: "Olmart Delivery Update",
    },
    message: {
      fr: `Le vendeur a mis à jour le statut de votre commande #${shortOrder} : ${translated.fr}`,
      ar: `قام البائع بتحديث حالة طلبك #${shortOrder} : ${translated.ar}`,
      en: `The seller updated your order #${shortOrder} : ${translated.en}`,
    },
    type: "order_status",
    orderId,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

export async function executeBuyerReceiptConfirmation(input: { orderId: string; userId: string }): Promise<void> {
  const { orderId, userId } = input;
  const orderRef = db.collection("orders").doc(orderId);
  await traceTransactionExecution("order_confirm_receipt_buyer", () =>
    db.runTransaction(async (t: firestore.Transaction) => {
      const snap = await t.get(orderRef);
      if (!snap.exists) throw new BusinessError(404, "Commande introuvable");
      const oData = (snap.data() || {}) as Record<string, unknown>;
      if (oData.userId !== userId) throw new BusinessError(403, "Accès non autorisé");
      const cStatus = String(oData.status || "").toLowerCase();
      if (!["shipped", "in_transit", "picked_up", "delivered"].includes(cStatus)) {
        throw new BusinessError(400, "La commande doit être expédiée avant de confirmer la réception.");
      }
      t.update(orderRef, {
        confirmedByBuyer: true,
        confirmedByBuyerAt: admin.firestore.FieldValue.serverTimestamp(),
        status: "delivered",
        escrowStatus: "released",
        paymentStatus: "paid",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    })
  );
}

export async function executeBuyerOrderCancellation(input: { orderId: string; userId: string }): Promise<void> {
  const { orderId, userId } = input;
  const orderRef = db.collection("orders").doc(orderId);

  await traceTransactionExecution("order_cancel_buyer", () =>
    db.runTransaction(async (t: firestore.Transaction) => {
      const orderTxSnap = await t.get(orderRef);
      if (!orderTxSnap.exists) throw new BusinessError(404, "Commande introuvable");
      const oData = orderTxSnap.data();
      if (!oData) throw new BusinessError(404, "Données de la commande introuvables");
      if (oData.userId !== userId) throw new BusinessError(403, "Accès non autorisé");
      if ((oData.status || "") !== "pending") {
        throw new BusinessError(400, "Seules les commandes en attente peuvent être annulées");
      }

      const productUpdates = new Map<string, PartialProductStockSource>();
      const items = (oData.items as Array<{ id?: string; quantity?: number; selectedVariant?: string }>) || [];
      const productIds = [
        ...new Set(items.map((item) => item.id).filter((pId): pId is string => typeof pId === "string" && pId !== "")),
      ];

      if (productIds.length > 0) {
        const productSnaps = await t.getAll(...productIds.map((pId) => db.collection("products").doc(pId)));
        for (const snap of productSnaps) {
          if (snap.exists) productUpdates.set(snap.id, snap.data() as PartialProductStockSource);
        }
      }

      applyItemsRestockToProductMap(items, productUpdates);

      for (const [pId, pData] of productUpdates.entries()) {
        t.update(db.collection("products").doc(pId), buildPartialProductStockUpdate(pData));
      }

      t.update(orderRef, {
        status: "cancelled_by_client",
        paymentStatus: oData.paymentStatus || "unpaid",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      t.set(orderRef.collection("order_logs").doc(), {
        status: "cancelled_by_client",
        type: "status_update",
        date: admin.firestore.FieldValue.serverTimestamp(),
      });
    })
  );
}
