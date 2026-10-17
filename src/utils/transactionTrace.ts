import { getCurrentRequestId, getRequestContext } from "./requestContext";
import { safeLogger } from "./logger";
import { recordTransactionMetric } from "./telemetry";

/**
 * Enveloppe de traçabilité pour les transactions Firestore ACID (Olmart Core).
 * 
 * Exigences respectées :
 * 1. Zéro requête/lecture/écriture Firestore additionnelle.
 * 2. Corrélation directe avec le Request ID de la requête HTTP ou du worker.
 * 3. Mesure précise de la latence de commit / rollback.
 * 4. Préservation intégrale de la sémantique d'erreur pour les transactions atomiques Firestore.
 */
export async function traceTransactionExecution<T>(
  transactionName: string,
  execute: () => Promise<T>
): Promise<T> {
  const requestId = getCurrentRequestId();
  const context = getRequestContext();
  const startHr = process.hrtime.bigint();

  safeLogger.info(`[Firestore Core] 🟢 Transaction [${transactionName}] initiated`, {
    transaction: transactionName,
    requestId,
    route: context?.path,
  });

  try {
    const result = await execute();
    const endHr = process.hrtime.bigint();
    const durationMs = Number((Number(endHr - startHr) / 1_000_000).toFixed(2));

    safeLogger.info(
      `[Firestore Core] 🟢 Transaction [${transactionName}] committed (${durationMs}ms)`,
      {
        transaction: transactionName,
        requestId,
        durationMs,
        success: true,
      }
    );

    recordTransactionMetric({
      name: transactionName,
      durationMs,
      success: true,
      timestamp: new Date().toISOString(),
      requestId: requestId || "unknown",
    });

    return result;
  } catch (err) {
    const endHr = process.hrtime.bigint();
    const durationMs = Number((Number(endHr - startHr) / 1_000_000).toFixed(2));
    const errorMsg = err instanceof Error ? err.message : String(err);

    safeLogger.error(
      `[Firestore Core] ❌ Transaction [${transactionName}] failed/rolled back (${durationMs}ms)`,
      {
        transaction: transactionName,
        requestId,
        durationMs,
        error: errorMsg,
        success: false,
      }
    );

    recordTransactionMetric({
      name: transactionName,
      durationMs,
      success: false,
      timestamp: new Date().toISOString(),
      requestId: requestId || "unknown",
    });

    // Propager immédiatement l'erreur originale pour garantir le rollback Firestore ACID
    throw err;
  }
}
