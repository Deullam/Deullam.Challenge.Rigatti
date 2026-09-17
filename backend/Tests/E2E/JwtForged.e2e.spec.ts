/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E da jornada RG-09 — rejeição de JWT forjado e adulterado: token com
 * payload plausível assinado com secret diferente do JWT_SECRET do servidor; token legítimo cujo
 * payload (companyId / role / sub) foi editado após a assinatura sem re-assinar; assinatura
 * recortada de outro token; assinatura removida; `alg: none`; header adulterado. Toda rota atrás
 * do JwtAuthGuard tem de responder 401 (JSON genérico, nunca SSE nem 403) e nenhum efeito
 * colateral pode ocorrer (nada criado, nada lido do outro tenant). AppModule real + Mongo em
 * memória; tokens hostis gerados por Tests/Helpers/jwtTestTokens.ts com o JwtService do
 * @nestjs/jwt — sem pacote novo, sem rede.
 */

import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../Helpers/createE2EApp';
import {
  buildUnsignedJwt,
  decodeJwtSegment,
  signTestJwt,
  spliceJwtSignature,
  stripJwtSignature,
  tamperJwtHeader,
  tamperJwtPayload,
  TestJwtClaims,
} from '../Helpers/jwtTestTokens';
import { PROTECTED_ROUTES, VALID_PRODUCT_BODY } from '../Helpers/protectedRoutes';

jest.setTimeout(60000);

/** Sessão autenticada: token emitido pelo backend + empresa dona. */
type Session = { token: string; companyId: string };

/** Secret que um atacante "chutaria" — diferente do JWT_SECRET do processo de teste. */
const ATTACKER_SECRET = 'attacker-guessed-secret'; // gitleaks:allow

/** Produto que só a Empresa A possui — a isca que um token forjado tentaria ler. */
const SECRET_PRODUCT_OF_A = 'Produto Secreto da A';

/** Corpo válido de criação de produto (usado para provar ausência de efeito colateral). */
const PRODUCT_BODY = VALID_PRODUCT_BODY;

// Rastreio: jornada RG-09 do plano do PO (JWT forjado / adulterado → 401 em rota protegida).
describe('RG-09 — forged and tampered JWTs are rejected with 401 (E2E)', () => {
  let ctx: E2EContext;
  let server: any;
  /** Secret que o servidor de teste usa de fato (definido pelo harness antes de importar o AppModule). */
  let serverSecret: string;
  let companyA: Session;
  let companyB: Session;
  /** Token legítimo de papel `user` da Empresa B (alvo das adulterações de escalada). */
  let userOfB: Session;

  /** Registra um admin (empresa nova) e devolve token + companyId reais. */
  const register = async (email: string, companyName: string): Promise<Session> => {
    const res = await request(server)
      .post('/auth/register')
      .send({ email, password: 'secret123', companyName, role: 'admin' }) // gitleaks:allow
      .expect(201);
    return { token: res.body.access_token, companyId: res.body.user.companyId };
  };

  /** Dispara uma rota protegida com o token informado. */
  const callWithToken = (token: string, method: 'get' | 'post', path: string, body?: object) => {
    const req = request(server)[method](path).set('Authorization', `Bearer ${token}`);
    return body ? req.send(body) : req;
  };

  /** Lista os produtos visíveis para a sessão (rota legítima, usada para medir efeitos colaterais). */
  const listProducts = (s: Session) =>
    request(server).get('/products').set('Authorization', `Bearer ${s.token}`).expect(200);

  /** Claims plausíveis apontando para a Empresa A como admin. */
  const adminClaimsForA = (): TestJwtClaims => ({
    sub: 'attacker-user-id',
    companyId: companyA.companyId,
    role: 'admin',
  });

  /** Asserções comuns a toda rejeição: 401 JSON genérico do Nest, sem corpo de dados. */
  const expectGeneric401 = (res: request.Response) => {
    expect(res.status).toBe(401);
    expect(res.headers['content-type']).toMatch(/^application\/json/);
    expect(res.body).toStrictEqual({ statusCode: 401, message: 'Unauthorized' });
  };

  beforeAll(async () => {
    ctx = await createE2EApp();
    server = ctx.app.getHttpServer();
    serverSecret = process.env.JWT_SECRET as string;
    expect(serverSecret).toEqual(expect.any(String));
    expect(serverSecret).not.toBe(ATTACKER_SECRET);
  });

  afterAll(async () => {
    await ctx.close();
  });

  // Seed idempotente: A com um produto secreto, B vazia, mais um `user` legítimo de B.
  beforeEach(async () => {
    await ctx.clearDatabase();
    companyA = await register('admin@company-a.test', 'CompanyA');
    companyB = await register('admin@company-b.test', 'CompanyB');
    userOfB = {
      token: await ctx.signToken({ companyId: companyB.companyId, role: 'user' }),
      companyId: companyB.companyId,
    };
    await request(server)
      .post('/products')
      .set('Authorization', `Bearer ${companyA.token}`)
      .send({ ...PRODUCT_BODY, name: SECRET_PRODUCT_OF_A })
      .expect(201);
  });

  // Controle: o MESMO formato de claims assinado com o secret do servidor é aceito — garante que
  // as rejeições abaixo acontecem pela assinatura/adulteração, não por defeito de formato.
  describe('control', () => {
    it('shouldAcceptTokenSignedWithTheServerSecret', async () => {
      const token = signTestJwt(serverSecret, adminClaimsForA());

      const res = await callWithToken(token, 'get', '/products').expect(200);

      expect(res.body.map((p: any) => p.name)).toEqual([SECRET_PRODUCT_OF_A]);
    });
  });

  // AC1: assinatura com secret diferente do JWT_SECRET → 401 antes de qualquer controller.
  describe('token signed with a wrong secret', () => {
    it.each(PROTECTED_ROUTES)('shouldReject401On $label', async ({ method, path, body }) => {
      const forged = signTestJwt(ATTACKER_SECRET, adminClaimsForA());

      const res = await callWithToken(forged, method, path, body);

      expectGeneric401(res);
    });

    it('shouldNotCreateAnythingWithForgedAdminToken', async () => {
      const forged = signTestJwt(ATTACKER_SECRET, adminClaimsForA());

      await callWithToken(forged, 'post', '/products', PRODUCT_BODY).expect(401);

      const visibleToA = await listProducts(companyA);
      expect(visibleToA.body.map((p: any) => p.name)).toEqual([SECRET_PRODUCT_OF_A]);
    });

    it('shouldRejectSecretThatDiffersFromTheServerSecretByOneCharacter', async () => {
      const almostRight = signTestJwt(`${serverSecret}x`, adminClaimsForA());

      expectGeneric401(await callWithToken(almostRight, 'get', '/products'));
    });

    it('shouldRejectForgedTokenTargetingAnExistingUserId', async () => {
      // Mesmo apontando para um usuário/empresa que existem de verdade, sem o secret não entra.
      const meRes = await request(server)
        .post('/auth/login')
        .send({ email: 'admin@company-a.test', password: 'secret123' }) // gitleaks:allow
        .expect(201);
      const forged = signTestJwt(ATTACKER_SECRET, {
        sub: meRes.body.user.id,
        companyId: companyA.companyId,
        role: 'admin',
      });

      expectGeneric401(await callWithToken(forged, 'get', '/products'));
    });
  });

  // AC2: payload editado após a assinatura (sem re-assinar) → 401; nunca se "troca de empresa".
  describe('legitimate token with payload tampered after signing', () => {
    it('shouldRejectTokenWhoseCompanyIdWasSwappedToAnotherCompany', async () => {
      const tampered = tamperJwtPayload(companyB.token, { companyId: companyA.companyId });
      // Sanidade do cenário: o payload adulterado aponta mesmo para A e a assinatura é a de B.
      expect(decodeJwtSegment(tampered.split('.')[1]).companyId).toBe(companyA.companyId);
      expect(tampered.split('.')[2]).toBe(companyB.token.split('.')[2]);

      const res = await callWithToken(tampered, 'get', '/products');

      expectGeneric401(res);
      expect(JSON.stringify(res.body)).not.toContain(SECRET_PRODUCT_OF_A);
    });

    it.each(PROTECTED_ROUTES)(
      'shouldReject401WithSwappedCompanyIdOn $label',
      async ({ method, path, body }) => {
        const tampered = tamperJwtPayload(companyB.token, { companyId: companyA.companyId });

        expectGeneric401(await callWithToken(tampered, method, path, body));
      },
    );

    it('shouldRejectTokenWhoseRoleWasEscalatedFromUserToAdmin', async () => {
      const escalated = tamperJwtPayload(userOfB.token, { role: 'admin' });

      const res = await callWithToken(escalated, 'post', '/products', PRODUCT_BODY);

      // 401 (assinatura inválida), e não 403 (o que indicaria que o payload foi confiado).
      expectGeneric401(res);
      const visibleToB = await listProducts(companyB);
      expect(visibleToB.body).toEqual([]);
    });

    it('shouldRejectTokenWhoseSubWasSwapped', async () => {
      const tampered = tamperJwtPayload(companyB.token, { sub: 'someone-else' });

      expectGeneric401(await callWithToken(tampered, 'get', '/products'));
    });

    it('shouldRejectPayloadOfOneTokenSplicedWithSignatureOfAnother', async () => {
      // Dois tokens legítimos (A e B): payload de A + assinatura de B → assinatura não confere.
      const spliced = spliceJwtSignature(companyA.token, companyB.token);
      expect(spliced).not.toBe(companyA.token);

      expectGeneric401(await callWithToken(spliced, 'get', '/products'));
    });

    it('shouldRejectTokenWhosePayloadWasReEncodedWithoutChanges', async () => {
      // Re-serializar o payload (chaves em outra ordem) muda os bytes assinados → 401.
      const [header, payload, signature] = companyA.token.split('.');
      const claims = decodeJwtSegment(payload);
      const reordered = Object.fromEntries(Object.entries(claims).reverse());
      const reEncoded = [header, Buffer.from(JSON.stringify(reordered)).toString('base64url'), signature].join('.');
      expect(reEncoded).not.toBe(companyA.token);

      expectGeneric401(await callWithToken(reEncoded, 'get', '/products'));
    });
  });

  // Negativos extras: assinatura ausente / `alg: none` / header adulterado → 401.
  describe('unsigned or header-tampered tokens', () => {
    it('shouldRejectTokenWithSignatureStripped', async () => {
      expectGeneric401(await callWithToken(stripJwtSignature(companyA.token), 'get', '/products'));
    });

    it('shouldRejectUnsignedAlgNoneToken', async () => {
      const unsigned = buildUnsignedJwt(adminClaimsForA());

      expectGeneric401(await callWithToken(unsigned, 'get', '/products'));
    });

    it('shouldRejectTokenWithAlgSwitchedToNoneKeepingTheSignature', async () => {
      const tampered = tamperJwtHeader(companyA.token, { alg: 'none' });

      expectGeneric401(await callWithToken(tampered, 'get', '/products'));
    });

    it('shouldRejectTokenWithAlgSwitchedToAnotherHmacVariant', async () => {
      // Assinatura HS256 apresentada como HS512: a verificação com o algoritmo declarado falha.
      const tampered = tamperJwtHeader(companyA.token, { alg: 'HS512' });

      expectGeneric401(await callWithToken(tampered, 'get', '/products'));
    });

    it('shouldRejectBearerWithOnlyTwoSegments', async () => {
      const [header, payload] = companyA.token.split('.');

      expectGeneric401(await callWithToken(`${header}.${payload}`, 'get', '/products'));
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
