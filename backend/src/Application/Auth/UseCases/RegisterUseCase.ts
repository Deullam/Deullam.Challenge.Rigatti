/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Use case para registrar um usuário e retornar token JWT.
 */

import { ConflictException } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { TOKENS } from '../../../Shared/IoC/tokens';
import { IUserRepository } from '../../../Domain/User/IUserRepository';
import { IHasher } from '../../../Infrastructure/Security/Hashing/IHasher';
import { ITokenService } from '../../../Infrastructure/Security/Jwt/ITokenService';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(TOKENS.IUserRepository) private readonly users: IUserRepository,
    @Inject(TOKENS.IHasher) private readonly hasher: IHasher,
    @Inject(TOKENS.ITokenService) private readonly tokens: ITokenService,
  ) { }

  async execute(input: { email: string; password: string; companyName: string; role?: 'admin' | 'user' }) {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw new ConflictException('Email already in use.');
    }

    const passwordHash = await this.hasher.hash(input.password);
    const created = await this.users.create({
      email: input.email,
      passwordHash,
      role: input.role ?? 'admin',
      companyName: input.companyName,
    });

    const access_token = await this.tokens.sign({
      userId: created.id,
      companyId: created.companyId,
      role: created.role,
    });

    return {
      access_token,
      user: { 
        id: created.id, 
        email: created.email, 
        role: created.role, 
        companyId: created.companyId,
        companyName: created.companyName 
      },
    };
  }
}

