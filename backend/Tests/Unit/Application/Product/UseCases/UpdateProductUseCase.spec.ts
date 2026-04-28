/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Teste unitário para UpdateProductUseCase.
 */

import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductUseCase } from '../../../../../src/Application/Product/UseCases/UpdateProductUseCase';
import { IProductRepository } from '../../../../../src/Domain/Product/IProductRepository';
import { TOKENS } from '../../../../../src/Shared/IoC/tokens';
import { Product } from '../../../../../src/Domain/Product/Product';

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProductUseCase,
        {
          provide: TOKENS.IProductRepository,
          useValue: { updateInCompany: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
    productRepository = module.get(TOKENS.IProductRepository);
  });

  it('should update a product successfully', async () => {
    const companyId = 'company1';
    const productId = 'product1';
    const patch = { name: 'Updated Name', price: 150 };
    const updatedProduct = new Product(productId, 'Updated Name', 'D', 150, 'C', null, companyId);

    productRepository.updateInCompany.mockResolvedValue(updatedProduct);

    const result = await useCase.execute({ companyId, id: productId, patch });

    expect(productRepository.updateInCompany).toHaveBeenCalledWith({
      id: productId,
      companyId,
      patch,
    });
    expect(result).toEqual(updatedProduct);
  });

  it('should throw NotFoundException if product is not found', async () => {
    const companyId = 'company1';
    const productId = 'nonexistent';
    const patch = { name: 'Updated Name' };

    productRepository.updateInCompany.mockResolvedValue(null);

    await expect(useCase.execute({ companyId, id: productId, patch })).rejects.toThrow(NotFoundException);
  });
});
