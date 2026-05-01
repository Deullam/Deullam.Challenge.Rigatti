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
