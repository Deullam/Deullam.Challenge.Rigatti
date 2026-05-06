/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Teste unitário para CreateProductUseCase.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from '../../../../../src/Application/Product/UseCases/CreateProductUseCase';
import { IProductRepository } from '../../../../../src/Domain/Product/IProductRepository';
import { TOKENS } from '../../../../../src/Shared/IoC/tokens';
import { Product } from '../../../../../src/Domain/Product/Product';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepository: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        {
          provide: TOKENS.IProductRepository,
          useValue: { create: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
    productRepository = module.get(TOKENS.IProductRepository);
  });

  it('should create a new product', async () => {
    const mockProductInput = {
      companyId: 'company1',
      name: 'New Product',
      description: 'Description',
      price: 100,
      category: 'Category',
      imageUrl: null,
    };
    const createdProduct = new Product(
      'id1',
      mockProductInput.name,
      mockProductInput.description,
      mockProductInput.price,
      mockProductInput.category,
      mockProductInput.imageUrl,
      mockProductInput.companyId,
    );
    productRepository.create.mockResolvedValue(createdProduct);

    const result = await useCase.execute(mockProductInput);

    expect(productRepository.create).toHaveBeenCalledWith(mockProductInput);
    expect(result).toEqual(createdProduct);
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
