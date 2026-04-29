/**
 * Domain layer — Auth
 * Pure types and contracts. No framework, no Supabase, no React.
 */
export type Role = "admin" | "user";

export interface AuthIdentity {
  userId: string;
  email: string;
}

export interface AuthSessionToken {
  accessToken: string;
}

export interface UserContext {
  identity: AuthIdentity;
  companyId: string | null;
  companyName: string | null;
  role: Role | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  companyName?: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
