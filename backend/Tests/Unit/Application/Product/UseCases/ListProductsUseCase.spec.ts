/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Teste unitário para ListProductsUseCase.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ListProductsUseCase } from '../../../../../src/Application/Product/UseCases/ListProductsUseCase';
import { IProductRepository } from '../../../../../src/Domain/Product/IProductRepository';
import { TOKENS } from '../../../../../src/Shared/IoC/tokens';
import { Product } from '../../../../../src/Domain/Product/Product';

describe('ListProductsUseCase', () => {
  let useCase: ListProductsUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListProductsUseCase,
        {
          provide: TOKENS.IProductRepository,
          useValue: { listByCompany: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<ListProductsUseCase>(ListProductsUseCase);
    productRepository = module.get(TOKENS.IProductRepository);
  });

  it('should return a list of products for the given companyId', async () => {
    const mockProducts = [
      new Product('1', 'P1', 'D1', 10, 'C1', null, 'company1'),
      new Product('2', 'P2', 'D2', 20, 'C2', null, 'company1'),
    ];
    productRepository.listByCompany.mockResolvedValue(mockProducts);

    const result = await useCase.execute({ companyId: 'company1' });

    expect(result).toHaveLength(2);
    expect(productRepository.listByCompany).toHaveBeenCalledWith('company1');
    expect(result[0].name).toBe('P1');
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
