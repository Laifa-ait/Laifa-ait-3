import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "../config/firebase-admin";
import { OrderPlacementService, PlaceOrderInput } from "../domains/order/services/orderPlacement.service";
import { OrderStatusService } from "../domains/order/services/orderStatus.service";

const isEmulatorActive = Boolean(
  process.env.FIREBASE_EMULATOR_ACTIVE === "true" ||
  (process.env.FIRESTORE_EMULATOR_HOST && process.env.FIRESTORE_EMULATOR_HOST.length > 0)
);

describe.skipIf(!isEmulatorActive)("Firestore ACID Transactions - Real Concurrency Stock Reservation", () => {
  const sellerId = "seller_acid_test_01";
  const singleStockProductId = "product_acid_stock_01";
  const variantStockProductId = "product_acid_variant_01";

  beforeAll(async () => {
    // 1. Seed global settings
    await db.collection("settings").doc("shipping").set({
      globalBaseFee: 600,
      wilayaFees: { Alger: 500 },
      matrixFees: {},
    });
    await db.collection("settings").doc("commission").set({
      globalRate: 0,
    });

    // 2. Seed active and sellable seller profile
    await db.collection("users").doc(sellerId).set({
      uid: sellerId,
      role: "seller",
      status: "active",
      displayName: "Boutique ACID Motors",
      shopName: "Boutique ACID Motors",
      isVerified: true,
    });

    // 3. Seed product with strictly 1 unit of stock
    await db.collection("products").doc(singleStockProductId).set({
      id: singleStockProductId,
      name: "Pièce Moteur Rare (Dernier Exemplaire)",
      price: 5000,
      stock: 1,
      status: "active",
      sellerId: sellerId,
      category: "Auto",
      hasOutOfStockVariants: false,
    });

    // 4. Seed product with 1 unit in a specific variant
    await db.collection("products").doc(variantStockProductId).set({
      id: variantStockProductId,
      name: "T-Shirt Olmart Limited Edition",
      price: 2500,
      stock: 1,
      status: "active",
      sellerId: sellerId,
      category: "Mode",
      variants: [
        { name: "XL", stock: 1, priceOverride: 2500, isActive: true },
        { name: "M", stock: 0, priceOverride: 2500, isActive: false },
      ],
      hasOutOfStockVariants: true,
    });
  });

  afterAll(async () => {
    // Cleanup seeded test documents
    const batch = db.batch();
    batch.delete(db.collection("products").doc(singleStockProductId));
    batch.delete(db.collection("products").doc(variantStockProductId));
    batch.delete(db.collection("users").doc(sellerId));
    await batch.commit().catch(() => {});
  });

  it("atomically serializes concurrent checkouts on the last remaining item: exactly 1 wins, 1 fails with insufficient stock", async () => {
    const inputClientA: PlaceOrderInput = {
      cart: [{ id: singleStockProductId, quantity: 1, priceSeen: 5000 }],
      shippingAddress: {
        fullName: "Acheteur Alpha",
        phone: "0550112233",
        wilaya: "16 - Alger",
        commune: "Bab El Oued",
        address: "Rue 1",
      },
      deliveryMethod: "standard",
      idempotencyKey: `idemp_buyer_alpha_${Date.now()}`,
      userId: "buyer_alpha_123",
      isGuest: false,
      guestRecoveryToken: null,
      guestTokenHash: null,
    };

    const inputClientB: PlaceOrderInput = {
      cart: [{ id: singleStockProductId, quantity: 1, priceSeen: 5000 }],
      shippingAddress: {
        fullName: "Acheteur Beta",
        phone: "0550445566",
        wilaya: "16 - Alger",
        commune: "Kouba",
        address: "Rue 2",
      },
      deliveryMethod: "standard",
      idempotencyKey: `idemp_buyer_beta_${Date.now()}`,
      userId: "buyer_beta_456",
      isGuest: false,
      guestRecoveryToken: null,
      guestTokenHash: null,
    };

    // Execute both orders in simultaneous parallel race condition against Firestore transaction
    const [resultA, resultB] = await Promise.allSettled([
      OrderPlacementService.executeOrderPlacement(inputClientA),
      OrderPlacementService.executeOrderPlacement(inputClientB),
    ]);

    const successes = [resultA, resultB].filter((r) => r.status === "fulfilled");
    const failures = [resultA, resultB].filter((r) => r.status === "rejected");

    // ACID Invariant 1: Exactly 1 transaction must succeed
    expect(successes).toHaveLength(1);
    // ACID Invariant 2: Exactly 1 transaction must fail
    expect(failures).toHaveLength(1);

    // Verify rejection reason is strictly stock exhaustion
    const rejectedReason = failures[0] as PromiseRejectedResult;
    expect(rejectedReason.reason).toBeInstanceOf(Error);
    expect(rejectedReason.reason.message).toMatch(/Stock insuffisant/i);

    // Verify database state: Stock must be exactly 0, never negative
    const productSnap = await db.collection("products").doc(singleStockProductId).get();
    expect(productSnap.exists).toBe(true);
    const productData = productSnap.data();
    expect(productData?.stock).toBe(0);

    // Verify orders: Exactly 1 order was placed in Firestore
    const fulfilledOrder = (successes[0] as PromiseFulfilledResult<{ orderId: string }>).value;
    expect(fulfilledOrder.orderId).toBeDefined();

    const orderDoc = await db.collection("orders").doc(fulfilledOrder.orderId).get();
    expect(orderDoc.exists).toBe(true);
  });

  it("atomically serializes concurrent checkouts on the last remaining variant", async () => {
    const inputClientA: PlaceOrderInput = {
      cart: [{ id: variantStockProductId, quantity: 1, selectedVariant: "XL", priceSeen: 2500 }],
      shippingAddress: { fullName: "Acheteur V1", phone: "0770112233", wilaya: "16 - Alger" },
      deliveryMethod: "standard",
      idempotencyKey: `idemp_variant_a_${Date.now()}`,
      userId: "buyer_var_a",
      isGuest: false,
      guestRecoveryToken: null,
      guestTokenHash: null,
    };

    const inputClientB: PlaceOrderInput = {
      cart: [{ id: variantStockProductId, quantity: 1, selectedVariant: "XL", priceSeen: 2500 }],
      shippingAddress: { fullName: "Acheteur V2", phone: "0770445566", wilaya: "16 - Alger" },
      deliveryMethod: "standard",
      idempotencyKey: `idemp_variant_b_${Date.now()}`,
      userId: "buyer_var_b",
      isGuest: false,
      guestRecoveryToken: null,
      guestTokenHash: null,
    };

    const [resA, resB] = await Promise.allSettled([
      OrderPlacementService.executeOrderPlacement(inputClientA),
      OrderPlacementService.executeOrderPlacement(inputClientB),
    ]);

    const successes = [resA, resB].filter((r) => r.status === "fulfilled");
    const failures = [resA, resB].filter((r) => r.status === "rejected");

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);

    const productSnap = await db.collection("products").doc(variantStockProductId).get();
    const data = productSnap.data();
    expect(data?.stock).toBe(0);

    const xlVariant = (data?.variants as Array<{ name: string; stock: number }>).find((v) => v.name === "XL");
    expect(xlVariant?.stock).toBe(0);
  });

  it("atomically serializes concurrent order cancellations: exactly 1 wins, 1 rejected, stock restored exactly once", async () => {
    await db.collection("products").doc(singleStockProductId).update({ stock: 1 });
    const orderResult = await OrderPlacementService.executeOrderPlacement({
      cart: [{ id: singleStockProductId, quantity: 1, priceSeen: 5000 }],
      shippingAddress: { fullName: "Acheteur Annulation", phone: "0550998877", wilaya: "16 - Alger" },
      userId: "buyer_cancel_test",
      isGuest: false,
      guestRecoveryToken: null,
      guestTokenHash: null,
    });
    const orderId = orderResult.orderId;

    let snap = await db.collection("products").doc(singleStockProductId).get();
    expect(snap.data()?.stock).toBe(0);

    const [cancelA, cancelB] = await Promise.allSettled([
      OrderStatusService.cancelBuyerOrder({ orderId, userId: "buyer_cancel_test" }),
      OrderStatusService.cancelBuyerOrder({ orderId, userId: "buyer_cancel_test" }),
    ]);

    const successes = [cancelA, cancelB].filter((r) => r.status === "fulfilled");
    const failures = [cancelA, cancelB].filter((r) => r.status === "rejected");

    expect(successes).toHaveLength(1);
    expect(failures).toHaveLength(1);

    snap = await db.collection("products").doc(singleStockProductId).get();
    expect(snap.data()?.stock).toBe(1);

    const orderSnap = await db.collection("orders").doc(orderId).get();
    expect(orderSnap.data()?.status).toBe("cancelled_by_client");
  });
});
