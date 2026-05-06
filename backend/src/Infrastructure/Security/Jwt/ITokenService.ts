/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Interface de emissão/validação de tokens JWT.
 */

export interface ITokenService {
  sign(input: { userId: string; companyId: string; role: 'admin' | 'user' }): Promise<string>;
}

