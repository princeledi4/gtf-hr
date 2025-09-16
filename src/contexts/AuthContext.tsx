import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types/auth';
import { authAPI } from '@/services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const savedToken = localStorage.getItem('hris-token');
    const savedUser = localStorage.getItem('hris-user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    } else {
      // Clear any stale data
      localStorage.removeItem('hris-token');
      localStorage.removeItem('hris-user');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      const { token: authToken, user: userData } = response;
      
      setToken(authToken);
      setUser(userData);
      localStorage.setItem('hris-token', authToken);
      localStorage.setItem('hris-user', JSON.stringify(userData));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hris-token');
    localStorage.removeItem('hris-user');
  };

  const switchRole = (role: UserRole) => {
    if (user && user.role === 'admin') {
      const updatedUser = { ...user, role };
      setUser(updatedUser);
      localStorage.setItem('hris-user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, isLoading, token }}>
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