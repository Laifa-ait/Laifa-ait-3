import { Router, Request, Response } from "express";
import { db } from "../../config/firebase-admin";
import { CoreService, LogErrorBody } from "../../services/CoreService";
import { TrendingSearchesService } from "../../services/TrendingSearchesService";
import { safeLogger } from "../../utils/logger";
import { debugLimiter } from "../../middlewares/rateLimiters";
import { PublicShopDTO } from "../seller/shop.types";
import { buildWhitelistedShopDTO } from "../seller/shopPublic.projection";
import { handleProxyVideo } from "./proxyVideo.handler";
import { USER_STATUSES } from "../user/user.status";

const router = Router();

// GET proxy video with whitelist protection
router.get("/api/v1/proxy-video", handleProxyVideo);

// GET public homepage data
router.get("/api/v1/public/home-data", async (_req: Request, res: Response) => {
  try {
    const data = await CoreService.getHomeData();
    return res.json(data);
  } catch (err: unknown) {
    safeLogger.error("[public.routes] /api/v1/public/home-data failed", { err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Erreur interne lors du chargement des données d'accueil" });
  }
});

// GET public settings
router.get("/api/v1/public/settings", async (_req: Request, res: Response) => {
  try {
    const data = await CoreService.getPublicSettings();
    return res.json(data);
  } catch (err: unknown) {
    safeLogger.error("[public.routes] /api/v1/public/settings failed", { err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Erreur interne lors du chargement de la configuration" });
  }
});

// POST log client site errors
router.post("/api/v1/logs/error", debugLimiter, async (req: Request, res: Response) => {
  try {
    await CoreService.logError(req.body as LogErrorBody);
    return res.json({ success: true });
  } catch (err: unknown) {
    safeLogger.error("[public.routes] /api/v1/logs/error failed", { err: err instanceof Error ? err.message : String(err) });
    return res.status(500).json({ error: "Erreur interne lors de l'enregistrement du rapport" });
  }
});

let publicProfilesCache: { timestamp: number; profiles: PublicShopDTO[] } | null = null;
let inFlightPublicProfiles: Promise<PublicShopDTO[]> | null = null;
const profileByIdCache = new Map<string, { timestamp: number; dto: PublicShopDTO | null }>();
const PROFILES_CACHE_TTL_MS = 5 * 60 * 1000; // 5m TTL to prevent Firestore read amplification

// GET public profiles list (Authoritative projection with strict whitelist & 5m cache)
router.get("/api/v1/public-profiles", async (_req: Request, res: Response) => {
  try {
    if (
      process.env.NODE_ENV !== "test" &&
      publicProfilesCache &&
      Date.now() - publicProfilesCache.timestamp < PROFILES_CACHE_TTL_MS
    ) {
      return res.json({ success: true, profiles: publicProfilesCache.profiles });
    }

    if (!db || typeof db.collection !== "function") {
      safeLogger.warn("/api/v1/public-profiles called before Firestore initialized, returning empty profiles");
      return res.json({ success: true, profiles: [] });
    }

    if (!inFlightPublicProfiles) {
      inFlightPublicProfiles = (async () => {
        const usersSnap = await db
          .collection("users")
          .where("role", "==", "seller")
          .where("status", "==", USER_STATUSES.ACTIVE)
          .limit(100)
          .get();

        if (usersSnap.empty) {
          publicProfilesCache = { timestamp: Date.now(), profiles: [] };
          return [];
        }

        const pubDocPromises = usersSnap.docs.map((doc) => db.collection("publicProfiles").doc(doc.id).get());
        const pubDocs = await Promise.all(pubDocPromises);

        const pubDocsMap = new Map<string, Record<string, unknown>>();
        pubDocs.forEach((doc) => {
          if (doc.exists) {
            pubDocsMap.set(doc.id, doc.data() || {});
          }
        });

        const now = Date.now();
        const profiles: PublicShopDTO[] = usersSnap.docs.map((userDoc) => {
          const userData = userDoc.data() || {};
          const pubData = pubDocsMap.get(userDoc.id) || {};
          const dto = buildWhitelistedShopDTO(userDoc.id, userData, pubData);
          profileByIdCache.set(userDoc.id, { timestamp: now, dto });
          return dto;
        });

        publicProfilesCache = { timestamp: now, profiles };
        safeLogger.info("/api/v1/public-profiles fetched public profiles", { count: profiles.length });
        return profiles;
      })().finally(() => {
        inFlightPublicProfiles = null;
      });
    }

    const profiles = await inFlightPublicProfiles;
    return res.json({ success: true, profiles });
  } catch (err: unknown) {
    safeLogger.error("Error fetching public profiles", {
      err: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des profils publics" });
  }
});

// POST /api/v1/public-profiles (Batch lookup for checkout & cart - max 20 IDs, cached per ID for 5m)
router.post("/api/v1/public-profiles", async (req: Request, res: Response) => {
  try {
    const rawIds = req.body?.ids;
    if (!Array.isArray(rawIds)) {
      return res.status(400).json({ success: false, error: "Paramètre 'ids' invalide (tableau requis)" });
    }

    const sellerIds = Array.from(
      new Set(rawIds.filter((id): id is string => typeof id === "string" && Boolean(id.trim())))
    ).slice(0, 20);

    if (sellerIds.length === 0) {
      return res.json({ success: true, profiles: {} });
    }

    if (!db || typeof db.collection !== "function") {
      safeLogger.warn("POST /api/v1/public-profiles called before Firestore initialized, returning empty profiles");
      return res.json({ success: true, profiles: {} });
    }

    const now = Date.now();
    const useCache = process.env.NODE_ENV !== "test";
    const profilesMap: Record<string, PublicShopDTO> = {};
    const missingIds: string[] = [];

    for (const id of sellerIds) {
      const cached = useCache ? profileByIdCache.get(id) : undefined;
      if (cached && now - cached.timestamp < PROFILES_CACHE_TTL_MS) {
        if (cached.dto) profilesMap[id] = cached.dto;
      } else {
        missingIds.push(id);
      }
    }

    if (missingIds.length > 0) {
      const userDocPromises = missingIds.map((id) => db.collection("users").doc(id).get());
      const pubDocPromises = missingIds.map((id) => db.collection("publicProfiles").doc(id).get());

      const [userDocs, pubDocs] = await Promise.all([
        Promise.all(userDocPromises),
        Promise.all(pubDocPromises),
      ]);

      const pubDocsMap = new Map<string, Record<string, unknown>>();
      pubDocs.forEach((doc) => {
        if (doc.exists) {
          pubDocsMap.set(doc.id, doc.data() || {});
        }
      });

      if (profileByIdCache.size > 500) profileByIdCache.clear();

      userDocs.forEach((userDoc, idx) => {
        const id = userDoc.id || missingIds[idx];
        let dto: PublicShopDTO | null = null;
        if (userDoc.exists) {
          const userData = userDoc.data() || {};
          const pubData = pubDocsMap.get(id) || {};
          dto = buildWhitelistedShopDTO(id, userData, pubData);
        } else {
          const pubData = pubDocsMap.get(id);
          if (pubData) {
            dto = buildWhitelistedShopDTO(id, {}, pubData);
          }
        }
        if (dto) profilesMap[id] = dto;
        if (useCache) profileByIdCache.set(id, { timestamp: now, dto });
      });
    }

    safeLogger.info("/api/v1/public-profiles batch fetched profiles", {
      requested: sellerIds.length,
      fetchedFromDb: missingIds.length,
      found: Object.keys(profilesMap).length,
    });
    return res.json({ success: true, profiles: profilesMap });
  } catch (err: unknown) {
    safeLogger.error("Error in POST /api/v1/public-profiles", {
      err: err instanceof Error ? err.message : String(err),
    });
    return res.status(500).json({ success: false, error: "Erreur lors de la récupération des profils publics" });
  }
});

// GET /api/v1/platform-stats/trending_searches (Zero-cost cached real platform trends)
router.get("/api/v1/platform-stats/trending_searches", async (_req: Request, res: Response) => {
  try {
    const terms = await TrendingSearchesService.getTrendingSearches();
    return res.json({ success: true, terms });
  } catch {
    return res.json({ success: true, terms: [] });
  }
});

export default router;
