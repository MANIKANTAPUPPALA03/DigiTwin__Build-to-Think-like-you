import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db, googleProvider } from "../firebase";

/* ---------- TYPES ---------- */

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  getAuthHeaders: () => Promise<Record<string, string>>;
  updateProfile: (name: string) => Promise<void>;
}

/* ---------- CONTEXT ---------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- PROVIDER ---------- */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- AUTH STATE LISTENER ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", fbUser.uid);
        let snap;
        try {
          snap = await getDoc(userRef);
        } catch (dbErr) {
          console.error("Firestore read failed (likely permission issue):", dbErr);
          // Fallback: treat as non-existent doc
          snap = { exists: () => false, data: () => ({}) } as any;
        }

        if (snap.exists()) {
          setUser({
            id: fbUser.uid,
            ...(snap.data() as Omit<User, "id">),
          });
        } else {
          // User exists in Firebase Auth but not Firestore (e.g. email login first time)
          setUser({
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email || "",
            email: fbUser.email || "",
            avatar: fbUser.photoURL || undefined,
          });
        }
      } catch (err: any) {
        console.error("Auth state handling error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  /* ---------- HANDLE GOOGLE REDIRECT RESULT (Firebase & OAuth Code) ---------- */
  useEffect(() => {
    // 1. Firebase Auth Redirect Handling
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const fbUser = result.user;
        // Save user if needed... (existing logic)
        const userRef = doc(db, "users", fbUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          await setDoc(userRef, {
            name: fbUser.displayName,
            email: fbUser.email,
            avatar: fbUser.photoURL,
            provider: "google",
            createdAt: serverTimestamp(),
          });
        }
      }
    }).catch((err) => console.error("Firebase Redirect Error:", err));

    // 2. Google OAuth Code Handling (Mobile Redirect Flow)
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      console.log("✅ Found OAuth code in URL, exchanging...");

      // Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);

      // Exchange code via backend
      import("../hooks/useGoogleToken").then(async () => {
        // We can reuse the exchange logic inside requestGoogleAccessToken? 
        // No, we need a dedicated function or expose exchangeCodeForToken.
        // For now, let's fetch directly here or add a helper in hook.
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/google`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, redirect_uri: window.location.origin }),
          });
          const data = await response.json();
          if (data.access_token) {
            console.log("✅ Swapped code for token!");
            localStorage.setItem("google_access_token", data.access_token);
            alert("Gmail connected successfully!");
            // Optionally reload or notify
          }
        } catch (e) {
          console.error("Failed to exchange code:", e);
        }
      });
    }
  }, []);

  /* ---------- GET AUTH HEADERS ---------- */
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const fbUser = auth.currentUser;
    if (!fbUser) return {};

    const idToken = await fbUser.getIdToken();
    const googleAccessToken = localStorage.getItem("google_access_token") || "";

    return {
      Authorization: `Bearer ${idToken}`,
      "X-Google-Token": googleAccessToken,
    };
  };

  /* ---------- EMAIL LOGIN ---------- */
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /* ---------- EMAIL SIGNUP ---------- */
  const signup = async (name: string, email: string, password: string) => {
    try {
      setError(null);
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", cred.user.uid), {
        name,
        email,
        provider: "email",
        createdAt: serverTimestamp(),
      });
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /* ---------- GOOGLE LOGIN ---------- */
  const loginWithGoogle = async () => {
    try {
      setError(null);
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  /* ---------- LOGOUT ---------- */
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      localStorage.removeItem("google_access_token");
      localStorage.removeItem("oauth_authenticated");
      localStorage.removeItem("oauth_email");
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  /* ---------- UPDATE PROFILE ---------- */
  const updateProfile = async (name: string) => {
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { name });
      setUser((prev) => (prev ? { ...prev, name } : null));
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        loading,
        error,
        getAuthHeaders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------- HOOK ---------- */

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
