import { describe, it, expect, beforeEach } from "vitest";
import {
  PaymentWebhookProcessor,
  PaymentWebhookPayload,
  OrderPaymentExpectation,
  signPaymentWebhookPayload,
} from "../services/paymentWebhook.service";

const TEST_WEBHOOK_SECRET = "olmart_satim_cib_webhook_secret_2026_hmac";

describe("Sécurité des Webhooks & Callbacks de Paiement Asynchrones (CIB / Edahabia / BaridiMob)", () => {
  let processor: PaymentWebhookProcessor;
  let baseNowMs: number;
  let basePayload: PaymentWebhookPayload;
  let pendingOrder: OrderPaymentExpectation;

  beforeEach(() => {
    processor = new PaymentWebhookProcessor(TEST_WEBHOOK_SECRET);
    baseNowMs = 1_793_250_000_000;
    basePayload = {
      eventId: "evt_satim_001",
      orderId: "ord_dz_9001",
      sessionId: "sess_cib_778899",
      provider: "cib_satim",
      amountDZD: 14500,
      currency: "DZD",
      status: "PAID",
      issuedAtMs: baseNowMs - 30_000,
      expiresAtMs: baseNowMs + 15 * 60 * 1000,
    };
    pendingOrder = {
      orderId: "ord_dz_9001",
      expectedAmountDZD: 14500,
      currentStatus: "PENDING_PAYMENT",
    };
  });

  it("1. Confirme un paiement valide signé par HMAC-SHA256 dans la fenêtre de session", () => {
    const signature = signPaymentWebhookPayload(basePayload, TEST_WEBHOOK_SECRET);
    const res = processor.processCallback(basePayload, signature, pendingOrder, baseNowMs);

    expect(res.accepted).toBe(true);
    expect(res.idempotentReplay).toBe(false);
    expect(res.code).toBe("PAYMENT_CONFIRMED");
    expect(res.newOrderStatus).toBe("PAID");
    expect(pendingOrder.currentStatus).toBe("PAID");
  });

  it("2. Gère de manière idempotente un double callback (retry réseau passerelle SATIM/Edahabia)", () => {
    const signature = signPaymentWebhookPayload(basePayload, TEST_WEBHOOK_SECRET);

    const firstCall = processor.processCallback(basePayload, signature, pendingOrder, baseNowMs);
    expect(firstCall.accepted).toBe(true);
    expect(firstCall.idempotentReplay).toBe(false);
    expect(firstCall.code).toBe("PAYMENT_CONFIRMED");

    // Second callback with identical eventId or sessionId must be idempotently ignored without error
    const duplicateCall = processor.processCallback(basePayload, signature, pendingOrder, baseNowMs + 2000);
    expect(duplicateCall.accepted).toBe(true);
    expect(duplicateCall.idempotentReplay).toBe(true);
    expect(duplicateCall.code).toBe("DUPLICATE_CALLBACK_IGNORED");
    expect(duplicateCall.newOrderStatus).toBe("PAID");

    // Retry with a new eventId but identical (orderId, sessionId, status) tuple
    const retryPayload: PaymentWebhookPayload = {
      ...basePayload,
      eventId: "evt_satim_001_retry_2",
    };
    const retrySig = signPaymentWebhookPayload(retryPayload, TEST_WEBHOOK_SECRET);
    const secondRetry = processor.processCallback(retryPayload, retrySig, pendingOrder, baseNowMs + 5000);
    expect(secondRetry.accepted).toBe(true);
    expect(secondRetry.idempotentReplay).toBe(true);
    expect(secondRetry.code).toBe("DUPLICATE_CALLBACK_IGNORED");
  });

  it("3. Rejette strictement toute signature HMAC invalide, tronquée ou falsifiée", () => {
    const tamperedSignature = signPaymentWebhookPayload(basePayload, "wrong_attacker_secret_key_000000");
    const resTampered = processor.processCallback(basePayload, tamperedSignature, pendingOrder, baseNowMs);

    expect(resTampered.accepted).toBe(false);
    expect(resTampered.code).toBe("INVALID_SIGNATURE");
    expect(pendingOrder.currentStatus).toBe("PENDING_PAYMENT");

    // Payload modified after signing (e.g., attacker changes status from FAILED to PAID)
    const failedPayload: PaymentWebhookPayload = { ...basePayload, status: "FAILED" };
    const validFailedSig = signPaymentWebhookPayload(failedPayload, TEST_WEBHOOK_SECRET);
    const forgedPaidPayload: PaymentWebhookPayload = { ...failedPayload, status: "PAID" };

    const resForged = processor.processCallback(forgedPaidPayload, validFailedSig, pendingOrder, baseNowMs);
    expect(resForged.accepted).toBe(false);
    expect(resForged.code).toBe("INVALID_SIGNATURE");
    expect(pendingOrder.currentStatus).toBe("PENDING_PAYMENT");
  });

  it("4. Rejette un callback reçu après l'expiration de la session de paiement", () => {
    const signature = signPaymentWebhookPayload(basePayload, TEST_WEBHOOK_SECRET);
    const expiredNowMs = basePayload.expiresAtMs + 1000;

    const res = processor.processCallback(basePayload, signature, pendingOrder, expiredNowMs);
    expect(res.accepted).toBe(false);
    expect(res.code).toBe("SESSION_EXPIRED");
    expect(res.newOrderStatus).toBe("EXPIRED");
  });

  it("5. Rejette toute divergence de montant DZD entre le callback et la commande (Anti-Tampering)", () => {
    const underpaidPayload: PaymentWebhookPayload = {
      ...basePayload,
      eventId: "evt_underpaid_99",
      amountDZD: 1450, // 10x less than expected 14500 DZD
    };
    const signature = signPaymentWebhookPayload(underpaidPayload, TEST_WEBHOOK_SECRET);

    const res = processor.processCallback(underpaidPayload, signature, pendingOrder, baseNowMs);
    expect(res.accepted).toBe(false);
    expect(res.code).toBe("AMOUNT_MISMATCH");
    expect(pendingOrder.currentStatus).toBe("PENDING_PAYMENT");
  });

  it("6. Protège une commande déjà finalisée contre une transition contradictoire tardive", () => {
    const paidSig = signPaymentWebhookPayload(basePayload, TEST_WEBHOOK_SECRET);
    processor.processCallback(basePayload, paidSig, pendingOrder, baseNowMs);
    expect(pendingOrder.currentStatus).toBe("PAID");

    // Late contradictory FAILED callback on a different session for the already-paid order
    const lateFailedPayload: PaymentWebhookPayload = {
      ...basePayload,
      eventId: "evt_late_cancel_002",
      sessionId: "sess_cib_different",
      status: "FAILED",
    };
    const lateSig = signPaymentWebhookPayload(lateFailedPayload, TEST_WEBHOOK_SECRET);
    const res = processor.processCallback(lateFailedPayload, lateSig, pendingOrder, baseNowMs + 1000);

    expect(res.accepted).toBe(false);
    expect(res.code).toBe("ORDER_ALREADY_FINALIZED");
    expect(pendingOrder.currentStatus).toBe("PAID");
  });
});
