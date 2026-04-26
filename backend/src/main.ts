/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Bootstrap do servidor NestJS.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TenantInterceptor } from './Presentation/Http/Tenancy/TenantInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalInterceptors(app.get(TenantInterceptor));
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

bootstrap();

