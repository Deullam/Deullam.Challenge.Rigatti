/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Implementação de ITokenService usando @nestjs/jwt.
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ITokenService } from './ITokenService';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(private readonly jwt: JwtService) {}

  async sign(input: { userId: string; companyId: string; role: 'admin' | 'user' }): Promise<string> {
    return this.jwt.signAsync({
      sub: input.userId,
      companyId: input.companyId,
      role: input.role,
    });
  }
}

