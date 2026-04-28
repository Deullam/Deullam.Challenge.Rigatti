/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Teste unitário para UserRepository garantindo isolamento multi-tenant.
 */

import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { UserSchemaClass } from '../../../../../src/Infrastructure/Database/Mongoose/Schemas/UserSchema';
import { UserRepository } from '../../../../../src/Infrastructure/Repositories/User/UserRepository';
import { TenantContext } from '../../../../../src/Infrastructure/Tenancy/TenantContext';

describe('UserRepository (Multi-tenant)', () => {
  let repository: UserRepository;
  let userModel: Model<UserSchemaClass>;
  let tenantContext: TenantContext;

  const mockCompanyId = new Types.ObjectId().toString();
  const mockUserId = new Types.ObjectId().toString();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getModelToken(UserSchemaClass.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            where: jest.fn().mockReturnThis(), // Mock para o filtro multi-tenant
          },
        },
        {
          provide: TenantContext,
          useValue: {
            get: jest.fn().mockReturnValue({ companyId: mockCompanyId, userId: mockUserId, role: 'admin' }),
          },
        },
      ],
    }).compile();

    repository = module.get<UserRepository>(UserRepository);
    userModel = module.get<Model<UserSchemaClass>>(getModelToken(UserSchemaClass.name));
    tenantContext = module.get<TenantContext>(TenantContext);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByEmail', () => {
    it('should call findOne WITHOUT companyId filter (Global Search) for Auth purposes', async () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: new Types.ObjectId(),
        email,
        passwordHash: 'hash',
        role: 'admin',
        companyId: new Types.ObjectId(mockCompanyId),
      };

      const findOneSpy = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) });
      (userModel.findOne as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) });

      const result = await repository.findByEmail(email);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: email.toLowerCase() });
      expect(result?.email).toBe(email);
    });
  });

  describe('findById', () => {
    it('should call findOne with _id and companyId filter from TenantContext', async () => {
      const id = new Types.ObjectId().toString();
      const mockUser = {
        _id: new Types.ObjectId(id),
        email: 'test@example.com',
        passwordHash: 'hash',
        role: 'admin',
        companyId: new Types.ObjectId(mockCompanyId),
      };

      const findOneSpy = jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue(mockUser) });
      (userModel.where as jest.Mock).mockReturnValue({ findOne: findOneSpy });

      const result = await repository.findById(id);

      expect(tenantContext.get).toHaveBeenCalled();
      expect(userModel.where).toHaveBeenCalledWith('companyId', mockCompanyId);
      expect(findOneSpy).toHaveBeenCalledWith({ _id: id });
      expect(result?.id).toBe(id);
    });
  });
});
