/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Tipos compartilhados de autenticação para camada HTTP.
 */

export type JwtUserPayload = Readonly<{
  sub: string;
  companyId: string;
  role: 'admin' | 'user';
}>;

export type AuthenticatedUser = Readonly<{
  userId: string;
  companyId: string;
  role: 'admin' | 'user';
}>;

