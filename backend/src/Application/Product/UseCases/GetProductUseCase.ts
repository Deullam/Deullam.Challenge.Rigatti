/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Use case para buscar um único produto por ID.
 */

import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IProductRepository } from '../../../Domain/Product/IProductRepository';
import { Product } from '../../../Domain/Product/Product';
import { TOKENS } from '../../../Shared/IoC/tokens';

type Input = {
  id: string;
  companyId: string;
};

type Output = Product;

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(TOKENS.IProductRepository)
    private readonly productRepository: IProductRepository,
  ) {}

  public async execute({ id, companyId }: Input): Promise<Output> {
    const product = await this.productRepository.findByIdInCompany({ id, companyId });
    if (!product) {
      throw new NotFoundException('Product not found.');
    }
    return product;
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
