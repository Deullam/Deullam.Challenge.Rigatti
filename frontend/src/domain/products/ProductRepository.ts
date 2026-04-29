import type { Product, ProductDraft } from "./Product";

/**
 * Domain layer — Repository contracts.
 * The application layer depends only on these.
 */
export interface ProductRepository {
  list(): Promise<Product[]>;
  create(draft: ProductDraft): Promise<void>;
  update(id: string, draft: ProductDraft): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface ProductImageRepository {
  upload(companyId: string, file: File): Promise<{ url: string }>;
}
