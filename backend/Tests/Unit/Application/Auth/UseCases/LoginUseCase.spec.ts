/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Teste unitário para LoginUseCase.
 */

import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { LoginUseCase } from '../../../../../src/Application/Auth/UseCases/LoginUseCase';
import { IUserRepository } from '../../../../../src/Domain/User/IUserRepository';
import { IHasher } from '../../../../../src/Infrastructure/Security/Hashing/IHasher';
import { ITokenService } from '../../../../../src/Infrastructure/Security/Jwt/ITokenService';
import { TOKENS } from '../../../../../src/Shared/IoC/tokens';
import { User } from '../../../../../src/Domain/User/User';

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let hasher: jest.Mocked<IHasher>;
  let tokenService: jest.Mocked<ITokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: TOKENS.IUserRepository,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: TOKENS.IHasher,
          useValue: { compare: jest.fn() },
        },
        {
          provide: TOKENS.ITokenService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(TOKENS.IUserRepository);
    hasher = module.get(TOKENS.IHasher);
    tokenService = module.get(TOKENS.ITokenService);
  });

  it('should authenticate correctly and return a token', async () => {
    const mockUser = new User('id1', 'test@test.com', 'hashed_pass', 'admin', 'company1');
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hasher.compare.mockResolvedValue(true);
    tokenService.sign.mockResolvedValue('jwt_token');

    const result = await useCase.execute({ email: 'test@test.com', password: 'password' });

    expect(result.access_token).toBe('jwt_token');
    expect(result.user.email).toBe('test@test.com');
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({ email: 'none@test.com', password: 'pass' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if password does not match', async () => {
    const mockUser = new User('id1', 'test@test.com', 'hashed_pass', 'admin', 'company1');
    userRepository.findByEmail.mockResolvedValue(mockUser);
    hasher.compare.mockResolvedValue(false);

    await expect(useCase.execute({ email: 'test@test.com', password: 'wrong' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
