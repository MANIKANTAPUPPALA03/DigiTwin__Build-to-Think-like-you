import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Landing';
import Help from './pages/Help';
import GoogleOAuth from './pages/GoogleOAuth';
import Emails from './pages/Emails';
import Calendar from './pages/Calendar';
import PriorityBoard from './pages/PriorityBoard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, isDark, setIsDark }: { children: React.ReactNode, isDark: boolean, setIsDark: (val: boolean) => void }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route path="/" element={<Landing />} />
          <Route path="/help" element={<Help />} />
          <Route path="/google-login" element={<GoogleOAuth />} />
           
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
              <Dashboard isDark={isDark} />
            </ProtectedRoute>
          } />
          <Route path="/emails" element={
            <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
              <Emails isDark={isDark} />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
              <Calendar isDark={isDark} />
            </ProtectedRoute>
          } />
          <Route path="/priority-board" element={
            <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
              <PriorityBoard isDark={isDark} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute isDark={isDark} setIsDark={setIsDark}>
              <Profile isDark={isDark} setIsDark={setIsDark} />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
