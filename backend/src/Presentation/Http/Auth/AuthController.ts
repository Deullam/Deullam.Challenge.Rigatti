/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Controlador de autenticação com proteção de erros (try/catch) adaptado para TypeScript estrito.
 */

import { Body, Controller, Post, HttpException, HttpStatus } from '@nestjs/common';
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
      // Documentação: Verificação de tipo (Type Guard).
      // Verifica se a variável 'error' é realmente um objeto de Erro que possui a propriedade '.message'.
      const mensagemErro = error instanceof Error ? error.message : 'Erro interno ao tentar fazer login';

      throw new HttpException(
        mensagemErro,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    try {
      const resultado = await this.registerUseCase.execute(dto);
      return resultado;

    } catch (error: unknown) {
      // Documentação: Mesma proteção de tipo aplicada no registro.
      const mensagemErro = error instanceof Error ? error.message : 'Erro interno ao tentar registrar usuário';

      throw new HttpException(
        mensagemErro,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}