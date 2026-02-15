import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Emails from "./pages/Emails";
import Calendar from "./pages/Calendar";
import PriorityBoard from "./pages/PriorityBoard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Help from "./pages/Help";
import GoogleOAuth from "./pages/GoogleOAuth";

import { AuthProvider, useAuth } from "./context/AuthContext";

const ProtectedRoute = ({
  children,
  isDark,
  setIsDark,
}: {
  children: React.ReactNode;
  isDark: boolean;
  setIsDark: (v: boolean) => void;
}) => {
  const { isAuthenticated } = useAuth();

  // Check if user is coming from OAuth (check URL params FIRST)
  const params = new URLSearchParams(window.location.search);
  const isOAuth = params.get('oauth');
  const email = params.get('email');

  if (isOAuth === 'true' && email) {
    // Store OAuth auth immediately
    localStorage.setItem('oauth_authenticated', 'true');
    localStorage.setItem('oauth_email', email);
  }

  // Check for OAuth authentication
  const isOAuthAuthenticated = localStorage.getItem('oauth_authenticated') === 'true';

  // Wait for AuthContext loading to finish
  // We need to access loading from context, but first let's update AuthContext interface to include it
  // For now, assuming AuthContext blocks rendering children while loading, so this component only mounts after loading? 
  // NO, AuthContext renders children only after loading is false. 
  // So ProtectedRoute will only run when loading is false. 
  // wait... AuthContext.tsx: if (loading) return <Spinner /> else return <Provider>{children}</Provider>
  // So children (Routes) are NOT rendered until loading is false.
  // This means ProtectedRoute doesn't need to check loading.

  if (!isAuthenticated && !isOAuthAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout isDark={isDark} setIsDark={setIsDark}>
      {children}
    </Layout>
  );
};

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Landing />} />
          <Route path="/help" element={<Help />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/google-login" element={<GoogleOAuth />} />

          {/* PROTECTED */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
                <Dashboard isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/emails"
            element={
              <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
                <Emails isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/calendar"
            element={
              <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
                <Calendar isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/priority-board"
            element={
              <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
                <PriorityBoard isDark={isDark} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
                <Profile isDark={isDark} setIsDark={setIsDark} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
