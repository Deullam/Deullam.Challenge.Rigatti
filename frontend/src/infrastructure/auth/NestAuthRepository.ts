/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Repositório de autenticação que se comunica com o backend NestJS.
 */

import { AuthRepository, LoginCredentials, RegisterCredentials, AuthUser } from '../../domain/auth/AuthRepository';
import { api } from '../../lib/api';

export class NestAuthRepository implements AuthRepository {
  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }> {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, user } = response.data;
    
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      token: accessToken
    };
  }

  async register(credentials: RegisterCredentials): Promise<{ user: AuthUser; token: string }> {
    // Nota: O backend atual espera companyId no registro. 
    // Em um fluxo real, o frontend enviaria dados da empresa para criar uma nova.
    const response = await api.post('/auth/register', credentials);
    const { accessToken, user } = response.data;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      token: accessToken
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}
