/**
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Contexto de Autenticação Global.
 * Responsável por ler a sessão salva e proteger as rotas da aplicação.
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

// Documentação: Ajusta este import para o caminho real da tua instância de authUseCases
import { authUseCases } from "@/composition/auth";
import type { IAuthUser, ILoginCredentials } from "@/domain/auth/IAuthRepository";

interface AuthState {
  user: IAuthUser | null;
  loading: boolean;
  companyId: string | null;
  role: string | null;
  login: (credentials: ILoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

// Criação do Contexto
const Ctx = createContext<AuthState>({} as AuthState);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado que guarda o utilizador. Começa vazio (null).
  const [user, setUser] = useState<IAuthUser | null>(null);

  // Estado de carregamento. Começa em 'true' para não expulsar o utilizador antes de ler a gaveta.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * @description Função que corre apenas uma vez quando a página abre.
     * Ela vai à "gaveta" (localStorage) procurar a sessão.
     */
    const initAuth = () => {
      try {
        // Documentação: Lemos EXATAMENTE as chaves que guardámos no login
        const token = localStorage.getItem("access_token");
        const storedUser = localStorage.getItem("auth_user");

        if (token && storedUser) {
          // Se encontrou, transforma o texto de volta em objeto e guarda no Estado
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        // Documentação: Independentemente de ter encontrado ou não, liberta a tela para renderizar.
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * @description Função de login disponibilizada para a LoginPage.
   */
  const login = async (credentials: ILoginCredentials) => {
    // 1. Chama o caso de uso (que vai ao backend NestJS)
    const response = await authUseCases.login(credentials);

    const { access_token, user: loggedUser } = response;

    // 2. Guarda na "gaveta" com os nomes rigorosamente corretos
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("auth_user", JSON.stringify(loggedUser));

    // 3. Atualiza o "cérebro" do React, o que liberta a entrada nas rotas protegidas
    setUser(loggedUser);
  };

  /**
   * @description Função de logout.
   */
  const logout = async () => {
    try {
      await authUseCases.logout();
    } catch (e) {
      console.error("Erro ao fazer logout na API", e);
    } finally {
      // Limpa a gaveta e o estado
      localStorage.removeItem("access_token");
      localStorage.removeItem("auth_user");
      setUser(null);
    }
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
      {/* Documentação: Só renderiza as rotas filhas depois de terminar a verificação */}
      {!loading && children}
    </Ctx.Provider>
  );
}

/**
 * @description Hook personalizado para usar a autenticação de forma simples em qualquer componente.
 */
export const useAuth = () => useContext(Ctx);