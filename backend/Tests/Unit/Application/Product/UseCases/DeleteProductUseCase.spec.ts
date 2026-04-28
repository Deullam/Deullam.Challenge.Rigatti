/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Teste unitário para DeleteProductUseCase.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { DeleteProductUseCase } from '../../../../../src/Application/Product/UseCases/DeleteProductUseCase';
import { IProductRepository } from '../../../../../src/Domain/Product/IProductRepository';
import { TOKENS } from '../../../../../src/Shared/IoC/tokens';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductUseCase,
        {
          provide: TOKENS.IProductRepository,
          useValue: { deleteInCompany: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<DeleteProductUseCase>(DeleteProductUseCase);
    productRepository = module.get(TOKENS.IProductRepository);
  });

  it('should delete a product successfully', async () => {
    const companyId = 'company1';
    const productId = 'product1';

    productRepository.deleteInCompany.mockResolvedValue(true);

    const result = await useCase.execute({ companyId, id: productId });

    expect(productRepository.deleteInCompany).toHaveBeenCalledWith({
      id: productId,
      companyId,
    });
    expect(result).toBe(true);
  });

  it('should return false if product was not deleted', async () => {
    const companyId = 'company1';
    const productId = 'nonexistent';

    productRepository.deleteInCompany.mockResolvedValue(false);

    const result = await useCase.execute({ companyId, id: productId });

    expect(productRepository.deleteInCompany).toHaveBeenCalledWith({
      id: productId,
      companyId,
    });
    expect(result).toBe(false);
  });
});
