/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Repositório para gerenciamento de imagens de produtos (multi-tenant).
 */
import { api } from '@/lib/api';
import type { ProductImageRepository } from '@/domain/products/ProductRepository';

export class NestProductImageRepository implements ProductImageRepository {
  async upload(companyId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file); // 'file' deve ser o nome que o interceptor do NestJS espera (ex: FileInterceptor)

    // Ajuste a rota '/upload' para a rota que você criou no backend
    const response = await api.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { url: response.data.url };
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
