/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes unitários para o GetProductUseCase.
 */
import { NotFoundException } from '@nestjs/common';
import { Product } from 'src/Domain/Product/Product';
import { GetProductUseCase } from 'src/Application/Product/UseCases/GetProductUseCase';
import { IProductRepository } from 'src/Domain/Product/IProductRepository';

// Mock do IProductRepository
const mockProductRepository: IProductRepository = {
  create: jest.fn(),
  listByCompany: jest.fn(),
  findByIdInCompany: jest.fn(),
  updateInCompany: jest.fn(),
  deleteInCompany: jest.fn(),
  searchInCompany: jest.fn(),
};

describe('GetProductUseCase', () => {
  let getProductUseCase: GetProductUseCase;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    getProductUseCase = new GetProductUseCase(mockProductRepository);
  });

  it('should return a product when it is found', async () => {
    // Arrange
    const companyId = 'company-123';
    const productId = 'product-456';
    const expectedProduct = new Product(
      productId,
      'Test Product',
      'Description',
      100,
      'Category',
      'image.url',
      companyId,
    );

    (mockProductRepository.findByIdInCompany as jest.Mock).mockResolvedValue(expectedProduct);

    // Act
    const result = await getProductUseCase.execute({ id: productId, companyId });

    // Assert
    expect(result).toEqual(expectedProduct);
    expect(mockProductRepository.findByIdInCompany).toHaveBeenCalledWith({ id: productId, companyId });
    expect(mockProductRepository.findByIdInCompany).toHaveBeenCalledTimes(1);
  });

  it('should throw NotFoundException when the product is not found', async () => {
    // Arrange
    const companyId = 'company-123';
    const productId = 'product-non-existent';

    (mockProductRepository.findByIdInCompany as jest.Mock).mockResolvedValue(null);

    // Act & Assert
    await expect(getProductUseCase.execute({ id: productId, companyId })).rejects.toThrow(
      new NotFoundException('Product not found.'),
    );
    expect(mockProductRepository.findByIdInCompany).toHaveBeenCalledWith({ id: productId, companyId });
    expect(mockProductRepository.findByIdInCompany).toHaveBeenCalledTimes(1);
  });
});
