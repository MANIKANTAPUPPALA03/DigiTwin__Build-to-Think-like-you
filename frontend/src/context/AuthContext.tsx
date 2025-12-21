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
}

/* ---------- CONTEXT ---------- */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ---------- PROVIDER ---------- */

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  /* ---------- AUTH STATE LISTENER ---------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        return;
      }

      const userRef = doc(db, "users", fbUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setUser({
          id: fbUser.uid,
          ...(snap.data() as Omit<User, "id">),
        });
      }
    });

    return unsub;
  }, []);

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
      // Clear OAuth session from localStorage
      localStorage.removeItem('oauth_authenticated');
      localStorage.removeItem('oauth_email');
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        loginWithGoogle,
        logout,
        isAuthenticated: !!user,
        error,
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
