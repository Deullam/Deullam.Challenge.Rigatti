/**
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Camada de Aplicação (Application Layer) — Casos de Uso de Autenticação.
 * Orquestra a comunicação entre a UI (React) e a infraestrutura (NestJS).
 * Totalmente refatorado para o fluxo do novo Backend.
 */

import type { IAuthRepository, IProfileRepository } from "@/domain/auth/IAuthRepository";
import type { ILoginCredentials, IRegisterCredentials } from "@/domain/auth/IAuthRepository";

export class AuthUseCases {
  constructor(
    private readonly auth: IAuthRepository,
    private readonly profiles: IProfileRepository,
  ) { }

  /**
   * @description Expõe o repositório para que o React Adapter (AuthContext) 
   * possa aceder aos métodos diretamente, se necessário.
   */
  get authRepository(): IAuthRepository {
    return this.auth;
  }

  /**
   * @description Envia as credenciais para o backend e processa a entrada.
   * (Substitui o antigo signIn)
   */
  async login(input: ILoginCredentials) {
    // Documentação: O NestJS já devolve { user, accessToken }.
    // O objeto user já contém o companyId e o role!
    return await this.auth.login(input);
  }

  /**
   * @description Regista uma nova empresa e um utilizador Administrador.
   * (Substitui o antigo signUp)
   */
  async register(input: IRegisterCredentials) {
    // Documentação: Removida a lógica de "attachCompanyToUser" em duas etapas.
    // Agora o backend NestJS recebe o companyName e faz a transação completa na base de dados.
    const response = await this.auth.register(input);
    return response;
  }

  /**
   * @description Encerra a sessão atual.
   * (Substitui o antigo signOut)
   */
  async logout() {
    return await this.auth.logout();
  }

  /**
   * @description Carrega dados complementares do utilizador, caso necessário no futuro.
   * Nota: Como o NestJS já envia 'role' e 'companyId' no login, este método passa a ser 
   * útil apenas se precisares de dados extras (ex: o Nome da Empresa formatado).
   */
  async loadUserContext(userId: string) {
    try {
      // Documentação: Mantemos a busca paralela caso o Dashboard precise do nome da empresa
      const [{ companyId, companyName }, roles] = await Promise.all([
        this.profiles.loadCompany(userId),
        this.profiles.loadRoles(userId),
      ]);

      const role = roles.includes("admin") ? "admin" : roles.length ? "user" : null;

      return { companyId, companyName, role };
    } catch (error) {
      console.error("Erro ao carregar o contexto extra do utilizador:", error);
      return { companyId: null, companyName: null, role: null };
    }
  }
}