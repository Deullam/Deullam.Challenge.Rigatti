import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteProductUseCase } from '../../../../../src/Application/Product/UseCases/DeleteProductUseCase';
import { TOKENS } from '../../../../../src/Shared/IoC/tokens';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let mockProducts: any;

  // Variáveis escopadas corretamente para todos os testes
  const companyId = 'tenant-123';
  const id = 'product-456';

  beforeEach(async () => {
    mockProducts = {
      deleteInCompany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductUseCase,
        { provide: TOKENS.IProductRepository, useValue: mockProducts },
      ],
    }).compile();

    useCase = module.get<DeleteProductUseCase>(DeleteProductUseCase);
  });

  it('should delete a product successfully', async () => {
    // Simula que o repositório encontrou e deletou
    mockProducts.deleteInCompany.mockResolvedValue(true);

    const result = await useCase.execute({ companyId, id });

    expect(mockProducts.deleteInCompany).toHaveBeenCalledWith({ companyId, id });
    expect(result).toEqual({ ok: true });
  });

  it('should throw NotFoundException if product was not deleted', async () => {
    // Simula que o repositório não encontrou o produto (retornou false)
    mockProducts.deleteInCompany.mockResolvedValue(false);

    await expect(useCase.execute({ companyId, id }))
      .rejects
      .toThrow(NotFoundException);
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
