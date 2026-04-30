/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Script para rodar o seed inicial do banco de dados.
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SeedService } from '../src/scripts/SeedService';
import { Logger } from '@nestjs/common';

async function bootstrapSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedService = app.get(SeedService);
    await seedService.seedData();
    Logger.log('Seed data created successfully.', 'BootstrapSeed');
  } catch (error) {
    Logger.error('Error during data seeding:', error, 'BootstrapSeed');
  } finally {
    await app.close();
  }
}

bootstrapSeed();
