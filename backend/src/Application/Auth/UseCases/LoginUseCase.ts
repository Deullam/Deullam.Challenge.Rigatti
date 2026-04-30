/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Use case para autenticar usuário e retornar token JWT.
 */

import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { TOKENS } from '../../../Shared/IoC/tokens';
import { IUserRepository } from '../../../Domain/User/IUserRepository';
import { IHasher } from '../../../Infrastructure/Security/Hashing/IHasher';
import { ITokenService } from '../../../Infrastructure/Security/Jwt/ITokenService';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(TOKENS.IUserRepository) private readonly users: IUserRepository,
    @Inject(TOKENS.IHasher) private readonly hasher: IHasher,
    @Inject(TOKENS.ITokenService) private readonly tokens: ITokenService,
  ) { }

  async execute(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new UnauthorizedException('Invalid credentials.');

    const ok = await this.hasher.compare(input.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials.');

    const access_token = await this.tokens.sign({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
    });

    return {
      access_token,
      user: { id: user.id, email: user.email, role: user.role, companyId: user.companyId },
    };
  }
}

