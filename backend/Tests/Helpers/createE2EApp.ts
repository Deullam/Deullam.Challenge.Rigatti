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
import { AbstractLoader, ExpressLoader } from '@nestjs/serve-static';
import { TOKENS } from '../../src/Shared/IoC/tokens';
import { ITokenService } from '../../src/Infrastructure/Security/Jwt/ITokenService';
import { IStorageProvider } from '../../src/Application/Storage/IStorageProvider';
import { TenantInterceptor } from '../../src/Presentation/Http/Tenancy/TenantInterceptor';

export type TestRole = 'admin' | 'user';

let userCounter = 0;

/**
 * Opções do harness. `storage: 'mock'` (padrão) substitui o IStorageProvider por um jest.fn para
 * não tocar o disco; `storage: 'real'` mantém o LocalDiskStorageProvider registrado no RootModule
 * (grava em `<cwd>/uploads`) — usado pelos specs que validam o upload de verdade (RG-06).
 */
export type E2EOptions = { storage?: 'mock' | 'real' };

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

/** Contexto devolvido quando o harness sobe com o storage real: não há mock a inspecionar. */
export type RealStorageE2EContext = Omit<E2EContext, 'storage'> & { storage: null };

/**
 * Sobe o AppModule real apontando para um MongoDB em memória.
 *
 * IMPORTANTE: o AppModule (e o RootModule) chamam `MongooseModule.forRoot(process.env.MONGODB_URI)`
 * no momento em que o módulo é avaliado. Por isso definimos a env ANTES de importar o AppModule
 * dinamicamente — caso contrário o Nest tentaria conectar ao Mongo de produção (localhost:27017),
 * cada retry leva ~30s e o `beforeAll` estoura o timeout.
 */
export function createE2EApp(): Promise<E2EContext>;
export function createE2EApp(options: { storage: 'real' }): Promise<RealStorageE2EContext>;
export function createE2EApp(options: { storage?: 'mock' }): Promise<E2EContext>;
export async function createE2EApp(
  options: E2EOptions = {},
): Promise<E2EContext | RealStorageE2EContext> {
  const useRealStorage = options.storage === 'real';

  // launchTimeout: o padrão do mongodb-memory-server é 10s. No Windows, o primeiro arranque do
  // binário mongod após boot/npm ci (scan do antivírus) ultrapassa esse limite e derruba a suíte
  // inteira com "Instance failed to start within 10000ms"; arranques quentes levam ~4s.
  // 30s mantém folga abaixo do timeout de 60s dos hooks do Jest usado pelos specs.
  const mongod = await MongoMemoryServer.create({ instance: { launchTimeout: 30_000 } });

  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'e2e-test-secret';

  // Import dinâmico: garante que o forRoot leia a env já apontando para o Mongo em memória.
  const { AppModule } = await import('../../src/app.module');

  const storage: { saveFile: jest.Mock } | null = useRealStorage
    ? null
    : {
        saveFile: jest
          .fn()
          .mockResolvedValue('http://localhost:3001/uploads/products/mock-image.jpg'),
      };

  // O ServeStaticModule escolhe o loader (Express/Fastify/Noop) na instanciação do provider
  // AbstractLoader, lendo HttpAdapterHost.httpAdapter. No fluxo Test.createTestingModule().compile()
  // o adapter só é definido depois, em createNestApplication(), então cai no NoopLoader e a rota
  // estática /uploads NUNCA é montada (diferente do NestFactory.create de produção). Forçamos o
  // ExpressLoader — o mesmo que main.ts obtém — para que o app de teste espelhe produção.
  const builder = Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(AbstractLoader)
    .useValue(new ExpressLoader());
  // Com storage real NÃO sobrescrevemos o token: o LocalDiskStorageProvider do RootModule é usado.
  if (storage) {
    builder.overrideProvider(TOKENS.IStorageProvider).useValue(storage as IStorageProvider);
  }
  const moduleFixture: TestingModule = await builder.compile();

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
