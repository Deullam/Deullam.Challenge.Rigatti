/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Repositório de perfil (empresa + papéis) apoiado na sessão do backend NestJS.
 */

import type { IAuthUser, IProfileRepository } from '../../domain/auth/IAuthRepository';

/**
 * Infrastructure layer — perfil a partir da sessão emitida pelo NestJS.
 *
 * O backend não expõe rota de perfil: `POST /auth/login` e `POST /auth/register` já
 * devolvem `{ id, email, role, companyId, companyName }`, e o `NestAuthRepository`
 * guarda esse payload em `localStorage.auth_user`. Portanto este repositório relê a
 * sessão em vez de fazer uma chamada de rede — não há endpoint para chamar, e inventar
 * um seria fingir uma funcionalidade que o backend não tem.
 *
 * Se um dia existir um `GET /auth/me`, é aqui que ele entra, sem mexer nas camadas
 * de aplicação nem de apresentação.
 */
export class NestProfileRepository implements IProfileRepository {
  /**
   * @description Lê a sessão guardada e só a devolve se pertencer ao utilizador pedido.
   */
  private readSession(userId: string): IAuthUser | null {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;

    let stored: IAuthUser;
    try {
      stored = JSON.parse(raw) as IAuthUser;
    } catch (error) {
      // Não engolimos o erro em silêncio: a sessão está corrompida e queremos saber.
      console.warn('Sessão inválida em localStorage.auth_user — a ignorar.', error);
      return null;
    }

    return stored?.id === userId ? stored : null;
  }

  async loadCompany(userId: string): Promise<{ companyId: string | null; companyName: string | null }> {
    const session = this.readSession(userId);
    return {
      companyId: session?.companyId ?? null,
      companyName: session?.companyName ?? null,
    };
  }

  async loadRoles(userId: string): Promise<string[]> {
    const session = this.readSession(userId);
    // O backend atribui exatamente um papel por utilizador ('admin' | 'user').
    return session?.role ? [session.role] : [];
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
