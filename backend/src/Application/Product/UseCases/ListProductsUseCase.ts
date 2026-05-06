/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Use case para listar produtos da empresa do usuário autenticado.
 */

import { Inject, Injectable } from '@nestjs/common';
import { IProductRepository } from '../../../Domain/Product/IProductRepository';
import { TOKENS } from '../../../Shared/IoC/tokens';

@Injectable()
export class ListProductsUseCase {
  constructor(@Inject(TOKENS.IProductRepository) private readonly products: IProductRepository) {}

  async execute(input: { companyId: string }) {
    return this.products.listByCompany(input.companyId);
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
