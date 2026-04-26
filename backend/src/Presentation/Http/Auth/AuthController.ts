/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Controller HTTP para login e registro.
 */

import { Body, Controller, Post } from '@nestjs/common';
import { LoginDto } from '../../../Application/Auth/DTOs/LoginDto';
import { RegisterDto } from '../../../Application/Auth/DTOs/RegisterDto';
import { LoginUseCase } from '../../../Application/Auth/UseCases/LoginUseCase';
import { RegisterUseCase } from '../../../Application/Auth/UseCases/RegisterUseCase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }
}

