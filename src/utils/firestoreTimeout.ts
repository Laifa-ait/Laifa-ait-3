import { safeLogger } from "./logger";

let circuitOpenUntil = 0;
let consecutiveTimeouts = 0;
const CIRCUIT_COOLDOWN_MS = 60_000; // 60 seconds cooldown when Admin gRPC is unreachable

export function isFirestoreAdminCircuitOpen(): boolean {
  return Date.now() < circuitOpenUntil;
}

export function resetFirestoreAdminCircuit(): void {
  circuitOpenUntil = 0;
  consecutiveTimeouts = 0;
}

export function isFirestoreQuotaError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("Quota limit exceeded") ||
    msg.includes("Quota exceeded")
  );
}

/**
 * Executes a Firestore Admin SDK operation with a strict deadline and automatic Circuit Breaker.
 * Prevents @google-cloud/firestore gRPC metadata/credential retries from hanging HTTP requests
 * for 30-120 seconds when running in containers without explicit Admin IAM credentials or when quota is exhausted.
 */
export async function withFirestoreDeadline<T>(
  operation: () => Promise<T>,
  fallback: T,
  timeoutMs = 1500,
  label = "firestore_op"
): Promise<T> {
  if (Date.now() < circuitOpenUntil) {
    return fallback;
  }

  if (process.env.NODE_ENV === "test" || process.env.VITEST) {
    try {
      return await operation();
    } catch (err: unknown) {
      if (isFirestoreQuotaError(err)) {
        circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
      }
      return fallback;
    }
  }

  let timer: NodeJS.Timeout | null = null;
  try {
    const result = await Promise.race<T>([
      operation(),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`FIRESTORE_DEADLINE_EXCEEDED:${label}:${timeoutMs}ms`));
        }, timeoutMs);
        timer.unref?.();
      }),
    ]);
    consecutiveTimeouts = 0;
    return result;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isQuota = isFirestoreQuotaError(err);
    const isDeadlineOrAuth =
      isQuota ||
      msg.includes("FIRESTORE_DEADLINE_EXCEEDED") ||
      msg.includes("DEADLINE_EXCEEDED") ||
      msg.includes("UNAUTHENTICATED") ||
      msg.includes("PERMISSION_DENIED") ||
      msg.includes("Could not load the default credentials") ||
      msg.includes("169.254.169.254");

    if (isQuota) {
      circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
      safeLogger.warn(
        `[Firestore Core] ⚡ Quota limit exceeded (RESOURCE_EXHAUSTED) on (${label}). Circuit breaker opened for ${CIRCUIT_COOLDOWN_MS / 1000}s.`
      );
    } else if (isDeadlineOrAuth) {
      consecutiveTimeouts++;
      if (consecutiveTimeouts >= 2) {
        circuitOpenUntil = Date.now() + CIRCUIT_COOLDOWN_MS;
        safeLogger.warn(
          `[Firestore Core] ⚡ Circuit breaker opened for ${CIRCUIT_COOLDOWN_MS / 1000}s after repeated Admin SDK timeouts (${label})`
        );
      }
    }
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

