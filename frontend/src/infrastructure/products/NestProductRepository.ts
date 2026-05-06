/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Repositório para gerenciamento de produtos (multi-tenant).
 */

import { api } from '@/lib/api';
import type { ProductRepository } from '@/domain/products/ProductRepository';
import type { Product, ProductDraft } from '@/domain/products/Product';

export class NestProductRepository implements ProductRepository {

  async list(): Promise<Product[]> {
    // 1. O Interceptor do axios injeta o Bearer Token. O NestJS sabe o companyId.
    const response = await api.get('/products');

    // 2. Mapeamos a resposta do NestJS (camelCase) para o formato do Frontend (snake_case)
    return response.data.map((item: any) => ({
      id: item._id || item.id, // O Mongo devolve _id, mapeamos para id
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      image_url: item.imageUrl, // Tradução
      company_id: item.companyId, // Tradução
    })) as Product[];
  }

  async create(draft: ProductDraft): Promise<void> {
    // Traduzimos do Frontend para o Backend
    const payload = this.mapToBackend(draft);
    await api.post('/products', payload);
  }

  async update(id: string, draft: ProductDraft): Promise<void> {
    const payload = this.mapToBackend(draft);
    await api.patch(`/products/${id}`, payload);
  }

  async remove(id: string): Promise<void> {
    await api.delete(`/products/${id}`);
  }

  // Função auxiliar para traduzir os dados antes de enviar ao NestJS
  private mapToBackend(draft: Partial<ProductDraft>) {
    return {
      name: draft.name,
      description: draft.description,
      price: draft.price,
      category: draft.category,
      imageUrl: draft.image_url, // Tradução reversa
      // Nota: Não enviamos o companyId aqui, pois o NestJS extrai de forma segura pelo Token!
    };
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
