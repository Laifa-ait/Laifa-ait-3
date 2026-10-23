import { describe, it, expect } from "vitest";
import { placeOrderSchema } from "../utils/validation";

describe("Remediation C-10: Idempotence des commandes invités et contraintes de clé", () => {
  const validCart = [
    {
      id: "prod_1",
      quantity: 1,
      price: 2500,
      name: "Test Product",
      sellerId: "seller_1",
    },
  ];

  const validShippingAddress = {
    fullName: "Ahmed Benali",
    phone: "0550123456",
    wilaya: "16 Alger",
    commune: "Bab El Oued",
    address: "12 Rue de la Liberté",
  };

  it("accepte une clé d'idempotence valide générée par le client (UUID ou ik_...)", () => {
    const payload = {
      cart: validCart,
      shippingAddress: validShippingAddress,
      deliveryMethod: "domicile",
      idempotencyKey: "ik_guest_1728000000000_a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    };
    const parsed = placeOrderSchema.safeParse(payload);
    expect(parsed.success).toBe(true);
  });

  it("rejette une clé d'idempotence trop courte (< 16 caractères)", () => {
    const payload = {
      cart: validCart,
      shippingAddress: validShippingAddress,
      deliveryMethod: "domicile",
      idempotencyKey: "short_key",
    };
    const parsed = placeOrderSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("rejette une clé d'idempotence contenant des caractères non autorisés ou slashes", () => {
    const payload = {
      cart: validCart,
      shippingAddress: validShippingAddress,
      deliveryMethod: "domicile",
      idempotencyKey: "invalid/key/with/slashes/1234567890",
    };
    const parsed = placeOrderSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("rejette une clé d'idempotence anormalement longue (> 128 caractères)", () => {
    const payload = {
      cart: validCart,
      shippingAddress: validShippingAddress,
      deliveryMethod: "domicile",
      idempotencyKey: "a".repeat(129),
    };
    const parsed = placeOrderSchema.safeParse(payload);
    expect(parsed.success).toBe(false);
  });

  it("garantit l'isolation du harnais de test (Remédiation C-02)", () => {
    expect(process.env.NODE_ENV).toBe("test");
    expect(process.env.FIREBASE_PROJECT_ID).toBe("olmart-test-harness");
    expect(process.env.FIREBASE_PROJECT_ID).not.toContain("ai-studio-");
  });
});
