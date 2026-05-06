/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Teste unitário para ProductRepository.
 */

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { ProductSchemaClass } from '../../../../../src/Infrastructure/Database/Mongoose/Schemas/ProductSchema';
import { ProductRepository } from '../../../../../src/Infrastructure/Repositories/Product/ProductRepository';
import { TenantContext } from '../../../../../src/Infrastructure/Tenancy/TenantContext';

describe('ProductRepository (Multi-tenant)', () => {
  let repository: ProductRepository;
  let productModel: Model<ProductSchemaClass>;
  let tenantContext: TenantContext;

  const mockCompanyId = new Types.ObjectId().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRepository,
        {
          provide: getModelToken(ProductSchemaClass.name),
          useValue: {
            where: jest.fn().mockReturnThis(),
            find: jest.fn(),
          },
        },
        {
          provide: TenantContext,
          useValue: {
            get: jest.fn().mockReturnValue({ companyId: mockCompanyId }),
          },
        },
      ],
    }).compile();

    repository = module.get<ProductRepository>(ProductRepository);
    productModel = module.get<Model<ProductSchemaClass>>(getModelToken(ProductSchemaClass.name));
    tenantContext = module.get<TenantContext>(TenantContext);
  });

  describe('searchInCompany', () => {
    it('should return all products when query is empty, bypassing text filter', async () => {
      const leanMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const findMock = jest.fn().mockReturnValue({ limit: limitMock });
      
      (productModel.where as jest.Mock).mockReturnValue({ find: findMock });

      await repository.searchInCompany({
        companyId: mockCompanyId,
        query: '',
        maxResults: 50,
      });

      // Assert that it called find with empty filter {}
      expect(findMock).toHaveBeenCalledWith({});
    });

    it('should return filtered products when query has text, using $or with name, description and category', async () => {
      const leanMock = jest.fn().mockResolvedValue([]);
      const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
      const findMock = jest.fn().mockReturnValue({ limit: limitMock });
      
      (productModel.where as jest.Mock).mockReturnValue({ find: findMock });

      const query = 'eletronicos';
      await repository.searchInCompany({
        companyId: mockCompanyId,
        query,
        maxResults: 50,
      });

      // Assert that it called find with the correct $or filter
      expect(findMock).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
        ],
      });
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
