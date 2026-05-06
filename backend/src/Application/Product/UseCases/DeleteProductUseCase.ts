/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Use case para deletar produto (somente dentro do tenant).
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../Domain/Product/IProductRepository';
import { TOKENS } from '../../../Shared/IoC/tokens';

@Injectable()
export class DeleteProductUseCase {
  constructor(@Inject(TOKENS.IProductRepository) private readonly products: IProductRepository) {}

  async execute(input: { companyId: string; id: string }) {
    const ok = await this.products.deleteInCompany({ companyId: input.companyId, id: input.id });
    if (!ok) throw new NotFoundException('Product not found.');
    return { ok: true };
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
