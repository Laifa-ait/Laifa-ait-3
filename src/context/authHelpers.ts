import { User as FirebaseUser } from "firebase/auth";
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
  try {
    const safeRole = sanitizeRegistrationRoleHint(roleHint);
    const data = await apiPost<{ success: boolean; profile: UserProfile }>("/api/v1/auth/sync", {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      role: safeRole,
      lastAuthMethod,
    });
    if (data?.success && data?.profile) {
      return data.profile;
    }
  } catch (err) {
    safeLogger.warn("authHelpers: Backend profile sync retry finished", {
      err: err instanceof Error ? err.message : String(err),
    });
  }
  return null;
};
