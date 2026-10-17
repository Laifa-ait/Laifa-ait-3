import "dotenv/config";
import * as Sentry from "@sentry/node";
import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import { apiLimiter, debugLimiter, adminLimiter } from "./src/middlewares/rateLimiters";
import { helmetMiddleware, corsMiddleware, preventDirectCloudRunAccess, nonceMiddleware } from "./src/middlewares/security";
import { handleCspReport } from "./src/middlewares/cspReporter";
import { csrfProtection, getCsrfTokenHandler } from "./src/middlewares/csrf";
import { optionalAuthenticateToken, authenticateToken, authorizeAdmin } from "./src/middlewares/auth";
import { deprecationMiddleware } from "./src/middlewares/deprecation";
import { requestIdMiddleware } from "./src/middlewares/requestId";
import { generateOpenApiSpec } from "./src/swagger/openapi";
import { safeLogger } from "./src/utils/logger";
import { getCurrentRequestId } from "./src/utils/requestContext";

import healthRouter from "./src/domains/health/health.routes";
import authRouter from "./src/domains/auth/auth.routes";
import aiRouter from "./src/domains/ai/ai.routes";
import ordersRouter from "./src/domains/order/order.routes";
import adminRouter from "./src/domains/admin/admin.routes";
import coreRouter from "./src/domains/core.routes";
import productsRouter from "./src/domains/product/product.routes";
import reviewsRouter from "./src/domains/review/review.routes";
import workspaceRouter from "./src/domains/workspace/workspace.routes";
import disputesRouter from "./src/domains/dispute/controllers/DisputeController";
import shippingRouter from "./src/domains/shipping/routes";
import { olmaUniversRouter } from "./src/domains/olmaUnivers/olmaUnivers.routes";
import { artisanRouter } from "./src/domains/artisan/artisan.routes";
import { realEstateRouter } from "./src/domains/realEstate/realEstate.routes";
import messagingRouter from "./src/domains/messaging/messaging.routes";
import bootstrapRouter from "./src/domains/bootstrap/bootstrap.routes";
import { domainUserDocumentsRouter } from "./src/domains/userDocuments/userDocuments.routes";
import { autoRouter } from "./src/domains/auto/auto.routes";

if (!process.env.NODE_ENV) {
  const isCloudRunInstance = Boolean(process.env.K_SERVICE || process.env.CLOUD_RUN_JOB);
  const isRunningTsx = Boolean(
    process.env.TSX_TSCONFIG_PATH ||
    process.execPath.includes("tsx") ||
    process.argv.some((arg) => arg.includes("tsx"))
  );
  process.env.NODE_ENV = isCloudRunInstance || !isRunningTsx ? "production" : "development";
}


if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 0.1,
  });
}

export const app = express();

// Express running behind Cloud Run / Nginx reverse proxy (1 hop).
app.set("trust proxy", 1);

// Correlation ID & Async Request Tracing (Mounted at entrance for 100% route coverage)
app.use(requestIdMiddleware);

// Security Guard: Block public HTTP access to sourcemap (.map) files across all static and API routes
app.use((req, res, next) => {
  const rawUrl = (req.originalUrl || req.url || req.path || "").toLowerCase();
  if (rawUrl.includes(".map")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    return res.status(404).type("text/plain").send("Not Found");
  }
  next();
});

// Health Probes (Live & Ready) - Mounted FIRST for immediate, non-blocking Cloud Run health checks
app.use(healthRouter);

// Security & Rate Limiting Middlewares (Active by default across all environments)
// SKIP_RATE_LIMITS is strictly ignored in production and development to ensure fail-safe operation.
app.use(preventDirectCloudRunAccess);
app.use("/api/v1/admin", adminLimiter);

const isRateLimitBypassedInTest = process.env.NODE_ENV === "test" && process.env.SKIP_RATE_LIMITS === "true";
if (!isRateLimitBypassedInTest) {
  app.use("/api/v1", apiLimiter);
}
app.use(nonceMiddleware);
app.use(helmetMiddleware);
app.use(corsMiddleware);
app.post(
  "/api/v1/csp-report",
  debugLimiter,
  express.json({ type: ["application/csp-report", "application/json"] }),
  handleCspReport
);
app.use(compression() as unknown as express.RequestHandler);
app.use(cookieParser());

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));

// CSRF & Versioning Deprecation Tracking
app.use(deprecationMiddleware);
app.use(optionalAuthenticateToken);
app.get("/api/v1/csrf-token", getCsrfTokenHandler);
app.use("/api", csrfProtection);

// Swagger Documentation (Lazy Loaded & Production Restricted)
let swaggerMiddleware: express.RequestHandler | null = null;
app.use(
  "/api-docs",
  (req: Request, res: Response, next: NextFunction) => {
    if (process.env.NODE_ENV === "production") {
      return authenticateToken(req, res, () => {
        return authorizeAdmin(req, res, next);
      });
    }
    return next();
  },
  (req: Request, res: Response, next: NextFunction) => {
    if (!swaggerMiddleware) {
      const openApiDoc = generateOpenApiSpec();
      swaggerMiddleware = swaggerUi.setup(openApiDoc) as unknown as express.RequestHandler;
    }
    return (swaggerUi.serve as unknown as express.RequestHandler)(req, res, () => {
      if (swaggerMiddleware) {
        return swaggerMiddleware(req, res, next);
      }
      return next();
    });
  }
);

// -----------------------------------------------------------------------------
// OLMART API GATEWAY ROUTER PIPELINE
// -----------------------------------------------------------------------------
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/workspace", workspaceRouter);
app.use("/api/v1/shipping", shippingRouter);
app.use("/api/v1/disputes", disputesRouter);
app.use("/api/v1", aiRouter);
app.use("/api/v1", ordersRouter);
app.use("/api/v1", adminRouter);
app.use("/api/v1", olmaUniversRouter);
app.use("/api/v1", artisanRouter);
app.use("/api/v1/real-estate", realEstateRouter);
app.use("/api/v1/auto", autoRouter);
app.use("/api/v1/messaging", messagingRouter);

app.use("/api/v1/user-documents", domainUserDocumentsRouter);
app.use("/api/v1", bootstrapRouter);

// Domain catalog & core gateways
app.use("/", productsRouter);
app.use("/", coreRouter);

// Catch-all 404 handler for any unhandled /api requests to prevent falling through to SPA HTML serving
app.all(["/api", "/api/*"], (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  return res.status(404).json({ error: `Endpoint API introuvable: ${req.method} ${req.originalUrl}` });
});

if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const isError = err instanceof Error;
  const message = isError ? err.message : String(err);
  const stack = isError ? err.stack : undefined;
  const requestId = req.requestId || getCurrentRequestId();
  safeLogger.error(`[Global Error Handler] ❌ Request to ${req.method} ${req.path} failed`, {
    requestId,
    message,
    stack: stack || ""
  });
  res.status(500).json({ error: "Une erreur interne du serveur est survenue.", requestId });
});

export default app;

