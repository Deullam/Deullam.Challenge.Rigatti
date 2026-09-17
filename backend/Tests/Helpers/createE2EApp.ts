/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Helper que sobe a aplicação NestJS completa contra um MongoDB em memória para testes E2E.
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TOKENS } from '../../src/Shared/IoC/tokens';
import { ITokenService } from '../../src/Infrastructure/Security/Jwt/ITokenService';
import { IStorageProvider } from '../../src/Application/Storage/IStorageProvider';
import { TenantInterceptor } from '../../src/Presentation/Http/Tenancy/TenantInterceptor';

export type TestRole = 'admin' | 'user';

let userCounter = 0;

export type E2EContext = {
  app: INestApplication;
  /** Mock do storage para não gravar ficheiros reais no disco durante os testes. */
  storage: { saveFile: jest.Mock };
  /** Gera um JWT válido para um tenant/role arbitrário. */
  signToken: (input: { userId?: string; companyId: string; role?: TestRole }) => Promise<string>;
  /** Limpa todas as collections entre testes. */
  clearDatabase: () => Promise<void>;
  /** Encerra app + servidor de memória. */
  close: () => Promise<void>;
};

/**
 * Sobe o AppModule real apontando para um MongoDB em memória.
 *
 * IMPORTANTE: o AppModule (e o RootModule) chamam `MongooseModule.forRoot(process.env.MONGODB_URI)`
 * no momento em que o módulo é avaliado. Por isso definimos a env ANTES de importar o AppModule
 * dinamicamente — caso contrário o Nest tentaria conectar ao Mongo de produção (localhost:27017),
 * cada retry leva ~30s e o `beforeAll` estoura o timeout.
 */
export async function createE2EApp(): Promise<E2EContext> {
  const mongod = await MongoMemoryServer.create();

  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-test-secret';

  // Import dinâmico: garante que o forRoot leia a env já apontando para o Mongo em memória.
  const { AppModule } = await import('../../src/app.module');

  const storage: { saveFile: jest.Mock } = {
    saveFile: jest.fn().mockResolvedValue('http://localhost:3001/uploads/products/mock-image.jpg'),
  };

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(TOKENS.IStorageProvider)
    .useValue(storage as IStorageProvider)
    .compile();

  const app = moduleFixture.createNestApplication();

  // Espelha a configuração de produção esperada: validação de DTOs e tenancy global.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalInterceptors(app.get(TenantInterceptor));

  await app.init();

  const tokenService = app.get<ITokenService>(TOKENS.ITokenService);
  const connection = app.get<Connection>(getConnectionToken());

  const signToken: E2EContext['signToken'] = ({ userId, companyId, role = 'admin' }) =>
    tokenService.sign({ userId: userId ?? `user-${++userCounter}`, companyId, role });

  const clearDatabase = async () => {
    const collections = connection.collections;
    await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
  };

  const close = async () => {
    await app.close();
    await mongod.stop();
  };

  return { app, storage, signToken, clearDatabase, close };
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
