/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Interfaces de domínio para autenticação.
 */

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  companyId: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  companyId: string;
  role?: 'admin' | 'user';
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<{ user: AuthUser; token: string }>;
  register(credentials: RegisterCredentials): Promise<{ user: AuthUser; token: string }>;
  getCurrentUser(): Promise<AuthUser | null>;
  logout(): Promise<void>;
  // Mantendo compatibilidade temporária com o shim se necessário
  onAuthStateChange?(cb: (session: any | null) => void): { unsubscribe: () => void };
  getSession?(): Promise<any | null>;
  signOut?(): Promise<void>;
}

export interface ProfileRepository {
  loadCompany(userId: string): Promise<{ companyId: string | null; companyName: string | null }>;
  loadRoles(userId: string): Promise<string[]>;
}

