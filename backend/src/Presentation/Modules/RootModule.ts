/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Composition root do NestJS (imports globais e registro de middlewares).
 */

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGODB_URI ?? ''),
  ],
})
export class RootModule implements NestModule {
  configure(_consumer: MiddlewareConsumer) {
    // Middlewares (ex.: tenancy) serão registrados aqui nos próximos commits.
  }
}

