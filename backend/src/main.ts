/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Arquivo principal (bootstrap) da aplicação NestJS.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TenantInterceptor } from './Presentation/Http/Tenancy/TenantInterceptor';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // Import ConfigService

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Documentação: Instancia o serviço de configurações para ler o .env
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3001);

  // Documentação: Busca a URL principal do frontend configurada no .env
  const envFrontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:5173');

  // Documentação: Configuração do CORS com múltiplas permissões
  app.enableCors({
    origin: [
      envFrontendUrl,          // Mantém a flexibilidade de ler do .env
      'http://localhost:8080', // Permite o seu frontend atual
      'http://localhost:3000'  // Opcional: Previne erros futuros se usar Next.js ou React padrão
    ],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Permite todos os verbos HTTP essenciais
  });

  // Documentação: Aplica o interceptador de multi-tenancy globalmente
  app.useGlobalInterceptors(app.get(TenantInterceptor));

  // Documentação: Inicia o servidor na porta definida
  await app.listen(port, () => {
    Logger.log(`🚀 Application is running on: ${configService.get<string>('HOST', 'localhost')}:${port}`);
  });
}

bootstrap();

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
