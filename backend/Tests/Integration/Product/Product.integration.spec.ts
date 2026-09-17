/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes de Integração para o fluxo de Produtos garantindo isolamento Multi-tenant e Uploads.
 */

import { INestApplication } from '@nestjs/common';
import { Types } from 'mongoose';
import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../../Helpers/createE2EApp';

jest.setTimeout(60000);

describe('Product Integration Flow (Multi-tenant)', () => {
  let ctx: E2EContext;
  let app: INestApplication;
  let mockStorageProvider: { saveFile: jest.Mock };

  // IDs de teste (Formato ObjectId válido do MongoDB) para duas empresas diferentes
  const companyA = new Types.ObjectId().toString();
  const companyB = new Types.ObjectId().toString();

  let tokenA: string;
  let tokenB: string;

  beforeAll(async () => {
    // O helper sobe o AppModule real contra um MongoDB em memória, evitando
    // que o Nest tente conectar no banco de produção (causa das falhas anteriores).
    ctx = await createE2EApp();
    app = ctx.app;
    mockStorageProvider = ctx.storage;

    // Gera tokens válidos para os testes
    tokenA = await ctx.signToken({ userId: 'userA', companyId: companyA, role: 'admin' });
    tokenB = await ctx.signToken({ userId: 'userB', companyId: companyB, role: 'admin' });
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.clearDatabase();
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
