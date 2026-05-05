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
import { ProductRepository } from '../../Infrastructure/Repositories/Product/ProductRepository';
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
import { ProductsController } from '../Http/Product/ProductsController';
import { ListProductsUseCase } from '../../Application/Product/UseCases/ListProductsUseCase';
import { CreateProductUseCase } from '../../Application/Product/UseCases/CreateProductUseCase';
import { UpdateProductUseCase } from '../../Application/Product/UseCases/UpdateProductUseCase';
import { DeleteProductUseCase } from '../../Application/Product/UseCases/DeleteProductUseCase';
import { GetProductUseCase } from '../../Application/Product/UseCases/GetProductUseCase';

import { UploadProductImageUseCase } from '../../Application/Product/UseCases/UploadProductImageUseCase';
import { LocalDiskStorageProvider } from '../../Infrastructure/Storage/LocalDiskStorageProvider';
import { ChatController } from '../Http/Chat/ChatController';
import { ChatUseCase } from '../../Application/Chat/UseCases/ChatUseCase';

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
  controllers: [AuthController, ProductsController, ChatController],
  providers: [
    TenantContext,
    TenantInterceptor,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    LoginUseCase,
    RegisterUseCase,
    ListProductsUseCase,
    GetProductUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    UploadProductImageUseCase,
    ChatUseCase,
    { provide: TOKENS.IUserRepository, useClass: UserRepository },
    { provide: TOKENS.IProductRepository, useClass: ProductRepository },
    { provide: TOKENS.IHasher, useClass: BcryptHasher },
    { provide: TOKENS.ITokenService, useClass: JwtTokenService },
    { provide: TOKENS.IStorageProvider, useClass: LocalDiskStorageProvider },
  ],
  exports: [TenantContext, TenantInterceptor, RolesGuard, JwtAuthGuard],
})
export class RootModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    // Middlewares (ex.: tenancy) serão registrados aqui nos próximos commits.
  }
}

