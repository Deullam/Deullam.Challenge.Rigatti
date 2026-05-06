import type { ProductImageRepository, ProductRepository } from "@/domain/products/ProductRepository";
import type { Product, ProductDraft, ProductFilters } from "@/domain/products/Product";

/**
 * Application layer — Products use cases.
 * Adds search/filter logic that belongs to the business, not to the UI.
 */
export class ProductUseCases {
  constructor(
    private readonly products: ProductRepository,
    private readonly images: ProductImageRepository,
  ) {}

  list() {
    return this.products.list();
  }

  filter(items: Product[], { query, category }: ProductFilters): Product[] {
    const q = query?.toLowerCase().trim();
    return items.filter(p =>
      (!q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) &&
      (!category || p.category === category)
    );
  }

  categoriesOf(items: Product[]): string[] {
    return Array.from(new Set(items.map(p => p.category))).sort();
  }

  save(draft: ProductDraft, id?: string) {
    return id ? this.products.update(id, draft) : this.products.create(draft);
  }

  remove(id: string) {
    return this.products.remove(id);
  }

  uploadImage(companyId: string, file: File) {
    return this.images.upload(companyId, file);
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
