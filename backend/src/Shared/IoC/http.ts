/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Utilitário para registro de requisição autenticada.
 */

export type RequestUser = Readonly<{
  userId: string;
  companyId: string;
  role: 'admin' | 'user';
}>;

