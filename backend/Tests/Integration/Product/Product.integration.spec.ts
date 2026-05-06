/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes de Integração para o fluxo de Produtos garantindo isolamento Multi-tenant e Uploads.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { AppModule } from '../../../src/app.module'; // Ajuste o caminho conforme o seu projeto
import { TestDatabase } from '../../Helpers/TestDatabase';
import { TOKENS } from '../../../src/Shared/IoC/tokens';
import { ITokenService } from '../../../src/Infrastructure/Security/Jwt/ITokenService';
import { IStorageProvider } from '../../../src/Application/Storage/IStorageProvider';
import { TenantInterceptor } from '../../../src/Presentation/Http/Tenancy/TenantInterceptor';

describe('Product Integration Flow (Multi-tenant)', () => {
  let app: INestApplication;
  let testDb: TestDatabase;
  let tokenService: ITokenService;

  // IDs de teste (Formato ObjectId válido do MongoDB) para duas empresas diferentes
  const companyA = '60d5ec123456789012345671';
  const companyB = '60d5ec123456789012345672';

  let tokenA: string;
  let tokenB: string;

  // Criamos um "Mock" do StorageProvider para não gravar ficheiros reais no disco durante os testes
  const mockStorageProvider: IStorageProvider = {
    saveFile: jest.fn().mockResolvedValue('http://localhost:3001/uploads/products/mock-image.jpg'),
  };

  beforeAll(async () => {
    testDb = new TestDatabase();
    await testDb.connect();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(testDb.getUri()),
        AppModule,
      ],
    })
      // Substituímos o provedor real pelo nosso Mock
      .overrideProvider(TOKENS.IStorageProvider)
      .useValue(mockStorageProvider)
      .compile();

    app = moduleFixture.createNestApplication();

    // Essencial para testar se os DTOs bloqueiam dados inválidos
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    const tenantInterceptor = app.get(TenantInterceptor);
    app.useGlobalInterceptors(tenantInterceptor);
    await app.init();

    tokenService = app.get<ITokenService>(TOKENS.ITokenService);

    // Gera tokens válidos para os testes
    tokenA = await tokenService.sign({ userId: 'userA', companyId: companyA, role: 'admin' });
    tokenB = await tokenService.sign({ userId: 'userB', companyId: companyB, role: 'admin' });
  });

  afterAll(async () => {
    await app.close();
    await testDb.close();
  });

  beforeEach(async () => {
    await testDb.clear();
    jest.clearAllMocks(); // Limpa as chamadas do mock do storage antes de cada teste
  });

  describe('1. CRUD Clássico e Isolamento (Tenant RLS)', () => {

    it('should create a product for Company A and NOT show it for Company B', async () => {
      const productData = {
        name: 'Notebook Pro',
        description: 'High performance',
        price: 5000,
        category: 'electronics'
      };

      // 1. Criar produto na Empresa A
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(productData)
        .expect(201);

      // 2. Listar produtos como Empresa A (Deve vir 1)
      const resA = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(resA.body).toHaveLength(1);
      expect(resA.body[0].name).toBe(productData.name);
      expect(resA.body[0].companyId).toBe(companyA);

      // 3. Listar produtos como Empresa B (Deve vir 0 - ISOLAMENTO)
      const resB = await request(app.getHttpServer())
        .get('/products')
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(200);

      expect(resB.body).toHaveLength(0);
    });

    it('should prevent Company B from updating a product from Company A', async () => {
      // 1. Criar produto na Empresa A
      const createRes = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'Original', price: 10, category: 'cat', description: 'desc' });

      const productId = createRes.body.id || createRes.body._id; // Trata consoante o retorno do seu DTO

      // 2. Tentar atualizar usando o Token da Empresa B
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: 'Hacked by Company B' })
        .expect(404); // Deve falhar pois o ID não existe dentro do contexto da Empresa B
    });

    it('should prevent Company B from deleting a product from Company A', async () => {
      // 1. Criar produto na Empresa A
      const createRes = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: 'To Be Deleted', price: 10, category: 'cat', description: 'desc' });

      const productId = createRes.body.id || createRes.body._id;

      // 2. Tentar apagar usando o Token da Empresa B
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(404); // A exclusão deve falhar e retornar não encontrado
    });
  });

  describe('2. Validações de Entrada (Pipes)', () => {

    it('should return 400 Bad Request when trying to create a product without a name', async () => {
      const invalidProduct = {
        description: 'Missing name',
        price: 100,
        category: 'electronics'
      };

      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(invalidProduct)
        .expect(400);

      expect(res.body.message).toEqual(expect.arrayContaining([expect.stringContaining('name')]));
    });
  });

  describe('3. Upload de Arquivos (Storage)', () => {

    it('should upload an image and return the public url', async () => {
      // Cria um ficheiro fictício na memória
      const fakeFileBuffer = Buffer.from('conteudo-falso-de-imagem');

      const res = await request(app.getHttpServer())
        .post('/products/upload')
        .set('Authorization', `Bearer ${tokenA}`)
        // Usamos .attach para simular um formulário multipart/form-data
        .attach('file', fakeFileBuffer, 'teste.jpg')
        .expect(201); // O padrão POST do NestJS retorna 201

      // Verifica se a URL retornada é a do nosso Mock
      expect(res.body).toHaveProperty('url');
      expect(res.body.url).toBe('http://localhost:3001/uploads/products/mock-image.jpg');

      // Verifica se o UseCase chamou o provedor de infraestrutura com os dados corretos
      expect(mockStorageProvider.saveFile).toHaveBeenCalledTimes(1);
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
