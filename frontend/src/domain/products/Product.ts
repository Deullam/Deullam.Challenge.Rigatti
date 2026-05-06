/**
 * Domain layer — Products
 * Pure entity, no framework concerns.
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  companyId: string;
}

export interface ProductDraft {
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string | null;
  companyId: string;
}

export interface ProductFilters {
  query?: string;
  category?: string;
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
