import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { authUseCases } from "@/composition/auth";
import type { Role } from "@/domain/auth/entities";

/**
 * Presentation layer — React adapter over the auth use-cases.
 * The rest of the UI consumes useAuth() and never touches infrastructure directly.
 */
interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  companyId: string | null;
  companyName: string | null;
  role: Role | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  const loadProfile = async (uid: string) => {
    const ctx = await authUseCases.loadUserContext(uid);
    setCompanyId(ctx.companyId);
    setCompanyName(ctx.companyName);
    setRole(ctx.role);
  };

  useEffect(() => {
    // Set up listener FIRST, then check existing session.
    const sub = authUseCases.authRepository.onAuthStateChange((sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        // Defer to avoid deadlock inside the auth callback.
        setTimeout(() => loadProfile(sess.user!.id), 0);
      } else {
        setCompanyId(null); setCompanyName(null); setRole(null);
      }
    });

    authUseCases.authRepository.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    return () => sub.unsubscribe();
  }, []);

  const refresh = async () => { if (user) await loadProfile(user.id); };
  const signOut = async () => { await authUseCases.signOut(); };

  return (
    <Ctx.Provider value={{ user, session, loading, companyId, companyName, role, refresh, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
