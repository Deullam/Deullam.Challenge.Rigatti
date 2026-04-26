/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Composition root do NestJS (imports globais e registro de middlewares).
 */

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { TenantContext } from '../../Infrastructure/Tenancy/TenantContext';
import { MongoosePersistenceModule } from '../../Infrastructure/Database/Mongoose/MongoosePersistenceModule';
import { UserRepository } from '../../Infrastructure/Repositories/User/UserRepository';
import { BcryptHasher } from '../../Infrastructure/Security/Hashing/BcryptHasher';
import { JwtTokenService } from '../../Infrastructure/Security/Jwt/JwtTokenService';
import { TOKENS } from '../../Shared/IoC/tokens';
import { AuthController } from '../Http/Auth/AuthController';
import { JwtAuthGuard } from '../Http/Auth/JwtAuthGuard';
import { JwtStrategy } from '../Http/Auth/JwtStrategy';
import { RolesGuard } from '../Http/Auth/RolesGuard';
import { TenantInterceptor } from '../Http/Tenancy/TenantInterceptor';
import { LoginUseCase } from '../../Application/Auth/UseCases/LoginUseCase';
import { RegisterUseCase } from '../../Application/Auth/UseCases/RegisterUseCase';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'changeme-dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
    MongoosePersistenceModule,
  ],
  controllers: [AuthController],
  providers: [
    TenantContext,
    TenantInterceptor,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    LoginUseCase,
    RegisterUseCase,
    { provide: TOKENS.IUserRepository, useClass: UserRepository },
    { provide: TOKENS.IHasher, useClass: BcryptHasher },
    { provide: TOKENS.ITokenService, useClass: JwtTokenService },
  ],
  exports: [TenantContext, TenantInterceptor, RolesGuard, JwtAuthGuard],
})
export class RootModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    // Middlewares (ex.: tenancy) serão registrados aqui nos próximos commits.
  }
}

