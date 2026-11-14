import crypto from "node:crypto";
import { admin, db } from "../config/firebase-admin";

export type PaymentGatewayProvider = "cib_satim" | "edahabia_poste" | "baridimob";

export type PaymentCallbackStatus = "PAID" | "FAILED" | "CANCELLED";

export interface PaymentWebhookPayload {
  eventId: string;
  orderId: string;
  sessionId: string;
  provider: PaymentGatewayProvider;
  amountDZD: number;
  currency: "DZD";
  status: PaymentCallbackStatus;
  issuedAtMs: number;
  expiresAtMs: number;
  metadata?: Record<string, string>;
}

export interface OrderPaymentExpectation {
  orderId: string;
  expectedAmountDZD: number;
  currentStatus: "PENDING_PAYMENT" | "PAID" | "CANCELLED" | "EXPIRED";
}

export interface WebhookProcessingResult {
  accepted: boolean;
  idempotentReplay: boolean;
  code:
    | "PAYMENT_CONFIRMED"
    | "PAYMENT_FAILED_RECORDED"
    | "DUPLICATE_CALLBACK_IGNORED"
    | "INVALID_SIGNATURE"
    | "SESSION_EXPIRED"
    | "FUTURE_TIMESTAMP_REJECTED"
    | "AMOUNT_MISMATCH"
    | "ORDER_ALREADY_FINALIZED";
  orderId: string;
  newOrderStatus: OrderPaymentExpectation["currentStatus"];
}

const MAX_CLOCK_SKEW_MS = 5 * 60 * 1000;

export function signPaymentWebhookPayload(
  payload: PaymentWebhookPayload,
  secret: string
): string {
  const canonical = JSON.stringify({
    eventId: payload.eventId,
    orderId: payload.orderId,
    sessionId: payload.sessionId,
    provider: payload.provider,
    amountDZD: payload.amountDZD,
    currency: payload.currency,
    status: payload.status,
    issuedAtMs: payload.issuedAtMs,
    expiresAtMs: payload.expiresAtMs,
  });
  return crypto.createHmac("sha256", secret).update(canonical).digest("hex");
}

export function verifyPaymentWebhookSignature(
  payload: PaymentWebhookPayload,
  signatureHex: string,
  secret: string
): boolean {
  if (!signatureHex || !secret || !/^[0-9a-f]{64}$/i.test(signatureHex)) {
    return false;
  }
  const expectedHex = signPaymentWebhookPayload(payload, secret);
  const expectedBuf = Buffer.from(expectedHex, "hex");
  const receivedBuf = Buffer.from(signatureHex, "hex");
  if (expectedBuf.length !== receivedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

export class PaymentWebhookProcessor {
  private readonly processedEventIds = new Set<string>();
  private readonly processedOrderSessions = new Map<string, WebhookProcessingResult>();

  constructor(private readonly webhookSecret: string) {
    if (!webhookSecret || webhookSecret.trim().length < 16) {
      throw new Error("PaymentWebhookProcessor requires a secret of at least 16 characters");
    }
  }

  public processCallback(
    payload: PaymentWebhookPayload,
    signatureHex: string,
    order: OrderPaymentExpectation,
    nowMs: number = Date.now()
  ): WebhookProcessingResult {
    // 1. Cryptographic HMAC-SHA256 verification (constant-time)
    if (!verifyPaymentWebhookSignature(payload, signatureHex, this.webhookSecret)) {
      return {
        accepted: false,
        idempotentReplay: false,
        code: "INVALID_SIGNATURE",
        orderId: order.orderId,
        newOrderStatus: order.currentStatus,
      };
    }

    // 2. Idempotency check (duplicate webhook event or session callback)
    const idempotencyKey = `${payload.orderId}:${payload.sessionId}:${payload.status}`;
    if (this.processedEventIds.has(payload.eventId) || this.processedOrderSessions.has(idempotencyKey)) {
      const previous = this.processedOrderSessions.get(idempotencyKey);
      return {
        accepted: true,
        idempotentReplay: true,
        code: "DUPLICATE_CALLBACK_IGNORED",
        orderId: order.orderId,
        newOrderStatus: previous ? previous.newOrderStatus : order.currentStatus,
      };
    }

    // 3. Anti-replay & Session expiration check
    if (payload.issuedAtMs > nowMs + MAX_CLOCK_SKEW_MS) {
      return {
        accepted: false,
        idempotentReplay: false,
        code: "FUTURE_TIMESTAMP_REJECTED",
        orderId: order.orderId,
        newOrderStatus: order.currentStatus,
      };
    }

    if (nowMs > payload.expiresAtMs) {
      return {
        accepted: false,
        idempotentReplay: false,
        code: "SESSION_EXPIRED",
        orderId: order.orderId,
        newOrderStatus: "EXPIRED",
      };
    }

    // 4. Order state guard (prevent overwriting already finalized orders)
    if (order.currentStatus === "PAID" || order.currentStatus === "CANCELLED") {
      return {
        accepted: false,
        idempotentReplay: false,
        code: "ORDER_ALREADY_FINALIZED",
        orderId: order.orderId,
        newOrderStatus: order.currentStatus,
      };
    }

    // 5. Strict DZD amount integrity check
    if (payload.amountDZD !== order.expectedAmountDZD || payload.currency !== "DZD") {
      return {
        accepted: false,
        idempotentReplay: false,
        code: "AMOUNT_MISMATCH",
        orderId: order.orderId,
        newOrderStatus: order.currentStatus,
      };
    }

    // 6. Commit transition and record idempotency keys
    const newStatus: OrderPaymentExpectation["currentStatus"] =
      payload.status === "PAID" ? "PAID" : "CANCELLED";

    const result: WebhookProcessingResult = {
      accepted: true,
      idempotentReplay: false,
      code: payload.status === "PAID" ? "PAYMENT_CONFIRMED" : "PAYMENT_FAILED_RECORDED",
      orderId: order.orderId,
      newOrderStatus: newStatus,
    };

    this.processedEventIds.add(payload.eventId);
    this.processedOrderSessions.set(idempotencyKey, result);
    order.currentStatus = newStatus;

    return result;
  }

  /**
   * Persistent distributed variant backed by Firestore ACID transaction on `idempotency_keys`
   * so multi-instance Cloud Run containers share webhook deduplication across restarts.
   */
  public async processCallbackWithPersistence(
    payload: PaymentWebhookPayload,
    signatureHex: string,
    order: OrderPaymentExpectation,
    nowMs: number = Date.now()
  ): Promise<WebhookProcessingResult> {
    if (!verifyPaymentWebhookSignature(payload, signatureHex, this.webhookSecret)) {
      return {
        accepted: false,
        idempotentReplay: false,
        code: "INVALID_SIGNATURE",
        orderId: order.orderId,
        newOrderStatus: order.currentStatus,
      };
    }

    const idempotencyKey = `webhook_sess_${payload.orderId}_${payload.sessionId}_${payload.status}`;
    const eventDocKey = `webhook_evt_${payload.eventId}`;

    if (!db || typeof db.runTransaction !== "function") {
      return this.processCallback(payload, signatureHex, order, nowMs);
    }

    return db.runTransaction(async (tx) => {
      const eventRef = db.collection("idempotency_keys").doc(eventDocKey);
      const sessionRef = db.collection("idempotency_keys").doc(idempotencyKey);
      const [eventSnap, sessionSnap] = await Promise.all([tx.get(eventRef), tx.get(sessionRef)]);

      if (eventSnap.exists || sessionSnap.exists) {
        const storedData = (sessionSnap.exists ? sessionSnap.data() : eventSnap.data()) || {};
        const storedStatus = storedData.newOrderStatus as OrderPaymentExpectation["currentStatus"] | undefined;
        return {
          accepted: true,
          idempotentReplay: true,
          code: "DUPLICATE_CALLBACK_IGNORED",
          orderId: order.orderId,
          newOrderStatus: storedStatus || order.currentStatus,
        };
      }

      const result = this.processCallback(payload, signatureHex, order, nowMs);
      if (!result.accepted) {
        return result;
      }

      const record = {
        type: "payment_webhook",
        eventId: payload.eventId,
        idempotencyKey,
        orderId: payload.orderId,
        sessionId: payload.sessionId,
        provider: payload.provider,
        amountDZD: payload.amountDZD,
        newOrderStatus: result.newOrderStatus,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      tx.set(eventRef, record);
      tx.set(sessionRef, record);
      return result;
    });
  }
}
