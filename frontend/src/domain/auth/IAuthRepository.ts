/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Interfaces de domínio para autenticação.
 * Define os contratos que as implementações (ex: NestAuthRepository) devem seguir.
 */

export interface IAuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
  companyId: string;
  companyName?: string;
}

export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterCredentials {
  email: string;
  password: string;
  companyName: string;
  role?: 'admin' | 'user';
}

export interface IAuthRepository {
  /**
   * @description Processa o login e deve retornar o token de acesso no formato do NestJS
   */
  login(credentials: ILoginCredentials): Promise<{ user: IAuthUser; access_token: string }>;

  /**
   * @description Processa o cadastro de nova empresa/usuário e retorna os dados da sessão inicial
   */
  register(credentials: IRegisterCredentials): Promise<{ user: IAuthUser; access_token: string; companyName: string }>;

  /**
   * @description Tenta buscar os dados do usuário atualmente autenticado
   */
  getCurrentUser(): Promise<IAuthUser | null>;

  /**
   * @description Encerra a sessão do usuário
   */
  logout(): Promise<void>;

  // Documentação: Métodos de compatibilidade (opcionais) caso ainda exista algum vestígio 
  // de bibliotecas antigas (como o Supabase) que precisem ser gradualmente removidas.
  onAuthStateChange?(cb: (session: any | null) => void): { unsubscribe: () => void };
  getSession?(): Promise<any | null>;
  signOut?(): Promise<void>;
}

export interface IProfileRepository {
  /**
   * @description Carrega os dados da empresa atrelada a um usuário específico
   */
  loadCompany(userId: string): Promise<{ companyId: string | null; companyName: string | null }>;

  /**
   * @description Carrega as permissões específicas de um usuário
   */
  loadRoles(userId: string): Promise<string[]>;
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
