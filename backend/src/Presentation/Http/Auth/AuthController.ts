/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Controlador de autenticação com proteção de erros (try/catch) adaptado para TypeScript estrito.
 */

import { Body, Controller, Post, HttpException, InternalServerErrorException } from '@nestjs/common';
import { LoginDto } from '../../../Application/Auth/DTOs/LoginDto';
import { RegisterDto } from '../../../Application/Auth/DTOs/RegisterDto';
import { LoginUseCase } from '../../../Application/Auth/UseCases/LoginUseCase';
import { RegisterUseCase } from '../../../Application/Auth/UseCases/RegisterUseCase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly registerUseCase: RegisterUseCase,
  ) { }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      const resultado = await this.loginUseCase.execute(dto);
      return resultado;
    } catch (error: unknown) {
      // Erros de domínio (ex.: UnauthorizedException) já carregam o status HTTP correto;
      // só os preservamos. Qualquer erro inesperado vira 500.
      if (error instanceof HttpException) throw error;
      const mensagemErro = error instanceof Error ? error.message : 'Erro interno ao tentar fazer login';
      throw new InternalServerErrorException(mensagemErro);
    }
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const resultado = await this.registerUseCase.execute(dto);
      return resultado;
    } catch (error: unknown) {
      // Preserva o status de domínio (ex.: ConflictException = 409) e só envolve o que for inesperado.
      if (error instanceof HttpException) throw error;
      const mensagemErro = error instanceof Error ? error.message : 'Erro interno ao tentar registrar usuário';
      throw new InternalServerErrorException(mensagemErro);
    }
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
