import { db } from "../config/firebase-admin";
import { safeLogger } from "../utils/logger";

export interface CachedUserProfile {
  exists: boolean;
  role?: string;
  status: string;
  capabilities: string[];
  cachedAt: number;
  data?: Record<string, unknown>;
  isErrorFallback?: boolean;
}

export interface ProfileEvaluationResult {
  userDocExists: boolean;
  dbRole?: string;
  dbStatus: string;
  dbCapabilities: string[];
  dbFetchError: boolean;
}

const userProfileCache = new Map<string, CachedUserProfile>();
const inFlightProfileLookups = new Map<string, Promise<{ exists: boolean; udata?: Record<string, unknown> }>>();

const MAX_PROFILE_CACHE_SIZE = 5000;
const PROFILE_CACHE_TTL_MS = 120 * 1000; // 2 minutes in-memory TTL
const STALE_CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour max age for Stale-While-Revalidate during DB errors
const ERROR_BACKOFF_MS = 60 * 1000; // 60s backoff after lookup failure to prevent hammering Firestore

function setBoundedCacheEntry(uid: string, entry: CachedUserProfile): void {
  if (!userProfileCache.has(uid) && userProfileCache.size >= MAX_PROFILE_CACHE_SIZE) {
    const oldestKey = userProfileCache.keys().next().value;
    if (oldestKey) {
      userProfileCache.delete(oldestKey);
    }
  }
  userProfileCache.set(uid, entry);
}

export function clearUserProfileCache(uid?: string): void {
  if (uid) {
    userProfileCache.delete(uid);
    inFlightProfileLookups.delete(uid);
  } else {
    userProfileCache.clear();
    inFlightProfileLookups.clear();
  }
}

export function getUserProfileFromCache(uid: string): Record<string, unknown> | null {
  const cached = userProfileCache.get(uid);
  if (cached && cached.data) {
    return cached.data;
  }
  return null;
}

export function setUserProfileInCache(uid: string, data: Record<string, unknown>): void {
  const existing = userProfileCache.get(uid);
  setBoundedCacheEntry(uid, {
    exists: true,
    role: (data.role as string) || existing?.role || "buyer",
    status: (data.status as string) || existing?.status || "active",
    capabilities: Array.isArray(data.capabilities) ? (data.capabilities as string[]) : existing?.capabilities || [],
    cachedAt: Date.now(),
    data,
  });
}

export async function resolveUserProfileFromCacheOrDb(
  uid: string,
  tokenRole: string
): Promise<ProfileEvaluationResult> {
  let dbRole: string | undefined = undefined;
  let dbStatus = "active";
  let dbCapabilities: string[] = [];
  let dbFetchError = false;
  let userDocExists = false;

  const now = Date.now();
  const cachedProfile = userProfileCache.get(uid);
  let shouldFetchFromDb = true;

  if (cachedProfile) {
    const age = now - cachedProfile.cachedAt;
    if (!cachedProfile.isErrorFallback && age < PROFILE_CACHE_TTL_MS) {
      userDocExists = cachedProfile.exists;
      dbRole = cachedProfile.role;
      dbStatus = cachedProfile.status;
      dbCapabilities = cachedProfile.capabilities;
      shouldFetchFromDb = false;
    } else if (cachedProfile.isErrorFallback && age < ERROR_BACKOFF_MS) {
      dbFetchError = true;
      shouldFetchFromDb = false;
    }
  }

  if (shouldFetchFromDb) {
    try {
      if (db) {
        let lookupPromise = inFlightProfileLookups.get(uid);
        if (!lookupPromise) {
          lookupPromise = (async () => {
            let timeoutId: NodeJS.Timeout | undefined;
            try {
              const userDoc = await Promise.race([
                db.collection("users").doc(uid).get(),
                new Promise<never>((_, reject) => {
                  timeoutId = setTimeout(() => reject(new Error("Firestore lookup timeout (1500ms)")), 1500);
                }),
              ]);
              return {
                exists: userDoc.exists,
                udata: userDoc.exists ? (userDoc.data() as Record<string, unknown>) : undefined,
              };
            } finally {
              if (timeoutId) clearTimeout(timeoutId);
            }
          })();
          inFlightProfileLookups.set(uid, lookupPromise);
        }

        let lookupResult: { exists: boolean; udata?: Record<string, unknown> };
        try {
          lookupResult = await lookupPromise;
        } finally {
          inFlightProfileLookups.delete(uid);
        }

        if (lookupResult.exists && lookupResult.udata) {
          userDocExists = true;
          const udata = lookupResult.udata;
          dbRole = udata.role as string | undefined;
          dbStatus = (udata.status as string) || "active";
          if (Array.isArray(udata.capabilities)) {
            dbCapabilities = udata.capabilities as string[];
          }
        }

        setBoundedCacheEntry(uid, {
          exists: userDocExists,
          role: dbRole,
          status: dbStatus,
          capabilities: dbCapabilities,
          cachedAt: now,
          data: lookupResult.udata ? { uid, ...lookupResult.udata } : undefined,
          isErrorFallback: false,
        });
      } else {
        dbFetchError = true;
      }
    } catch (e: unknown) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      safeLogger.warn("Auth middleware: DB lookup unavailable, using resilient token claim fallback", { uid, err: errorMsg });

      if (cachedProfile && !cachedProfile.isErrorFallback && now - cachedProfile.cachedAt < STALE_CACHE_MAX_AGE_MS) {
        userDocExists = cachedProfile.exists;
        dbRole = cachedProfile.role;
        dbStatus = cachedProfile.status;
        dbCapabilities = cachedProfile.capabilities;
        dbFetchError = false;
      } else {
        dbFetchError = true;
        setBoundedCacheEntry(uid, {
          exists: false,
          role: tokenRole,
          status: "active",
          capabilities: [],
          cachedAt: now,
          isErrorFallback: true,
        });
      }
    }
  }

  return { userDocExists, dbRole, dbStatus, dbCapabilities, dbFetchError };
}
