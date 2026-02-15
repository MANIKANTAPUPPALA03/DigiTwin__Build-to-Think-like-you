import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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

      const userRef = doc(db, "users", fbUser.uid);
      const snap = await getDoc(userRef);

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
      setLoading(false);
    });

    return unsub;
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
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;

      // Save user to Firestore if first time
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

      // Now request a SEPARATE access token via GIS for Gmail/Calendar
      // This uses the external GCP project where APIs are enabled
      try {
        const { requestGoogleAccessToken } = await import("../hooks/useGoogleToken");
        await requestGoogleAccessToken();
        console.log("✅ GIS Gmail/Calendar token obtained!");
      } catch (gisErr) {
        console.warn("⚠️ GIS token request failed (user can retry from Emails page):", gisErr);
      }
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
