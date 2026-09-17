/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Script para popular o banco de dados com dados iniciais.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './SeedService'; // Criaremos este serviço

async function bootstrapSeed() {
  const app = await NestFactory.create(AppModule);

  // Pode ser necessário configurar o módulo de config se ele não estiver no AppModule principal
  // Ou apenas usar variáveis de ambiente diretamente aqui.

  const seedService = app.get(SeedService);

  try {
    await seedService.seedData();
    Logger.log('Seed data created successfully.');
  } catch (error) {
    Logger.error('Error seeding data:', error);
  } finally {
    await app.close();
  }
}

bootstrapSeed();

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
