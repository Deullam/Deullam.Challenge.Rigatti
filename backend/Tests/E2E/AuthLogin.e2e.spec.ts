/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E da jornada RG-02 — login com e-mail/senha: não-enumeração de usuários
 * (e-mail inexistente e senha errada devolvem exatamente o mesmo status e corpo), comparação de
 * e-mail case-insensitive e rejeição (400) de corpo fora do DTO. Sobe o AppModule real contra
 * MongoDB em memória via Tests/Helpers/createE2EApp.ts.
 */

import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../Helpers/createE2EApp';

jest.setTimeout(60000);

/** Credenciais sintéticas do usuário semeado em cada teste (não existem em nenhum ambiente real). */
const SEEDED_EMAIL = 'owner@rigatti-test.com';
const SEEDED_PASSWORD = 'correct-horse-9'; // gitleaks:allow
const SEEDED_COMPANY = 'Rigatti Test Co';

/** Mensagem genérica que o login DEVE devolver para qualquer falha de credencial. */
const GENERIC_CREDENTIALS_MESSAGE = 'Invalid credentials.';

// Rastreio: jornada RG-02 do plano do PO (login com e-mail/senha e não-enumeração de usuários).
describe('RG-02 — POST /auth/login (E2E)', () => {
  let ctx: E2EContext;
  let server: any;
  /** Payload devolvido pelo registro do usuário semeado; base de comparação para o login. */
  let registeredUser: { id: string; companyId: string; companyName: string; role: string; email: string };

  /**
   * Envia um POST /auth/login com o corpo informado (qualquer forma, inclusive inválida)
   * e devolve a resposta crua para asserção de status e corpo.
   */
  const login = (body: unknown) => request(server).post('/auth/login').send(body as object);

  /**
   * Corpo de login válido para o usuário semeado; sobrescrevas via `overrides`
   * (ex.: e-mail em caixa alta, senha errada) para montar cada cenário.
   */
  const credentials = (overrides: Record<string, unknown> = {}) => ({
    email: SEEDED_EMAIL,
    password: SEEDED_PASSWORD,
    ...overrides,
  });

  beforeAll(async () => {
    ctx = await createE2EApp();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  // Seed idempotente: banco limpo + um único usuário admin por teste.
  beforeEach(async () => {
    await ctx.clearDatabase();
    const res = await request(server)
      .post('/auth/register')
      .send({ email: SEEDED_EMAIL, password: SEEDED_PASSWORD, companyName: SEEDED_COMPANY })
      .expect(201);
    registeredUser = res.body.user;
  });

  // AC1: credenciais corretas → 201 com access_token e user.companyName/role corretos.
  describe('valid credentials', () => {
    it('shouldReturn201WithTokenAndUserBoundToRegisteredCompany', async () => {
      const res = await login(credentials()).expect(201);

      expect(res.body.access_token).toEqual(expect.any(String));
      expect(res.body.access_token.split('.')).toHaveLength(3); // formato JWT (header.payload.signature)
      expect(res.body.user).toStrictEqual({
        id: registeredUser.id,
        email: SEEDED_EMAIL,
        role: 'admin',
        companyId: registeredUser.companyId,
        companyName: SEEDED_COMPANY,
      });
    });

    it('shouldIssueTokenAcceptedByProtectedRoute', async () => {
      const { body } = await login(credentials()).expect(201);

      // Efeito observável: o token emitido pelo login abre uma rota protegida do mesmo tenant.
      const products = await request(server)
        .get('/products')
        .set('Authorization', `Bearer ${body.access_token}`)
        .expect(200);
      expect(products.body).toEqual([]);
    });
  });

  // AC2: mesmo e-mail em CAIXA ALTA → login funciona igual (comparação case-insensitive).
  describe('email case-insensitivity', () => {
    it('shouldLoginWithUpperCaseEmailAsTheSameUser', async () => {
      const lower = await login(credentials()).expect(201);
      const upper = await login(credentials({ email: SEEDED_EMAIL.toUpperCase() })).expect(201);

      expect(upper.body.access_token).toEqual(expect.any(String));
      // Mesmo usuário, mesma empresa, mesmo papel; e-mail devolvido sempre normalizado em minúsculas.
      expect(upper.body.user).toStrictEqual(lower.body.user);
      expect(upper.body.user.email).toBe(SEEDED_EMAIL);
    });

    it('shouldLoginWithMixedCaseEmail', async () => {
      const mixed = 'Owner@Rigatti-Test.COM';
      const res = await login(credentials({ email: mixed })).expect(201);
      expect(res.body.user.id).toBe(registeredUser.id);
    });
  });

  // AC3 + casos negativos: e-mail inexistente OU senha incorreta → mesmo status (401) e mesma
  // mensagem genérica, para que um atacante não descubra quais e-mails existem na base.
  describe('non-enumeration of users', () => {
    it('shouldRejectWrongPasswordWith401AndGenericMessage', async () => {
      const res = await login(credentials({ password: 'wrong-password-1' })).expect(401);

      expect(res.body.message).toBe(GENERIC_CREDENTIALS_MESSAGE);
      expect(res.body.access_token).toBeUndefined();
      expect(res.body.user).toBeUndefined();
    });

    it('shouldRejectUnknownEmailWith401AndGenericMessage', async () => {
      const res = await login(credentials({ email: 'ghost@rigatti-test.com' })).expect(401);

      expect(res.body.message).toBe(GENERIC_CREDENTIALS_MESSAGE);
      expect(res.body.access_token).toBeUndefined();
      expect(res.body.user).toBeUndefined();
    });

    it('shouldReturnIdenticalStatusAndBodyForUnknownEmailAndWrongPassword', async () => {
      const unknownEmail = await login(credentials({ email: 'ghost@rigatti-test.com' }));
      const wrongPassword = await login(credentials({ password: 'wrong-password-1' }));

      expect(unknownEmail.status).toBe(401);
      expect(wrongPassword.status).toBe(401);
      // Corpo byte-a-byte igual: nenhum campo (message, error, statusCode) pode diferir entre os casos.
      expect(unknownEmail.body).toStrictEqual(wrongPassword.body);
      expect(unknownEmail.headers['content-type']).toBe(wrongPassword.headers['content-type']);
    });

    it('shouldNotLeakExistenceThroughUpperCaseEmailWithWrongPassword', async () => {
      const unknownEmail = await login(credentials({ email: 'GHOST@RIGATTI-TEST.COM' }));
      const existingUpperWrongPassword = await login(
        credentials({ email: SEEDED_EMAIL.toUpperCase(), password: 'wrong-password-1' }),
      );

      expect(existingUpperWrongPassword.status).toBe(401);
      expect(existingUpperWrongPassword.body).toStrictEqual(unknownEmail.body);
    });

    it('shouldReturnIdenticalValidationErrorRegardlessOfEmailExistence', async () => {
      // Senha curta demais falha no DTO antes de tocar o banco — o 400 não pode variar
      // conforme o e-mail exista ou não (outro canal possível de enumeração).
      const existing = await login(credentials({ password: '123' }));
      const unknown = await login({ email: 'ghost@rigatti-test.com', password: '123' });

      expect(existing.status).toBe(400);
      expect(unknown.status).toBe(400);
      expect(existing.body).toStrictEqual(unknown.body);
    });
  });

  // Caso negativo: corpo fora do DTO (email/password inválidos ou campos extras) → 400.
  describe('body outside the DTO', () => {
    it.each([
      ['empty body', {}],
      ['missing password', { email: SEEDED_EMAIL }],
      ['missing email', { password: SEEDED_PASSWORD }],
      ['malformed email', { email: 'not-an-email', password: SEEDED_PASSWORD }],
      ['numeric email', { email: 12345, password: SEEDED_PASSWORD }],
      ['password shorter than 6 chars', { email: SEEDED_EMAIL, password: '12345' }],
      ['numeric password', { email: SEEDED_EMAIL, password: 123456 }],
      ['null fields', { email: null, password: null }],
    ])('shouldReturn400For %s', async (_label, body) => {
      const res = await login(body).expect(400);

      expect(res.body.statusCode).toBe(400);
      expect(res.body.error).toBe('Bad Request');
      expect(Array.isArray(res.body.message)).toBe(true);
      expect(res.body.message.length).toBeGreaterThan(0);
      expect(res.body.access_token).toBeUndefined();
    });

    it('shouldReturn400ForUnknownExtraFieldEvenWithValidCredentials', async () => {
      // forbidNonWhitelisted: campo fora do DTO derruba a requisição mesmo com credenciais corretas.
      const res = await login(credentials({ role: 'admin' })).expect(400);

      expect(res.body.message).toEqual(expect.arrayContaining(['property role should not exist']));
      expect(res.body.access_token).toBeUndefined();
    });

    it('shouldReturn400ForNonObjectJsonBody', async () => {
      await request(server)
        .post('/auth/login')
        .set('Content-Type', 'application/json')
        .send('"just-a-string"')
        .expect(400);
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
