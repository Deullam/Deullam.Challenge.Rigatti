/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Use case para criar produto na empresa do usuário autenticado.
 */

import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository } from '../../../Domain/Product/IProductRepository';
import { TOKENS } from '../../../Shared/IoC/tokens';

@Injectable()
export class CreateProductUseCase {
  constructor(@Inject(TOKENS.IProductRepository) private readonly products: IProductRepository) {}

  async execute(input: {
    companyId: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string | null;
  }) {
    return this.products.create({
      companyId: input.companyId,
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      imageUrl: input.imageUrl ?? null,
    });
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
