import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authUseCases } from "@/composition/auth";
import type { AuthUser } from "@/domain/auth/AuthRepository";

/**
 * Presentation layer — React adapter over the auth use-cases.
 * Agora integrado com o Backend NestJS.
 */
interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  companyId: string | null;
  role: string | null;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await authUseCases.authRepository.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    const { user: loggedUser, token } = await authUseCases.authRepository.login(credentials);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(loggedUser));
    setUser(loggedUser);
  };

  const logout = async () => {
    await authUseCases.authRepository.logout();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Ctx.Provider value={{
      user,
      loading,
      companyId: user?.companyId ?? null,
      role: user?.role ?? null,
      login,
      logout
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);

