/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Use case para atualizar produto (somente dentro do tenant).
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../Domain/Product/IProductRepository';
import { TOKENS } from '../../../Shared/IoC/tokens';

@Injectable()
export class UpdateProductUseCase {
  constructor(@Inject(TOKENS.IProductRepository) private readonly products: IProductRepository) {}

  async execute(input: {
    companyId: string;
    id: string;
    patch: Partial<{ name: string; description: string; price: number; category: string; imageUrl: string | null }>;
  }) {
    const updated = await this.products.updateInCompany({
      id: input.id,
      companyId: input.companyId,
      patch: input.patch,
    });
    if (!updated) throw new NotFoundException('Product not found.');
    return updated;
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
