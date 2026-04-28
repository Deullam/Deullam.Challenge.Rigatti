/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Teste unitário para RegisterUseCase.
 */

import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUseCase } from '../../../../../src/Application/Auth/UseCases/RegisterUseCase';
import { IUserRepository } from '../../../../../src/Domain/User/IUserRepository';
import { IHasher } from '../../../../../src/Infrastructure/Security/Hashing/IHasher';
import { ITokenService } from '../../../../../src/Infrastructure/Security/Jwt/ITokenService';
import { TOKENS } from '../../../../../src/Shared/IoC/tokens';
import { User } from '../../../../../src/Domain/User/User';

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hasher: jest.Mocked<IHasher>;
  let tokenService: jest.Mocked<ITokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUseCase,
        {
          provide: TOKENS.IUserRepository,
          useValue: { findByEmail: jest.fn(), create: jest.fn() },
        },
        {
          provide: TOKENS.IHasher,
          useValue: { hash: jest.fn() },
        },
        {
          provide: TOKENS.ITokenService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUseCase>(RegisterUseCase);
    userRepository = module.get(TOKENS.IUserRepository);
    hasher = module.get(TOKENS.IHasher);
    tokenService = module.get(TOKENS.ITokenService);
  });

  it('should register a new user and return a token', async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    hasher.hash.mockResolvedValue('hashed_pass');
    const createdUser = new User('id1', 'new@test.com', 'hashed_pass', 'admin', 'company1');
    userRepository.create.mockResolvedValue(createdUser);
    tokenService.sign.mockResolvedValue('jwt_token');

    const result = await useCase.execute({
      email: 'new@test.com',
      password: 'password',
      companyId: 'company1',
      role: 'admin',
    });

    expect(result.accessToken).toBe('jwt_token');
    expect(result.user.email).toBe('new@test.com');
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'new@test.com',
        companyId: 'company1',
        role: 'admin',
      }),
    );
  });

  it('should throw ConflictException if email is already in use', async () => {
    const existingUser = new User('id1', 'exists@test.com', 'hash', 'admin', 'company1');
    userRepository.findByEmail.mockResolvedValue(existingUser);

    await expect(
      useCase.execute({ email: 'exists@test.com', password: 'pass', companyId: 'c1' }),
    ).rejects.toThrow(ConflictException);
  });
});
