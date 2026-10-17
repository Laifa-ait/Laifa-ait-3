import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

/**
 * Contexte de trace pour chaque requête entrante sur le gateway Olmart
 */
export interface RequestTraceContext {
  requestId: string;
  method: string;
  path: string;
  startTime: number;
  userId?: string;
  ip?: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestTraceContext>();

/**
 * Récupère le contexte actif de la requête courante (ou undefined hors requête)
 */
export function getRequestContext(): RequestTraceContext | undefined {
  return requestContextStorage.getStore();
}

/**
 * Récupère l'identifiant de trace courant ou génère un fallback éphémère
 */
export function getCurrentRequestId(): string {
  const store = requestContextStorage.getStore();
  return store?.requestId || `gen_${randomUUID()}`;
}

/**
 * Exécute une fonction synchrone ou asynchrone dans un contexte de trace spécifique
 */
export function runWithRequestContext<T>(
  context: RequestTraceContext,
  fn: () => T | Promise<T>
): T | Promise<T> {
  return requestContextStorage.run(context, fn);
}
