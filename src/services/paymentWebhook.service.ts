import crypto from "node:crypto";

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
}
