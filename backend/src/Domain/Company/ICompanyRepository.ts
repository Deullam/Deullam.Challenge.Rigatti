/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Interface do repositório de Company.
 */

import { Company } from './Company';

export interface ICompanyRepository {
  create(input: { name: string }): Promise<Company>;
  findById(id: string): Promise<Company | null>;
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
