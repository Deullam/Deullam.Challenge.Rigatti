/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E de Produtos: CRUD, isolamento multi-tenant, RBAC, validação e upload.
 */

import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../Helpers/createE2EApp';

jest.setTimeout(60000);

type Session = { token: string; companyId: string };

describe('Products (E2E)', () => {
  let ctx: E2EContext;
  let server: any;

  // Registra um usuário e devolve token + companyId reais.
  const register = async (
    email: string,
    role: 'admin' | 'user',
    companyName: string,
  ): Promise<Session> => {
    const res = await request(server)
      .post('/auth/register')
      .send({ email, password: 'secret123', companyName, role })
      .expect(201);
    return { token: res.body.access_token, companyId: res.body.user.companyId };
  };

  const sampleProduct = {
    name: 'Notebook Pro',
    description: 'High performance laptop',
    price: 5000,
    category: 'electronics',
  };

  let adminA: Session;
  let adminB: Session;
  let userA: Session;

  beforeAll(async () => {
    ctx = await createE2EApp();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.clearDatabase();
    jest.clearAllMocks();
    adminA = await register('admin-a@a.com', 'admin', 'CompanyA');
    adminB = await register('admin-b@b.com', 'admin', 'CompanyB');
    // userA precisa pertencer AO MESMO tenant do adminA. Como cada /auth/register cria uma
    // empresa nova (novo ObjectId), emitimos um token "user" com o companyId do adminA.
    userA = {
      token: await ctx.signToken({ companyId: adminA.companyId, role: 'user' }),
      companyId: adminA.companyId,
    };
  });

  const auth = (s: Session) => `Bearer ${s.token}`;

  const createProduct = (s: Session, body: object = sampleProduct) =>
    request(server).post('/products').set('Authorization', auth(s)).send(body);

  describe('Authentication guard', () => {
    it('blocks unauthenticated access (401)', async () => {
      await request(server).get('/products').expect(401);
    });

    it('blocks a malformed token (401)', async () => {
      await request(server).get('/products').set('Authorization', 'Bearer garbage').expect(401);
    });
  });

  describe('CRUD + tenant isolation', () => {
    it('creates a product scoped to the admin company', async () => {
      const res = await createProduct(adminA).expect(201);
      expect(res.body).toEqual(
        expect.objectContaining({ name: 'Notebook Pro', price: 5000, companyId: adminA.companyId }),
      );
    });

    it('only lists products of the requesting tenant', async () => {
      await createProduct(adminA).expect(201);

      const resA = await request(server).get('/products').set('Authorization', auth(adminA)).expect(200);
      expect(resA.body).toHaveLength(1);
      expect(resA.body[0].companyId).toBe(adminA.companyId);

      const resB = await request(server).get('/products').set('Authorization', auth(adminB)).expect(200);
      expect(resB.body).toHaveLength(0);
    });

    it('GET /:id returns 200 for the owner and 404 across tenants', async () => {
      const created = await createProduct(adminA).expect(201);
      const id = created.body.id ?? created.body._id;

      await request(server).get(`/products/${id}`).set('Authorization', auth(adminA)).expect(200);
      await request(server).get(`/products/${id}`).set('Authorization', auth(adminB)).expect(404);
    });

    it('updates within the tenant and blocks cross-tenant updates (404)', async () => {
      const created = await createProduct(adminA).expect(201);
      const id = created.body.id ?? created.body._id;

      const updated = await request(server)
        .patch(`/products/${id}`)
        .set('Authorization', auth(adminA))
        .send({ price: 4200 })
        .expect(200);
      expect(updated.body.price).toBe(4200);

      await request(server)
        .patch(`/products/${id}`)
        .set('Authorization', auth(adminB))
        .send({ name: 'Hacked by B' })
        .expect(404);
    });

    it('deletes within the tenant and blocks cross-tenant deletes (404)', async () => {
      const created = await createProduct(adminA).expect(201);
      const id = created.body.id ?? created.body._id;

      await request(server).delete(`/products/${id}`).set('Authorization', auth(adminB)).expect(404);

      await request(server).delete(`/products/${id}`).set('Authorization', auth(adminA)).expect(200);
      await request(server).get(`/products/${id}`).set('Authorization', auth(adminA)).expect(404);
    });
  });

  describe('RBAC (admin vs user)', () => {
    it('allows a "user" role to read the catalog', async () => {
      await createProduct(adminA).expect(201);
      const res = await request(server).get('/products').set('Authorization', auth(userA)).expect(200);
      expect(res.body).toHaveLength(1);
    });

    it('forbids a "user" role from creating/updating/deleting (403)', async () => {
      await createProduct(userA).expect(403);

      const created = await createProduct(adminA).expect(201);
      const id = created.body.id ?? created.body._id;

      await request(server)
        .patch(`/products/${id}`)
        .set('Authorization', auth(userA))
        .send({ price: 1 })
        .expect(403);
      await request(server).delete(`/products/${id}`).set('Authorization', auth(userA)).expect(403);
    });
  });

  describe('DTO validation', () => {
    it.each([
      ['missing name', { description: 'd', price: 10, category: 'c' }],
      ['missing description', { name: 'n', price: 10, category: 'c' }],
      ['negative price', { name: 'n', description: 'd', price: -1, category: 'c' }],
      ['price not a number', { name: 'n', description: 'd', price: 'free', category: 'c' }],
      ['unknown extra field', { ...sampleProduct, hacker: true }],
    ])('returns 400 for %s', async (_label, body) => {
      await createProduct(adminA, body).expect(400);
    });
  });

  describe('Image upload', () => {
    it('uploads an image and returns the public URL via the storage provider', async () => {
      const res = await request(server)
        .post('/products/upload')
        .set('Authorization', auth(adminA))
        .attach('file', Buffer.from('fake-image-bytes'), 'photo.jpg')
        .expect(201);

      expect(res.body.url).toBe('http://localhost:3001/uploads/products/mock-image.jpg');
      expect(ctx.storage.saveFile).toHaveBeenCalledTimes(1);
    });

    it('forbids a "user" role from uploading (403)', async () => {
      await request(server)
        .post('/products/upload')
        .set('Authorization', auth(userA))
        .attach('file', Buffer.from('fake'), 'photo.jpg')
        .expect(403);
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
