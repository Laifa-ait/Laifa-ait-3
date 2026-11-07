import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { UserProfile } from "../domains/user/user.types";
import { apiPost } from "../lib/api";
import { safeLogger } from "../utils/logger";

export type AllowedRegistrationRoleHint = "buyer" | "seller";

/**
 * Strictly sanitizes any client-side registration role hint (e.g., from localStorage or OAuth parameters).
 * NEVER allows "admin" or any privileged role to be injected into client state or sent as a registration hint.
 * Final role authority always resides on the server (/api/v1/auth/sync & Firebase Custom Claims).
 */
export const sanitizeRegistrationRoleHint = (rawRole?: string | null): AllowedRegistrationRoleHint => {
  return rawRole === "seller" ? "seller" : "buyer";
};

export const createBaselineProfile = (
  user: FirebaseUser,
  roleHint?: string | null
): UserProfile => {
  const safeRole = sanitizeRegistrationRoleHint(roleHint);
  return {
    uid: user.uid,
    displayName: user.displayName || user.email?.split("@")[0] || "Utilisateur",
    email: user.email || "",
    photoURL: user.photoURL || "",
    role: safeRole,
    status: safeRole === "seller" ? "pending_verification" : "active",
    onboardingCompleted: true,
    createdAt: new Date().toISOString(),
  } as UserProfile;
};

export const syncUserProfileWithBackend = async (
  user: FirebaseUser,
  roleHint?: string | null,
  lastAuthMethod: string = "auto_sync"
): Promise<UserProfile | null> => {
  const safeRole = sanitizeRegistrationRoleHint(roleHint);

  try {
    const data = await apiPost<{ success: boolean; profile: UserProfile }>(
      "/api/v1/auth/sync",
      {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: safeRole,
        lastAuthMethod,
      },
      1
    );
    if (data?.success && data?.profile) {
      return data.profile;
    }
  } catch (err) {
    safeLogger.warn("authHelpers: Backend profile sync fallback active", {
      err: err instanceof Error ? err.message : String(err),
    });
  }

  // Resilient fallback: read server-issued Firebase Custom Claims + Firestore users/{uid} document
  try {
    let claimRole: string | undefined;
    try {
      const tokenResult = await user.getIdTokenResult();
      if (tokenResult?.claims) {
        if (tokenResult.claims.isAdmin === true || tokenResult.claims.admin === true) {
          claimRole = (tokenResult.claims.role as string) || "admin";
        } else if (typeof tokenResult.claims.role === "string") {
          claimRole = tokenResult.claims.role;
        }
      }
    } catch {
      // Ignore token claim error
    }

    if (db && typeof db === "object" && "type" in db) {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      if (userSnap.exists()) {
        const docData = userSnap.data() as Record<string, unknown>;
        return {
          ...createBaselineProfile(user, roleHint),
          ...docData,
          uid: user.uid,
          role: (docData.role as UserProfile["role"]) || (claimRole as UserProfile["role"]) || safeRole,
        } as UserProfile;
      }
    }

    if (claimRole) {
      return {
        ...createBaselineProfile(user, roleHint),
        role: claimRole as UserProfile["role"],
      } as UserProfile;
    }
  } catch {
    // Fallback to baseline profile
  }

  return null;
};
