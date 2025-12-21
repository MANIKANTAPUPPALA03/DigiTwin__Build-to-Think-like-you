import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface GoogleAccount {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => void;
  loginWithGoogle: (account: GoogleAccount) => Promise<void>;
  isAuthenticated: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check localStorage for existing session on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string) => {
      setError(null);
      // Mock login logic - in real app would validate password
      if (!email.includes('@')) {
          setError('Invalid email address');
          throw new Error('Invalid email');
      }
      const mockUser: User = {
        id: 'usr-' + Date.now(),
        name: 'Michael Chen',
        email: email,
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const loginWithGoogle = async (account: GoogleAccount) => {
      setError(null);
      const mockUser: User = {
          id: 'google-' + Date.now(),
          name: account.name,
          email: account.email,
          avatar: account.avatar
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const signup = async (name: string, email: string) => {
      setError(null);
      if (!name || !email) {
          setError('Name and email are required');
          throw new Error('Missing fields');
      }
      const mockUser: User = {
        id: 'usr-' + Date.now(),
        name: name,
        email: email,
      };
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loginWithGoogle, isAuthenticated: !!user, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
