/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E do Chat: streaming SSE + tool calling consultando o MongoDB real, isolado por tenant.
 *
 * O LLM (Vercel AI SDK + Google) é mockado para não chamar a API externa, MAS a ferramenta
 * `search_company_products` executa de verdade contra o repositório/Mongo, provando que:
 *  - a IA só enxerga os produtos do tenant autenticado;
 *  - o controller transforma os deltas no formato SSE esperado pelo frontend.
 */

import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../Helpers/createE2EApp';

jest.setTimeout(60000);

// Mock do AI SDK: streamText invoca a ferramenta real e emite os chunks do fullStream.
jest.mock('ai', () => ({
  tool: jest.fn((cfg) => cfg),
  stepCountIs: jest.fn((n) => n),
  streamText: jest.fn((options: any) => ({
    fullStream: (async function* () {
      const searchTool = options.tools.search_company_products;
      const products = await searchTool.execute({ query: '' });

      yield { type: 'tool-call', toolName: 'search_company_products', input: { query: '' } };
      yield { type: 'tool-result', output: products };

      const names = products.map((p: any) => p.nome).join(', ');
      yield {
        type: 'text-delta',
        text: products.length ? `Encontrei: ${names}.` : 'Nenhum produto cadastrado.',
      };
    })(),
  })),
}));

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => () => 'mocked-model'),
}));

type Session = { token: string; companyId: string };

describe('Chat (E2E, tool calling + SSE)', () => {
  let ctx: E2EContext;
  let server: any;

  const register = async (email: string, companyName: string): Promise<Session> => {
    const res = await request(server)
      .post('/auth/register')
      .send({ email, password: 'secret123', companyName, role: 'admin' })
      .expect(201);
    return { token: res.body.access_token, companyId: res.body.user.companyId };
  };

  const createProduct = (s: Session, name: string) =>
    request(server)
      .post('/products')
      .set('Authorization', `Bearer ${s.token}`)
      .send({ name, description: 'desc', price: 100, category: 'general' })
      .expect(201);

  const askChat = (s: Session) =>
    request(server)
      .post('/chat')
      .set('Authorization', `Bearer ${s.token}`)
      .send({ messages: [{ role: 'user', content: 'Liste os produtos' }] });

  beforeAll(async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    ctx = await createE2EApp();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.clearDatabase();
  });

  it('requires authentication (401)', async () => {
    await request(server)
      .post('/chat')
      .send({ messages: [{ role: 'user', content: 'oi' }] })
      .expect(401);
  });

  it('streams SSE with real catalog data for the authenticated tenant and ends with [DONE]', async () => {
    const companyA = await register('a@a.com', 'CompanyA');
    await createProduct(companyA, 'Teclado Mecânico');
    await createProduct(companyA, 'Mouse Gamer');

    // O ChatController usa @Res() e POST, então o Express responde 201 por padrão.
    const res = await askChat(companyA).expect(201);

    // Formato SSE estilo OpenAI consumido pelo frontend.
    expect(res.text).toContain('data: ');
    expect(res.text).toContain('Teclado Mecânico');
    expect(res.text).toContain('Mouse Gamer');
    expect(res.text.trim().endsWith('data: [DONE]')).toBe(true);
  });

  it('never leaks another tenant\'s products through the AI tool', async () => {
    const companyA = await register('a@a.com', 'CompanyA');
    const companyB = await register('b@b.com', 'CompanyB');
    await createProduct(companyA, 'Produto Secreto da A');

    // B pergunta — a ferramenta deve consultar SÓ o catálogo de B (vazio).
    const res = await askChat(companyB).expect(201);

    expect(res.text).not.toContain('Produto Secreto da A');
    expect(res.text).toContain('Nenhum produto cadastrado.');
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
