'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import axios from 'axios';

interface AuthUser {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<{ success: boolean; message?: string; errors?: string[] }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = useCallback(async (tokenToVerify: string) => {
    try {
      const backendUrl = await getBackendUrl();
      const response = await axios.get(`${backendUrl}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` },
      });

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, [verifyToken]);

  const getBackendUrl = async (): Promise<string> => {
    // Se NEXT_PUBLIC_BACKEND_URL estiver definida (produção), usa ela diretamente
    const productionUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (productionUrl) {
      return productionUrl.endsWith('/') ? productionUrl.slice(0, -1) : productionUrl;
    }

    // Desenvolvimento local - usa descoberta automática
    try {
      const { getBackendApiUrl } = await import('../utils/backendApi');
      const url = await getBackendApiUrl();
      return url.replace('/api/users', '');
    } catch {
      const port = process.env.NEXT_PUBLIC_BACKEND_PORT || '3001';
      return `http://localhost:${port}`;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const backendUrl = await getBackendUrl();
      const response = await axios.post(`${backendUrl}/api/auth/login`, {
        email,
        password,
      });

      if (response.data.success && response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('auth_token', response.data.token);
        return { success: true };
      }

      return { success: false, message: response.data.message || 'Erro ao fazer login' };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao conectar ao servidor',
      };
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      const backendUrl = await getBackendUrl();
      const response = await axios.post(`${backendUrl}/api/auth/register`, {
        name,
        email,
        password,
        confirmPassword,
      });

      if (response.data.success && response.data.token) {
        setToken(response.data.token);
        setUser(response.data.user);
        localStorage.setItem('auth_token', response.data.token);
        return { success: true };
      }

      return {
        success: false,
        message: response.data.message || 'Erro ao cadastrar',
        errors: response.data.errors || [],
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao conectar ao servidor',
        errors: error.response?.data?.errors || [],
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user && !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

