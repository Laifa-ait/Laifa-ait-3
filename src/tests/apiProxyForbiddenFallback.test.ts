// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Request } from "express";

vi.mock("../lib/firebase", () => ({
  auth: {
    currentUser: {
      uid: "seller_test_uid",
      getIdToken: vi.fn().mockResolvedValue("firebase_jwt_token_123"),
    },
  },
}));

import { apiGet, resetProxySafeAuthFallback } from "../lib/api";
import { extractAuthCredential } from "../middlewares/auth";

describe("API Client & Auth Middleware — Reverse-Proxy HTML 403 Recovery", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    resetProxySafeAuthFallback();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("1. extractAuthCredential lit Authorization en priorité et accepte X-Firebase-Auth en fallback", () => {
    const reqPrimary = {
      headers: { authorization: "Bearer token_primary" },
      cookies: {},
    } as unknown as Request;
    expect(extractAuthCredential(reqPrimary)).toEqual({ token: "token_primary", isCookie: false });

    const reqFallback = {
      headers: { "x-firebase-auth": "Bearer token_proxy_safe" },
      cookies: {},
    } as unknown as Request;
    expect(extractAuthCredential(reqFallback)).toEqual({ token: "token_proxy_safe", isCookie: false });
  });

  it("2. apiGet bascule automatiquement sur X-Firebase-Auth lors d'une 403 HTML du proxy et récupère les stats", async () => {
    const html403 = new Response("<html><head><title>403 Forbidden</title></head><body><h1>403 Forbidden</h1></body></html>", {
      status: 403,
      headers: { "content-type": "text/html" },
    });
    const okJson = new Response(JSON.stringify({ stats: { totalSales: 12500, orderCount: 4 } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

    const fetchMock = vi.fn().mockResolvedValueOnce(html403).mockResolvedValueOnce(okJson);
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await apiGet<{ stats: { totalSales: number; orderCount: number } }>("/api/v1/seller/overview-stats");
    expect(result.stats.totalSales).toBe(12500);
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const firstInit = fetchMock.mock.calls[0][1] as RequestInit;
    const secondInit = fetchMock.mock.calls[1][1] as RequestInit;
    expect(firstInit.credentials).toBe("same-origin");
    expect((firstInit.headers as Record<string, string>)["Authorization"]).toBe("Bearer firebase_jwt_token_123");
    expect((secondInit.headers as Record<string, string>)["Authorization"]).toBeUndefined();
    expect((secondInit.headers as Record<string, string>)["X-Firebase-Auth"]).toBe("Bearer firebase_jwt_token_123");
  });

  it("3. apiGet nettoie les messages d'erreur HTML proxy au lieu d'exposer du HTML brut", async () => {
    const makeHtml403 = () =>
      new Response("<html><head><title>403 Forbidden</title></head><body><h1>403 Forbidden</h1></body></html>", {
        status: 403,
        headers: { "content-type": "text/html" },
      });

    const fetchMock = vi.fn().mockImplementation(async () => makeHtml403());
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(apiGet("/api/v1/seller/overview-stats", 2)).rejects.toThrow(
      "Accès temporairement bloqué par le proxy réseau (HTTP 403)"
    );
  });
});
