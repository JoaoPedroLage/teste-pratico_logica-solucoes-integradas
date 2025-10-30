/**
 * Modelo de Usuário para Autenticação
 */
export interface AuthUser {
  id: number;
  email: string;
  password: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    name: string;
  };
  message?: string;
}

