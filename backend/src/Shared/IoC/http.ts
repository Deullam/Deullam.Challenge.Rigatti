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

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
