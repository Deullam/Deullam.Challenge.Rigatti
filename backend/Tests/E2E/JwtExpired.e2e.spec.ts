/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E da jornada RG-10 — rejeição de JWT expirado: token corretamente
 * assinado com o JWT_SECRET do servidor mas com `exp` no passado (segundos atrás, dias atrás e o
 * TTL de produção de 7 dias já vencido) → 401 em toda rota atrás do JwtAuthGuard, sem grace
 * period e sem efeito colateral. Tokens emitidos com o JwtService do @nestjs/jwt
 * (Tests/Helpers/jwtTestTokens.ts) usando o mesmo secret do processo de teste — sem Docker, sem rede.
 */

import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../Helpers/createE2EApp';
import { nowInSeconds, signTestJwt, tamperJwtPayload, TestJwtClaims } from '../Helpers/jwtTestTokens';
import { PROTECTED_ROUTES } from '../Helpers/protectedRoutes';

jest.setTimeout(60000);

/** Sessão autenticada: token emitido pelo backend + empresa dona. */
type Session = { token: string; companyId: string };

/** Segundos em um dia. */
const ONE_DAY = 24 * 60 * 60;

/** TTL que o RootModule configura em produção (`signOptions.expiresIn: '7d'`). */
const PRODUCTION_TTL = 7 * ONE_DAY;

/** Corpo válido de criação de produto (usado para provar ausência de efeito colateral). */
const PRODUCT_BODY = { name: 'Produto Tardio', description: 'desc', price: 10, category: 'x' };

// Rastreio: jornada RG-10 do plano do PO (JWT expirado → 401, sem grace period).
describe('RG-10 — expired JWTs are rejected with 401 (E2E)', () => {
  let ctx: E2EContext;
  let server: any;
  /** Secret que o servidor de teste usa de fato (definido pelo harness antes de importar o AppModule). */
  let serverSecret: string;
  let company: Session;

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

  /** Claims de admin da empresa semeada com as marcas temporais informadas. */
  const adminClaims = (timing: { iat?: number; exp?: number }): TestJwtClaims => ({
    sub: 'expired-user-id',
    companyId: company.companyId,
    role: 'admin',
    ...timing,
  });

  /** Token assinado com o secret correto expirado há `secondsAgo` segundos. */
  const expiredToken = (secondsAgo: number) => {
    const now = nowInSeconds();
    return signTestJwt(serverSecret, adminClaims({ iat: now - secondsAgo - 60, exp: now - secondsAgo }));
  };

  /** Asserções comuns a toda rejeição: 401 JSON genérico do Nest (sem revelar o motivo). */
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
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.clearDatabase();
    company = await register('admin@expiry.test', 'ExpiryCorp');
  });

  // Controle: o mesmo secret/claims com `exp` no futuro é aceito — as rejeições abaixo acontecem
  // pela expiração, não por defeito de assinatura ou formato.
  describe('control', () => {
    it('shouldAcceptTokenThatExpiresInTheFuture', async () => {
      const now = nowInSeconds();
      const valid = signTestJwt(serverSecret, adminClaims({ iat: now, exp: now + 60 }));

      const res = await callWithToken(valid, 'get', '/products').expect(200);

      expect(res.body).toEqual([]);
    });

    it('shouldAcceptTokenIssuedByTheBackendItself', async () => {
      await callWithToken(company.token, 'get', '/products').expect(200);
    });
  });

  // AC1 + negativo "expirado há poucos segundos": 401 imediato, sem grace period.
  describe('token expired seconds ago', () => {
    it.each(PROTECTED_ROUTES)('shouldReject401On $label', async ({ method, path, body }) => {
      expectGeneric401(await callWithToken(expiredToken(30), method, path, body));
    });

    it('shouldRejectTokenExpiredJustFiveSecondsAgo', async () => {
      expectGeneric401(await callWithToken(expiredToken(5), 'get', '/products'));
    });

    it('shouldNotCreateAnythingWithExpiredAdminToken', async () => {
      await callWithToken(expiredToken(30), 'post', '/products', PRODUCT_BODY).expect(401);

      const visible = await callWithToken(company.token, 'get', '/products').expect(200);
      expect(visible.body).toEqual([]);
    });
  });

  // Negativo "expirado há muito tempo (dias)": mesmo comportamento.
  describe('token expired days ago', () => {
    it('shouldRejectTokenExpiredThirtyDaysAgo', async () => {
      expectGeneric401(await callWithToken(expiredToken(30 * ONE_DAY), 'get', '/products'));
    });

    it('shouldRejectTokenWhoseSevenDayProductionTtlHasElapsed', async () => {
      // Espelha o token de produção: emitido há 8 dias com TTL de 7 dias.
      const issuedAt = nowInSeconds() - 8 * ONE_DAY;
      const token = signTestJwt(
        serverSecret,
        adminClaims({ iat: issuedAt, exp: issuedAt + PRODUCTION_TTL }),
      );

      expectGeneric401(await callWithToken(token, 'get', '/products'));
    });

    it('shouldReturnTheSameBodyForRecentAndAncientExpiry', async () => {
      // Sem grace period e sem vazar "há quanto tempo" expirou: respostas idênticas.
      const recent = await callWithToken(expiredToken(5), 'get', '/products');
      const ancient = await callWithToken(expiredToken(365 * ONE_DAY), 'get', '/products');

      expect(recent.status).toBe(401);
      expect(ancient.status).toBe(401);
      expect(recent.body).toStrictEqual(ancient.body);
    });
  });

  // Cruzamento com RG-09: "renovar" o exp editando o payload sem re-assinar não reabilita o token.
  describe('expiry cannot be extended by editing the payload', () => {
    it('shouldRejectExpiredTokenWhoseExpWasPushedToTheFutureWithoutReSigning', async () => {
      const revived = tamperJwtPayload(expiredToken(30), { exp: nowInSeconds() + ONE_DAY });

      expectGeneric401(await callWithToken(revived, 'get', '/products'));
    });

    it('shouldRejectExpiredTokenWhoseExpClaimWasRemovedWithoutReSigning', async () => {
      const [header, payload, signature] = expiredToken(30).split('.');
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
      delete claims.exp;
      const withoutExp = [header, Buffer.from(JSON.stringify(claims)).toString('base64url'), signature].join('.');

      expectGeneric401(await callWithToken(withoutExp, 'get', '/products'));
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
