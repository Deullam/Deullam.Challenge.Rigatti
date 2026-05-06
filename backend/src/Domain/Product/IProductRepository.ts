/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Interface do repositório de Product com escopo multi-tenant.
 */

import { Product } from './Product';

export interface IProductRepository {
  listByCompany(companyId: string): Promise<Product[]>;
  findByIdInCompany(input: { id: string; companyId: string }): Promise<Product | null>;

  create(input: {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string | null;
    companyId: string;
  }): Promise<Product>;

  updateInCompany(input: {
    id: string;
    companyId: string;
    patch: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string | null;
    }>;
  }): Promise<Product | null>;

  deleteInCompany(input: { id: string; companyId: string }): Promise<boolean>;

  searchInCompany(input: { companyId: string; query: string; maxResults: number }): Promise<Product[]>;
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
