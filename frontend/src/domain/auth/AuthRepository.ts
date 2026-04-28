import type { Session, User } from "@supabase/supabase-js";
import type { Role, SignInInput, SignUpInput } from "./entities";

/**
 * Domain layer — Auth repository contract.
 * The application layer depends ONLY on this interface, never on Supabase.
 * This is the seam that lets us swap providers or mock for tests.
 */
export interface AuthRepository {
  getSession(): Promise<Session | null>;
  onAuthStateChange(cb: (session: Session | null) => void): { unsubscribe: () => void };
  signIn(input: SignInInput): Promise<{ user: User | null }>;
  signUp(input: SignUpInput): Promise<{ user: User | null }>;
  signOut(): Promise<void>;
}

export interface ProfileRepository {
  loadCompany(userId: string): Promise<{ companyId: string | null; companyName: string | null }>;
  loadRoles(userId: string): Promise<Role[]>;
  attachCompanyToUser(userId: string, companyName: string): Promise<{ companyId: string }>;
}
