import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import express, { Request, Response } from "express";
import { requestIdMiddleware, isValidClientId } from "../middlewares/requestId";
import { getRequestContext, getCurrentRequestId, runWithRequestContext } from "../utils/requestContext";
import { safeLogger, loggerInstance } from "../utils/logger";
import { traceTransactionExecution } from "../utils/transactionTrace";

describe("Observabilité Olmart — Request ID, AsyncLocalStorage & Tracing", () => {
  it("EXIGENCE 1: Génère un UUID serveur unique pour chaque requête lorsque l'en-tête est absent", async () => {
    const app = express();
    app.use(requestIdMiddleware);
    app.get("/test-id", (req: Request, res: Response) => {
      res.json({ requestId: req.requestId });
    });

    const res1 = await request(app).get("/test-id");
    const res2 = await request(app).get("/test-id");

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(res1.body.requestId).toMatch(uuidRegex);
    expect(res2.body.requestId).toMatch(uuidRegex);
    expect(res1.body.requestId).not.toBe(res2.body.requestId);
  });

  it("EXIGENCE 2: Retourne l'en-tête X-Request-ID dans la réponse HTTP", async () => {
    const app = express();
    app.use(requestIdMiddleware);
    app.get("/test-header", (_req: Request, res: Response) => {
      res.send("ok");
    });

    const res = await request(app).get("/test-header");
    expect(res.status).toBe(200);
    expect(res.headers["x-request-id"]).toBeDefined();
    expect(typeof res.headers["x-request-id"]).toBe("string");
    expect(res.headers["x-request-id"].length).toBeGreaterThan(10);
  });

  it("EXIGENCE 3 (Anti-Piège): Rejette et assainit les identifiants clients suspects (CRLF injection, tags, payloads)", async () => {
    expect(isValidClientId("req\r\nX-Injected: attack")).toBe(false);
    expect(isValidClientId("<script>alert(1)</script>")).toBe(false);
    expect(isValidClientId("short")).toBe(false); // < 8 caractères
    expect(isValidClientId("a".repeat(70))).toBe(false); // > 64 caractères
    expect(isValidClientId("client_valid_12345678")).toBe(true);

    const app = express();
    app.use(requestIdMiddleware);
    app.get("/test-client-id", (req: Request, res: Response) => {
      res.json({ requestId: req.requestId });
    });

    // Envoi d'un ID avec des caractères invalides (espace, balise, symbole)
    const resBad = await request(app)
      .get("/test-client-id")
      .set("X-Request-ID", "malicious_script_<script>");

    // Doit avoir été rejeté et remplacé par un UUID sain
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(resBad.body.requestId).toMatch(uuidRegex);
    expect(resBad.headers["x-request-id"]).toMatch(uuidRegex);

    // Envoi d'un ID valide
    const resGood = await request(app)
      .get("/test-client-id")
      .set("X-Request-ID", "client_req_abcdef_123456");

    expect(resGood.body.requestId).toBe("client_req_abcdef_123456");
    expect(resGood.headers["x-request-id"]).toBe("client_req_abcdef_123456");
  });

  it("EXIGENCE 4: Propage le contexte via AsyncLocalStorage dans les appels asynchrones imbriqués", async () => {
    let capturedRequestId = "";
    let capturedPath = "";

    async function deepAsyncServiceCall(): Promise<string> {
      await new Promise((resolve) => setTimeout(resolve, 5));
      const ctx = getRequestContext();
      capturedRequestId = ctx?.requestId || "";
      capturedPath = ctx?.path || "";
      return getCurrentRequestId();
    }

    const app = express();
    app.use(requestIdMiddleware);
    app.get("/async-context", async (_req: Request, res: Response) => {
      const idFromDeepCall = await deepAsyncServiceCall();
      res.json({ idFromDeepCall });
    });

    const res = await request(app).get("/async-context");
    expect(res.status).toBe(200);
    expect(capturedRequestId).toBeTruthy();
    expect(capturedRequestId).toBe(res.body.idFromDeepCall);
    expect(res.headers["x-request-id"]).toBe(capturedRequestId);
    expect(capturedPath).toBe("/async-context");
  });

  it("EXIGENCE 5: safeLogger enrichit automatiquement les sorties avec le Request ID actif", async () => {
    const loggerSpy = vi.spyOn(loggerInstance, "info").mockImplementation(() => loggerInstance);

    const context = {
      requestId: "test-trace-uuid-12345",
      method: "POST",
      path: "/api/v1/orders",
      startTime: Date.now(),
    };

    await runWithRequestContext(context, async () => {
      safeLogger.info("Traitement commande en cours", { amount: 5000 });
    });

    expect(loggerSpy).toHaveBeenCalled();
    const lastCallArg = loggerSpy.mock.calls[loggerSpy.mock.calls.length - 1][0];
    expect(lastCallArg).toHaveProperty("requestId", "test-trace-uuid-12345");
    expect(lastCallArg).toHaveProperty("amount", 5000);

    loggerSpy.mockRestore();
  });

  it("EXIGENCE 6: Tracing des transactions Firestore sans modification de la logique métier ni lectures superflues", async () => {
    const infoSpy = vi.spyOn(safeLogger, "info");
    const errorSpy = vi.spyOn(safeLogger, "error");

    // Test transaction réussie
    const result = await traceTransactionExecution("order_checkout_test", async () => {
      await new Promise((r) => setTimeout(r, 10));
      return { success: true, orderId: "ord_123" };
    });

    expect(result.success).toBe(true);
    expect(result.orderId).toBe("ord_123");
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("Transaction [order_checkout_test] initiated"),
      expect.any(Object)
    );
    expect(infoSpy).toHaveBeenCalledWith(
      expect.stringContaining("Transaction [order_checkout_test] committed"),
      expect.any(Object)
    );

    // Test transaction échouée (doit re-throw sans modifier l'erreur)
    await expect(
      traceTransactionExecution("order_failure_test", async () => {
        throw new Error("Stock insuffisant");
      })
    ).rejects.toThrow("Stock insuffisant");

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Transaction [order_failure_test] failed/rolled back"),
      expect.any(Object)
    );

    infoSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it("EXIGENCE 7: Concurrence de 50 requêtes HTTP parallèles sans fuite ni mélange de contexte AsyncLocalStorage", async () => {
    const app = express();
    app.use(requestIdMiddleware);

    // Route simulant un traitement asynchrone réaliste avec entrelacement variable
    app.get("/concurrent-test/:index", async (req: Request, res: Response) => {
      const startCtx = getRequestContext();
      const requestIdAtStart = startCtx?.requestId || "";

      // Entrelacement asynchrone artificiel avec délais variables (1 à 25ms)
      const delayMs = Math.floor(Math.random() * 25) + 1;
      await new Promise((resolve) => setTimeout(resolve, delayMs));

      const endCtx = getRequestContext();
      const requestIdAtEnd = endCtx?.requestId || "";

      // Vérifier que le contexte au début et à la fin de l'appel reste strictement identique
      const isContextPreserved = requestIdAtStart === requestIdAtEnd && requestIdAtStart === req.requestId;

      res.json({
        index: req.params.index,
        requestId: req.requestId,
        requestIdAtStart,
        requestIdAtEnd,
        isContextPreserved,
      });
    });

    // Lancement simultané de 50 requêtes HTTP
    const totalRequests = 50;
    const requestPromises = Array.from({ length: totalRequests }, (_, i) =>
      request(app).get(`/concurrent-test/${i}`)
    );

    const responses = await Promise.all(requestPromises);

    expect(responses.length).toBe(totalRequests);

    const requestIds = new Set<string>();

    for (const res of responses) {
      expect(res.status).toBe(200);
      const headerId = res.headers["x-request-id"];
      const bodyId = res.body.requestId;

      expect(headerId).toBeDefined();
      expect(headerId).toBe(bodyId);
      expect(res.body.isContextPreserved).toBe(true);

      requestIds.add(headerId);
    }

    // Unicité absolue : 50 identifiants distincts générés
    expect(requestIds.size).toBe(totalRequests);
  });
});
