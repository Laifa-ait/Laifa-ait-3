import { auth } from "./firebase";

let cachedCsrfToken: string | null = null;
let cachedCsrfUid: string | null = null;
let useProxySafeAuthHeader = false;

export function clearCsrfTokenCache(): void {
  cachedCsrfToken = null;
  cachedCsrfUid = null;
}

export function resetProxySafeAuthFallback(): void {
  useProxySafeAuthHeader = false;
}

function attachTokenHeader(headers: Record<string, string>, token: string): void {
  headers[useProxySafeAuthHeader ? "X-Firebase-Auth" : "Authorization"] = `Bearer ${token}`;
}

function isHtmlPayload(res: Response, text?: string): boolean {
  const ct = (res.headers?.get("content-type") || "").toLowerCase();
  if (ct.includes("text/html")) return true;
  if (!text) return false;
  const trimmed = text.trim().toLowerCase();
  return trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html");
}

function shouldSwitchToProxySafeAuth(res: Response, headers: Record<string, string>): boolean {
  if (res.status === 403 && isHtmlPayload(res) && !useProxySafeAuthHeader && headers["Authorization"]) {
    useProxySafeAuthHeader = true;
    return true;
  }
  return false;
}

export async function getCsrfToken(authToken?: string): Promise<string | null> {
  const currentUid = auth.currentUser?.uid || "guest";
  if (cachedCsrfToken && cachedCsrfUid === currentUid) return cachedCsrfToken;
  try {
    const reqHeaders: Record<string, string> = {};
    if (authToken) attachTokenHeader(reqHeaders, authToken);
    else if (auth.currentUser) attachTokenHeader(reqHeaders, await auth.currentUser.getIdToken());

    let res = await fetch("/api/v1/csrf-token", { headers: reqHeaders, credentials: "same-origin" });
    if (shouldSwitchToProxySafeAuth(res, reqHeaders)) {
      res = await fetch("/api/v1/csrf-token", {
        headers: { "X-Firebase-Auth": reqHeaders["Authorization"] },
        credentials: "same-origin",
      });
    }
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.csrfToken) {
        cachedCsrfToken = data.csrfToken;
        cachedCsrfUid = currentUid;
        return cachedCsrfToken;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export async function getAuthHeaders(includeCsrf = false, forceRefresh = false): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  };
  let token: string | undefined;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken(forceRefresh);
      attachTokenHeader(headers, token);
    } catch {
      // ignore
    }
  }
  if (includeCsrf) {
    const csrfToken = await getCsrfToken(token);
    if (csrfToken) headers["X-CSRF-Token"] = csrfToken;
  }
  return headers;
}

export interface ApiError extends Error {
  status?: number;
  isProxyHtml?: boolean;
}

async function handleResponseError(res: Response): Promise<never> {
  const text = await res.text();
  const proxyHtml = isHtmlPayload(res, text);
  let errMsg = proxyHtml
    ? `Accès temporairement bloqué par le proxy réseau (HTTP ${res.status}). Veuillez réessayer.`
    : text;

  if (!proxyHtml) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object") {
        if (parsed.error === "MFA_REQUIRED" && typeof window !== "undefined") {
          window.dispatchEvent(new Event("open-2fa-modal"));
        }
        const details = Array.isArray(parsed.details)
          ? (parsed.details as Array<{ path?: string; message?: string }>)
              .slice(0, 3)
              .map((d) => (d.path ? `${d.path}: ${d.message || "invalide"}` : d.message || ""))
              .filter(Boolean)
          : [];
        const baseMsg = parsed.message || parsed.error || text;
        errMsg = details.length > 0 ? `${baseMsg} (${details.join(" ; ")})` : baseMsg;
      }
    } catch {
      // keep plain text
    }
  }
  const error: ApiError = new Error(errMsg || `API Error ${res.status}`);
  error.status = res.status;
  if (proxyHtml) error.isProxyHtml = true;
  throw error;
}

async function parseJsonResponse<T>(res: Response, path: string): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`API ${path} returned non-JSON response (${res.status}): ${text.substring(0, 100)}`);
  }
  return res.json() as Promise<T>;
}

export interface AppBootstrapData {
  megamenu?: unknown;
  categories?: unknown;
  featuredProducts?: unknown[];
  profile?: unknown | null;
  cart?: unknown[];
  wishlist?: unknown[];
}

export async function fetchAppBootstrap(): Promise<AppBootstrapData> {
  const res = await apiGet<{ success: boolean; data: AppBootstrapData }>("/api/v1/bootstrap");
  return res.data;
}

function isRetryableApiError(err: ApiError): boolean {
  return Boolean(
    err?.isProxyHtml ||
      err?.message === "Failed to fetch" ||
      (err?.status && (err.status >= 500 || err.status === 429)) ||
      err?.message?.includes("Rate exceeded") ||
      err?.message?.includes("returned non-JSON response")
  );
}

const backoffDelay = (attempt: number) =>
  new Promise((resolve) => setTimeout(resolve, 350 * Math.pow(2, attempt) + Math.random() * 150));

export async function apiGet<T>(path: string, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const headers = await getAuthHeaders(false, i > 0);
      const res = await fetch(path, { headers, credentials: "same-origin" });
      if (!res.ok) {
        if (res.status === 401 && i === 0 && auth.currentUser) continue;
        if (shouldSwitchToProxySafeAuth(res, headers)) continue;
        await handleResponseError(res);
      }
      return parseJsonResponse<T>(res, path);
    } catch (error: unknown) {
      const err = error as ApiError;
      if (i === retries - 1) {
        if (err?.status === 401 && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        throw error;
      }
      if (err?.status === 401) continue;
      if (isRetryableApiError(err)) {
        if (err?.status === 403 && err.isProxyHtml) useProxySafeAuthHeader = true;
        await backoffDelay(i);
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to fetch after retries");
}

export async function apiPost<T>(path: string, body: unknown = {}, retries = 2): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const headers = await getAuthHeaders(true, i > 0);
      const res = await fetch(path, { method: "POST", headers, credentials: "same-origin", body: JSON.stringify(body) });
      if (!res.ok) {
        if (res.status === 401 && i === 0 && auth.currentUser) continue;
        if (res.status === 403 && i === 0) {
          shouldSwitchToProxySafeAuth(res, headers);
          clearCsrfTokenCache();
          continue;
        }
        await handleResponseError(res);
      }
      return parseJsonResponse<T>(res, path);
    } catch (error: unknown) {
      const err = error as ApiError;
      if (i === retries - 1) {
        if (err?.status === 401 && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("auth:unauthorized"));
        throw error;
      }
      if (err?.status === 401 || err?.status === 403) continue;
      if (isRetryableApiError(err)) await backoffDelay(i);
      else throw error;
    }
  }
  throw new Error("Failed to fetch after retries");
}

async function apiMutate<T>(method: "PATCH" | "PUT" | "DELETE", path: string, body?: unknown): Promise<T> {
  let headers = await getAuthHeaders(true, false);
  const init: RequestInit = { method, headers, credentials: "same-origin", ...(body !== undefined ? { body: JSON.stringify(body) } : {}) };
  let res = await fetch(path, init);
  if ((res.status === 401 && auth.currentUser) || res.status === 403) {
    if (res.status === 403) {
      shouldSwitchToProxySafeAuth(res, headers);
      clearCsrfTokenCache();
    }
    headers = await getAuthHeaders(true, res.status === 401);
    res = await fetch(path, { ...init, headers });
  }
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    await handleResponseError(res);
  }
  return parseJsonResponse<T>(res, path);
}

export const apiPatch = <T>(path: string, body: unknown): Promise<T> => apiMutate<T>("PATCH", path, body);
export const apiPut = <T>(path: string, body: unknown): Promise<T> => apiMutate<T>("PUT", path, body);
export const apiDelete = <T>(path: string): Promise<T> => apiMutate<T>("DELETE", path);
