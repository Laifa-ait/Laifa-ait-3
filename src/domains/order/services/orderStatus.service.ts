import { firestore } from "firebase-admin";
import { admin, db } from "../../../config/firebase-admin";
import { safeLogger } from "../../../utils/logger";
import { traceTransactionExecution } from "../../../utils/transactionTrace";
import { ProductVariant } from "../../product/product.types";
import { applyOrderSalesCountDelta } from "./orderSalesCount.service";
import {
  BusinessError,
  applyItemsRestockToProductMap,
  buildPartialProductStockUpdate,
  enqueueOrderStatusNotificationInTx,
  executeBuyerOrderCancellation,
  executeBuyerReceiptConfirmation,
} from "./orderStatusNotificationHelper";

export { BusinessError };

export interface FirestoreProduct {
  stock?: number;
  salesCount?: number;
  variants?: ProductVariant[];
  hasOutOfStockVariants?: boolean;
}

export interface UpdateOrderStatusInput {
  orderIds: string[];
  status: string;
  sellerId: string;
  isUserAdmin: boolean;
  authUid: string;
  deliveryPhoto?: string;
  latitude?: number;
  longitude?: number;
}

export interface CancelOrderInput {
  orderId: string;
  userId: string;
}

export interface ConfirmDeliveryInput {
  id: string;
  fullName: string;
  email?: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  deliveryMethod: string;
  items: unknown;
  total: number;
  authUid?: string;
  userId?: string;
}

const VALID_TRANSITIONS: Record<string, string[]> = {
  new: ["processing", "confirmed", "picked_up", "in_transit", "canceled"],
  pending: ["processing", "confirmed", "picked_up", "in_transit", "canceled"],
  confirmed: ["processing", "preparing", "shipped", "picked_up", "in_transit", "canceled"],
  preparing: ["processing", "picked_up", "shipped", "in_transit", "canceled"],
  processing: ["picked_up", "shipped", "in_transit", "canceled"],
  picked_up: ["in_transit", "shipped", "delivered", "returned"],
  in_transit: ["delivered", "returned"],
  shipped: ["delivered", "returned"],
  delivered: ["return_requested", "dispute_open"],
  return_requested: ["return_approved", "return_rejected"],
  return_approved: ["returning"],
  returning: ["returned"],
  returned: ["refunded"],
  canceled: [],
  refunded: [],
  dispute_open: ["dispute_resolved"],
};

// 'delivered' is excluded from unilateral seller transitions (H-7):
// an order can only transition to 'delivered' via admin authorization or after buyer receipt confirmation.
const ALLOWED_BY_SELLER = [
  "confirmed",
  "processing",
  "preparing",
  "shipped",
  "picked_up",
  "in_transit",
  "canceled",
  "returned",
  "return_requested",
  "return_approved",
  "return_rejected",
  "returning",
];

export class OrderStatusService {
  static async updateOrderStatus(input: UpdateOrderStatusInput): Promise<void> {
    const { orderIds, status, sellerId, isUserAdmin, authUid, deliveryPhoto, latitude, longitude } = input;

    await traceTransactionExecution("order_update_status", () =>
      db.runTransaction(async (t: firestore.Transaction) => {
        const ordersData: Array<{
          id: string;
          orderRef: firestore.DocumentReference;
          data: Record<string, unknown>;
          productSnaps?: firestore.DocumentSnapshot[];
        }> = [];

        for (const id of orderIds) {
          const orderRef = db.collection("orders").doc(id);
          const orderSnap = await t.get(orderRef);
          if (!orderSnap.exists) {
            throw new BusinessError(404, `La commande #${id} est introuvable.`);
          }
          const data = (orderSnap.data() || {}) as Record<string, unknown>;
          const sellerIds = data.sellerIds as string[] | undefined;
          const isUserSeller = sellerIds?.includes(sellerId) || data.sellerId === sellerId;

          if (!isUserAdmin && !isUserSeller) {
            throw new BusinessError(403, `Accès non autorisé pour la commande #${id}.`);
          }

          const cStatus = ((data.status as string) || "NEW").toLowerCase();
          const tStatus = status.toLowerCase();
          let productSnaps: firestore.DocumentSnapshot[] = [];

          const needsRestockRead = (tStatus === "returned" || tStatus === "canceled") && !data.restocked;
          const needsSalesIncrementRead = tStatus === "delivered" && cStatus !== "delivered" && !data.salesCountRecorded;
          const needsSalesRevertRead =
            (tStatus === "returned" || tStatus === "canceled" || tStatus === "refunded") &&
            Boolean(data.salesCountRecorded);

          if (needsRestockRead || needsSalesIncrementRead || needsSalesRevertRead) {
            const items = (data.items as Array<{ id?: string; quantity?: number; selectedVariant?: string }>) || [];
            const productIds = [
              ...new Set(items.map((item) => item.id).filter((pId): pId is string => typeof pId === "string" && pId !== "")),
            ];
            if (productIds.length > 0) {
              const productRefs = productIds.map((pId) => db.collection("products").doc(pId));
              productSnaps = await t.getAll(...productRefs);
            }
          }

          ordersData.push({ id, orderRef, data, productSnaps });
        }

        for (const { id, orderRef, data, productSnaps } of ordersData) {
          const sellerIds = data.sellerIds as string[] | undefined;
          const isUserSeller = sellerIds?.includes(sellerId) || data.sellerId === sellerId;
          const cStatus = ((data.status as string) || "NEW").toLowerCase();
          const tStatus = status.toLowerCase();

          if (isUserSeller && !isUserAdmin) {
            const buyerConfirmedDelivery = tStatus === "delivered" && data.confirmedByBuyer === true;
            if (!ALLOWED_BY_SELLER.includes(tStatus) && !buyerConfirmedDelivery) {
              throw new BusinessError(
                403,
                tStatus === "delivered"
                  ? "La livraison doit être confirmée par l'acheteur ou un administrateur."
                  : "Statut non autorisé."
              );
            }
          }

          if (cStatus !== tStatus && (!VALID_TRANSITIONS[cStatus] || !VALID_TRANSITIONS[cStatus].includes(tStatus))) {
            throw new BusinessError(400, `Transition de statut invalide : de ${cStatus} vers ${tStatus}.`);
          }

          const updatePayload: Record<
            string,
            admin.firestore.FieldValue | string | number | boolean | { latitude: number; longitude: number }
          > = {
            status: tStatus,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          if (tStatus === "return_approved") updatePayload["returnRequest.status"] = "approved";
          else if (tStatus === "return_rejected") updatePayload["returnRequest.status"] = "rejected";
          else if (tStatus === "returned") updatePayload["returnRequest.status"] = "received";

          const items = (data.items as Array<{ id?: string; quantity?: number; selectedVariant?: string }>) || [];
          const productUpdates = new Map<string, FirestoreProduct>();
          for (const snap of productSnaps || []) {
            if (snap.exists) productUpdates.set(snap.id, snap.data() as FirestoreProduct);
          }

          let productsModified = false;
          if ((tStatus === "returned" || tStatus === "canceled") && !data.restocked && productUpdates.size > 0) {
            productsModified = applyItemsRestockToProductMap(items, productUpdates);
            updatePayload.restocked = true;
            updatePayload.restockedAt = admin.firestore.FieldValue.serverTimestamp();
            safeLogger.info("[Olmart Workers] 📦 RTO Stock Restored automatically", { orderId: id });
          }

          if (productUpdates.size > 0) {
            const salesDelta = applyOrderSalesCountDelta({
              targetStatus: tStatus,
              currentStatus: cStatus,
              salesCountRecorded: Boolean(data.salesCountRecorded),
              items,
              productUpdates: productUpdates as unknown as Map<string, Record<string, unknown>>,
            });
            if (salesDelta.changed) {
              productsModified = true;
              updatePayload.salesCountRecorded = salesDelta.nextSalesCountRecorded;
            }
          }

          if (productsModified) {
            for (const [pId, pData] of productUpdates.entries()) {
              t.update(db.collection("products").doc(pId), buildPartialProductStockUpdate(pData));
            }
          }

          if (tStatus === "refunded" && cStatus !== "refunded") {
            updatePayload["returnRequest.status"] = "completed";
            updatePayload.paymentStatus = "refunded";
          }

          if (tStatus === "delivered" && cStatus !== "delivered") {
            if (!isUserAdmin && data.confirmedByBuyer !== true) {
              throw new BusinessError(403, "La livraison doit être confirmée par l'acheteur ou un administrateur.");
            }
            const netMerchandise = Math.max(0, Number(data.subtotal || data.total || 0) - Number(data.discountAmount || 0));
            const rate =
              typeof data.commissionRateApplied === "number" && data.commissionRateApplied > 0
                ? data.commissionRateApplied
                : 0.1;
            const commissionAmount = Math.round(netMerchandise * rate);
            const sellerEarned = Math.max(0, netMerchandise - commissionAmount);

            updatePayload.commissionRateApplied = rate;
            updatePayload.commissionAmount = commissionAmount;
            updatePayload.sellerEarned = sellerEarned;
            updatePayload.payoutAmount = sellerEarned;
            updatePayload.escrowStatus = data.confirmedByBuyer === true ? "released" : "held";
            updatePayload.paymentStatus = data.confirmedByBuyer === true || isUserAdmin ? "paid" : "escrow_held";
            if (deliveryPhoto) updatePayload.deliveryPhoto = deliveryPhoto;
            if (latitude !== undefined && longitude !== undefined) {
              updatePayload.deliveryCoordinates = { latitude, longitude };
            }
          }

          t.update(orderRef, updatePayload);
          t.set(orderRef.collection("order_logs").doc(), {
            status,
            type: "status_update",
            date: admin.firestore.FieldValue.serverTimestamp(),
          });

          if (typeof data.userId === "string" && cStatus !== tStatus && authUid !== data.userId) {
            enqueueOrderStatusNotificationInTx(t, id, data.userId, tStatus);
          }
        }
      })
    );
  }

  static async confirmBuyerReceipt(input: { orderId: string; userId: string }): Promise<void> {
    return executeBuyerReceiptConfirmation(input);
  }

  static async cancelBuyerOrder(input: CancelOrderInput): Promise<void> {
    return executeBuyerOrderCancellation(input);
  }

  static async confirmDelivery(input: ConfirmDeliveryInput): Promise<string> {
    const safeUserId =
      typeof input.authUid === "string" && input.authUid.trim().length > 0
        ? input.authUid.trim()
        : "guest";
    const docRef = db.collection("orders").doc(input.id);
    if (docRef && typeof docRef.set === "function") {
      await docRef.set({
        id: input.id,
        fullName: input.fullName,
        email: input.email || "",
        phone: input.phone,
        wilaya: input.wilaya,
        commune: input.commune,
        address: input.address,
        deliveryMethod: input.deliveryMethod,
        items: input.items,
        total: input.total,
        userId: safeUserId,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    return input.id;
  }
}
