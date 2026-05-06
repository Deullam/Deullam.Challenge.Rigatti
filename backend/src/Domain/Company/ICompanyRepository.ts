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

