/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E da jornada RG-03 — login com as contas de demonstração semeadas pelo
 * SeedService (as mesmas que o README e a LoginPage anunciam: admin/user @techcorp.com e
 * @foodcorp.com, senha Demo1234!) e catálogo isolado por empresa (TechCorp nunca vê FoodCorp).
 * O SeedService é invocado programaticamente dentro do harness Tests/Helpers/createE2EApp.ts
 * (AppModule real + MongoDB em memória), sem Docker nem `make seed`.
 */

import * as request from 'supertest';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { createE2EApp, E2EContext } from '../Helpers/createE2EApp';
import { SeedService } from '../../src/scripts/SeedService';

jest.setTimeout(60000);

/** Senha de demonstração documentada no README/LoginPage para TODAS as contas semeadas. */
const DEMO_PASSWORD = 'Demo1234!'; // gitleaks:allow

/** Papel possível de uma conta semeada. */
type SeedRole = 'admin' | 'user';

/** Conta de demonstração esperada após o seed: e-mail, empresa e papel. */
type SeedAccount = { email: string; companyName: string; role: SeedRole };

/** As 4 contas que o SeedService cria (oráculo do teste = o que o README promete ao avaliador). */
const SEED_ACCOUNTS: SeedAccount[] = [
  { email: 'admin@techcorp.com', companyName: 'TechCorp', role: 'admin' },
  { email: 'user@techcorp.com', companyName: 'TechCorp', role: 'user' },
  { email: 'admin@foodcorp.com', companyName: 'FoodCorp', role: 'admin' },
  { email: 'user@foodcorp.com', companyName: 'FoodCorp', role: 'user' },
];

/** Nomes dos 10 produtos semeados para a TechCorp. */
const TECHCORP_PRODUCT_NAMES = [
  'Quantum Laptop X1',
  'Nebula Wireless Mouse',
  'Aurora 4K Monitor',
  'Pulse Mechanical Keyboard',
  'Echo Noise-Cancelling Headphones',
  'Vortex Webcam Pro',
  'Helios USB-C Hub',
  'Photon Smartphone 5G',
  'Atlas Tablet 11',
  'Cosmo Smart Watch',
];

/** Nomes dos 10 produtos semeados para a FoodCorp. */
const FOODCORP_PRODUCT_NAMES = [
  'Truffle Mac & Cheese',
  'Wagyu Smash Burger',
  'Margherita Sourdough Pizza',
  'Korean Fried Chicken',
  'Avocado Citrus Salad',
  'Miso Glazed Salmon Bowl',
  'Spicy Tonkotsu Ramen',
  'Molten Chocolate Lava Cake',
  'Matcha Tiramisu',
  'Hibiscus Iced Tea',
];

/** Catálogo esperado por empresa (nomes ordenados para comparação determinística). */
const EXPECTED_CATALOG: Record<string, string[]> = {
  TechCorp: [...TECHCORP_PRODUCT_NAMES].sort(),
  FoodCorp: [...FOODCORP_PRODUCT_NAMES].sort(),
};

/** Forma do produto devolvido por GET /products (entidade de domínio serializada). */
type ProductResponse = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  companyId: string;
};

/** Sessão autenticada de uma conta semeada: token emitido pelo login real + dados do usuário. */
type SeedSession = {
  token: string;
  user: { id: string; email: string; role: SeedRole; companyId: string; companyName: string };
};

// Rastreio: jornada RG-03 do plano do PO (login com as contas de demonstração semeadas).
describe('RG-03 — seeded demo accounts login and per-company catalog (E2E)', () => {
  let ctx: E2EContext;
  let server: any;
  let seedService: SeedService;
  let connection: Connection;

  /**
   * Envia um POST /auth/login com o e-mail informado e a senha de demonstração (ou outra,
   * via `password`) e devolve a resposta crua para asserção de status e corpo.
   */
  const login = (email: string, password: string = DEMO_PASSWORD) =>
    request(server).post('/auth/login').send({ email, password });

  /**
   * Faz login como uma conta semeada e devolve a sessão (token real emitido pelo backend).
   * Falha o teste na origem se o login não devolver 201.
   */
  const loginAs = async (email: string): Promise<SeedSession> => {
    const res = await login(email).expect(201);
    return { token: res.body.access_token, user: res.body.user };
  };

  /** GET /products autenticado com o token da sessão informada. */
  const listProducts = (session: SeedSession) =>
    request(server).get('/products').set('Authorization', `Bearer ${session.token}`);

  /** Conta os documentos de um model registrado na conexão do app (mesma base do seed). */
  const countDocuments = (modelName: string) => connection.model(modelName).countDocuments();

  /** Extrai os nomes dos produtos ordenados, para comparação exata com o catálogo esperado. */
  const namesOf = (products: ProductResponse[]) => products.map((p) => p.name).sort();

  beforeAll(async () => {
    ctx = await createE2EApp();
    server = ctx.app.getHttpServer();
    // O SeedService é provider do MongoosePersistenceModule (não exportado); `app.get` com
    // strict=false (padrão) o localiza em qualquer módulo — mesmo caminho do scripts/seed.ts.
    seedService = ctx.app.get(SeedService);
    connection = ctx.app.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await ctx.close();
  });

  // Seed idempotente: o próprio SeedService limpa as coleções antes de popular; ainda assim
  // limpamos antes para garantir que nenhum estado residual de outro teste influencie.
  beforeEach(async () => {
    await ctx.clearDatabase();
    await seedService.seedData();
  });

  describe('seed dataset', () => {
    it('shouldCreateTwoCompaniesFourUsersAndTwentyProducts', async () => {
      expect(await countDocuments('CompanySchemaClass')).toBe(2);
      expect(await countDocuments('UserSchemaClass')).toBe(4);
      expect(await countDocuments('ProductSchemaClass')).toBe(20);
    });

    it('shouldBeIdempotentWhenSeededTwice', async () => {
      await seedService.seedData();

      expect(await countDocuments('CompanySchemaClass')).toBe(2);
      expect(await countDocuments('UserSchemaClass')).toBe(4);
      expect(await countDocuments('ProductSchemaClass')).toBe(20);
      // Depois do re-seed as contas continuam logáveis e o catálogo continua com 10 itens.
      const session = await loginAs('admin@techcorp.com');
      const res = await listProducts(session).expect(200);
      expect(namesOf(res.body)).toEqual(EXPECTED_CATALOG.TechCorp);
    });
  });

  // AC1: cada uma das 4 contas semeadas loga com Demo1234! e devolve companyName/role corretos.
  describe('login with each seeded demo account', () => {
    it.each(SEED_ACCOUNTS)(
      'shouldLoginAs $email with companyName=$companyName and role=$role',
      async ({ email, companyName, role }) => {
        const res = await login(email).expect(201);

        expect(res.body.access_token).toEqual(expect.any(String));
        expect(res.body.access_token.split('.')).toHaveLength(3); // header.payload.signature
        expect(res.body.user).toStrictEqual({
          id: expect.any(String),
          email,
          role,
          companyId: expect.any(String),
          companyName,
        });
        // Nada de credencial no corpo da resposta.
        expect(res.body.user.password).toBeUndefined();
        expect(res.body.user.passwordHash).toBeUndefined();
      },
    );

    it('shouldBindBothAccountsOfEachCompanyToTheSameCompanyId', async () => {
      const techAdmin = await loginAs('admin@techcorp.com');
      const techUser = await loginAs('user@techcorp.com');
      const foodAdmin = await loginAs('admin@foodcorp.com');
      const foodUser = await loginAs('user@foodcorp.com');

      expect(techUser.user.companyId).toBe(techAdmin.user.companyId);
      expect(foodUser.user.companyId).toBe(foodAdmin.user.companyId);
      expect(foodAdmin.user.companyId).not.toBe(techAdmin.user.companyId);
      // Quatro usuários distintos.
      const ids = [techAdmin, techUser, foodAdmin, foodUser].map((s) => s.user.id);
      expect(new Set(ids).size).toBe(4);
    });

    it('shouldIssueTokenWhoseTenantMatchesTheLoggedUserCompany', async () => {
      const session = await loginAs('admin@foodcorp.com');

      // Efeito observável: o token emitido abre /products e todo item pertence à empresa do usuário.
      const res = await listProducts(session).expect(200);
      expect(res.body.length).toBeGreaterThan(0);
      for (const product of res.body as ProductResponse[]) {
        expect(product.companyId).toBe(session.user.companyId);
      }
    });
  });

  // AC2: GET /products como TechCorp devolve exatamente os 10 produtos da TechCorp; como FoodCorp,
  // exatamente os 10 da FoodCorp — sem nenhuma mistura entre os dois conjuntos.
  describe('per-company catalog isolation', () => {
    it('shouldReturnExactlyTheTenTechCorpProductsForTechCorpAdmin', async () => {
      const session = await loginAs('admin@techcorp.com');
      const res = await listProducts(session).expect(200);
      const products: ProductResponse[] = res.body;

      expect(products).toHaveLength(10);
      expect(namesOf(products)).toEqual(EXPECTED_CATALOG.TechCorp);
      for (const product of products) {
        expect(product.companyId).toBe(session.user.companyId);
        expect(FOODCORP_PRODUCT_NAMES).not.toContain(product.name);
      }
    });

    it('shouldReturnExactlyTheTenFoodCorpProductsForFoodCorpAdmin', async () => {
      const session = await loginAs('admin@foodcorp.com');
      const res = await listProducts(session).expect(200);
      const products: ProductResponse[] = res.body;

      expect(products).toHaveLength(10);
      expect(namesOf(products)).toEqual(EXPECTED_CATALOG.FoodCorp);
      for (const product of products) {
        expect(product.companyId).toBe(session.user.companyId);
        expect(TECHCORP_PRODUCT_NAMES).not.toContain(product.name);
      }
    });

    it('shouldNotShareAnyProductBetweenTheTwoCompanies', async () => {
      const tech = await listProducts(await loginAs('admin@techcorp.com')).expect(200);
      const food = await listProducts(await loginAs('admin@foodcorp.com')).expect(200);

      const techIds = new Set((tech.body as ProductResponse[]).map((p) => p.id));
      const foodIds = (food.body as ProductResponse[]).map((p) => p.id);
      expect(foodIds.some((id) => techIds.has(id))).toBe(false);
      // Os dois catálogos juntos cobrem exatamente os 20 produtos semeados — nenhum sobra nem falta.
      expect(techIds.size + new Set(foodIds).size).toBe(20);
    });

    it('shouldGiveRoleUserTheSameCompanyCatalogAsItsAdmin', async () => {
      const techUser = await loginAs('user@techcorp.com');
      const foodUser = await loginAs('user@foodcorp.com');

      const techRes = await listProducts(techUser).expect(200);
      const foodRes = await listProducts(foodUser).expect(200);

      expect(namesOf(techRes.body)).toEqual(EXPECTED_CATALOG.TechCorp);
      expect(namesOf(foodRes.body)).toEqual(EXPECTED_CATALOG.FoodCorp);
    });

    it('shouldReturn404WhenTechCorpFetchesAFoodCorpProductById', async () => {
      const foodSession = await loginAs('admin@foodcorp.com');
      const techSession = await loginAs('admin@techcorp.com');
      const foodProducts: ProductResponse[] = (await listProducts(foodSession).expect(200)).body;
      const foreignId = foodProducts[0].id;

      // Mesmo conhecendo o id, o tenant vizinho não enxerga o produto (404, não 200 nem 403).
      const res = await request(server)
        .get(`/products/${foreignId}`)
        .set('Authorization', `Bearer ${techSession.token}`)
        .expect(404);
      expect(res.body.message).toBe('Product not found.');

      // Controle: o dono do produto o enxerga normalmente.
      await request(server)
        .get(`/products/${foreignId}`)
        .set('Authorization', `Bearer ${foodSession.token}`)
        .expect(200);
    });
  });

  // Caso negativo: senha diferente de Demo1234! → 401 (seed não deixou senha previsível/plana).
  describe('wrong password on a seeded account', () => {
    it.each([
      ['a different password', 'NotTheDemo1'],
      ['the demo password in lower case', 'demo1234!'],
      ['the demo password without the symbol', 'Demo1234'],
    ])('shouldReject401WithGenericMessageFor %s', async (_label, password) => {
      const res = await login('admin@techcorp.com', password).expect(401);

      expect(res.body.message).toBe('Invalid credentials.');
      expect(res.body.access_token).toBeUndefined();
      expect(res.body.user).toBeUndefined();
    });

    it('shouldStoreOnlyABcryptHashAndNeverThePlainDemoPassword', async () => {
      const users = await connection
        .model('UserSchemaClass')
        .find({}, { email: 1, passwordHash: 1, password: 1 })
        .lean<{ email: string; passwordHash: string; password?: string }[]>();

      expect(users).toHaveLength(4);
      for (const user of users) {
        expect(user.password).toBeUndefined();
        expect(user.passwordHash).not.toBe(DEMO_PASSWORD);
        expect(user.passwordHash).not.toContain(DEMO_PASSWORD);
        expect(user.passwordHash).toMatch(/^\$2[aby]\$\d{2}\$/); // formato bcrypt
      }
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
