import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { auth, isFirebaseInitialized } from "../lib/firebase";
import { UserProfile } from "../domains/user/user.types";
import { apiGet, apiPost } from "../lib/api";
import { safeLogger } from "../utils/logger";
import {
  createBaselineProfile,
  sanitizeRegistrationRoleHint,
  syncUserProfileWithBackend,
} from "./authHelpers";

interface AuthContextType {
  user: UserProfile | null;
  openAuthModal?: () => void;
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  signInWithGoogle: (role?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile?: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(isFirebaseInitialized);

  useEffect(() => {
    if (!isFirebaseInitialized) {
      safeLogger.error("AuthContext: Firebase Client SDK is not initialized. Auth flows are disabled.");
      setLoading(false);
      return;
    }
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          const pendingRole = sanitizeRegistrationRoleHint(localStorage.getItem("olmart_pending_registration_role"));
          const profile = await syncUserProfileWithBackend(result.user, pendingRole, "google_redirect");
          localStorage.removeItem("olmart_pending_registration_role");
          if (profile) setUserProfile(profile);
        }
      })
      .catch((err) => {
        safeLogger.warn("AuthContext: getRedirectResult warning", { err: err instanceof Error ? err.message : String(err) });
      });
  }, []);

  useEffect(() => {
    if (!isFirebaseInitialized) {
      setLoading(false);
      return;
    }
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (!user) {
        setUserProfile(null);
        setLoading(false);
      } else {
        setUserProfile((prev) => prev || createBaselineProfile(user));
        const safetyTimer = setTimeout(() => setLoading(false), 1500);
        try {
          const profile = await syncUserProfileWithBackend(user, undefined, "auto_sync");
          if (profile) setUserProfile(profile);
        } finally {
          clearTimeout(safetyTimer);
          setLoading(false);
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!currentUser || !isFirebaseInitialized) return;
    const fetchProfile = async () => {
      try {
        const data = await apiGet<UserProfile>("/api/v1/auth/profile");
        if (data) setUserProfile(data);
      } catch (err) {
        safeLogger.warn("AuthContext: Periodic profile fetch retry finished", { err: err instanceof Error ? err.message : String(err) });
      }
    };
    fetchProfile();
    const interval = setInterval(fetchProfile, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const signInWithGoogle = async (role?: string) => {
    if (!isFirebaseInitialized) throw new Error("Service d'authentification non configuré.");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const safeRole = sanitizeRegistrationRoleHint(role);
    if (role) {
      try { localStorage.setItem("olmart_pending_registration_role", safeRole); } catch { /* ignore */ }
    }
    const isMobile = typeof navigator !== "undefined" && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    let user: FirebaseUser | null = null;
    try {
      const result = await signInWithPopup(auth, provider);
      user = result.user;
    } catch (popupErr: unknown) {
      const code = popupErr && typeof popupErr === "object" && "code" in popupErr ? String((popupErr as { code: unknown }).code) : "";
      if (isMobile && (code === "auth/popup-blocked" || code === "auth/cancelled-popup-request" || code === "auth/popup-closed-by-user")) {
        await signInWithRedirect(auth, provider);
        return;
      }
      throw popupErr;
    }
    if (user) {
      setCurrentUser(user);
      setUserProfile(createBaselineProfile(user, safeRole));
      const profile = await syncUserProfileWithBackend(user, safeRole, "google");
      if (profile) setUserProfile(profile);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseInitialized) throw new Error("Service d'authentification non configuré.");
    const result = await signInWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    setCurrentUser(user);
    const pendingRole = sanitizeRegistrationRoleHint(localStorage.getItem("olmart_pending_registration_role"));
    setUserProfile(createBaselineProfile(user, pendingRole));
    const profile = await syncUserProfileWithBackend(user, pendingRole, "email");
    localStorage.removeItem("olmart_pending_registration_role");
    if (profile) setUserProfile(profile);
  };

  const signUpWithEmail = async (email: string, pass: string, name: string, role: string) => {
    if (!isFirebaseInitialized) throw new Error("Service d'authentification non configuré.");
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    const user = result.user;
    const safeRole = sanitizeRegistrationRoleHint(role);
    await updateProfile(user, { displayName: name });
    await apiPost("/api/v1/auth/sync", { displayName: name, email, role: safeRole, lastAuthMethod: "email" });
    await sendEmailVerification(user);
    try { localStorage.setItem("olmart_pending_registration_role", safeRole); } catch { /* ignore */ }
  };

  const logout = async () => {
    if (!isFirebaseInitialized) return;
    await signOut(auth);
  };

  const updateUserProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const response = await apiPost<{ success: boolean; profile?: UserProfile; data?: UserProfile }>("/api/v1/auth/sync", {
      ...data,
      displayName: data.displayName || currentUser.displayName || "",
      email: currentUser.email || "",
      role: sanitizeRegistrationRoleHint(userProfile?.role),
    });
    const updated = response?.profile || response?.data;
    if (updated) setUserProfile({ ...updated, ...data, role: updated.role } as UserProfile);
    else setUserProfile((prev) => (prev ? ({ ...prev, ...data, role: prev.role } as UserProfile) : null));
  }, [currentUser, userProfile?.role]);

  useEffect(() => {
    const handleUnauthorized = async () => {
      if (isFirebaseInitialized && auth.currentUser) {
        try { await auth.currentUser.getIdToken(true); } catch { await logout(); }
      }
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  const value = React.useMemo(
    () => ({
      currentUser,
      userProfile,
      user: userProfile,
      openAuthModal: () => { window.dispatchEvent(new Event("auth:openModal")); },
      loading,
      isFirebaseReady: isFirebaseInitialized,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      updateUserProfile,
    }),
    [currentUser, userProfile, loading, updateUserProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {!isFirebaseInitialized && (
        <div role="alert" className="bg-amber-900 text-amber-100 text-xs font-semibold px-4 py-2 text-center border-b border-amber-700">
          Mode dégradé : Configuration Firebase Client incomplète. L&apos;authentification est désactivée.
        </div>
      )}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    safeLogger.warn("useAuth used outside AuthProvider");
    return { currentUser: null, userProfile: null, loading: false, isFirebaseReady: isFirebaseInitialized } as unknown as AuthContextType;
  }
  return context;
};
