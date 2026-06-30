/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E do fluxo de autenticação (registro, login, validação e conflitos).
 */

import * as request from 'supertest';
import { createE2EApp, E2EContext } from '../Helpers/createE2EApp';

jest.setTimeout(60000);

describe('Auth (E2E)', () => {
  let ctx: E2EContext;
  let server: any;

  beforeAll(async () => {
    ctx = await createE2EApp();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.clearDatabase();
  });

  const validUser = () => ({
    email: 'admin@techcorp.com',
    password: 'secret123',
    companyName: 'TechCorp',
  });

  describe('POST /auth/register', () => {
    it('registers a new admin and returns a JWT + user payload', async () => {
      const res = await request(server).post('/auth/register').send(validUser()).expect(201);

      expect(res.body.access_token).toEqual(expect.any(String));
      expect(res.body.user).toEqual(
        expect.objectContaining({
          email: 'admin@techcorp.com',
          role: 'admin',
          companyName: 'TechCorp',
          companyId: expect.any(String),
          id: expect.any(String),
        }),
      );
      // O password NUNCA deve voltar na resposta.
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.user.passwordHash).toBeUndefined();
    });

    it('honors an explicit "user" role', async () => {
      const res = await request(server)
        .post('/auth/register')
        .send({ ...validUser(), email: 'reader@techcorp.com', role: 'user' })
        .expect(201);

      expect(res.body.user.role).toBe('user');
    });

    it('rejects a duplicate email (ConflictException surfaced as 500 by the controller)', async () => {
      await request(server).post('/auth/register').send(validUser()).expect(201);

      // NOTE: AuthController envolve QUALQUER erro num HttpException 500, então o
      // ConflictException (409) vira 500. Ver findings ao final da tarefa.
      const res = await request(server).post('/auth/register').send(validUser()).expect(500);
      expect(res.body.message).toContain('Email already in use');
    });

    it.each([
      ['invalid email', { ...{ password: 'secret123', companyName: 'X' }, email: 'not-an-email' }],
      ['short password', { email: 'a@b.com', password: '123', companyName: 'X' }],
      ['missing companyName', { email: 'a@b.com', password: 'secret123' }],
      ['unknown extra field', { ...{ email: 'a@b.com', password: 'secret123', companyName: 'X' }, hacker: true }],
    ])('returns 400 for %s', async (_label, body) => {
      await request(server).post('/auth/register').send(body).expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(server).post('/auth/register').send(validUser()).expect(201);
    });

    it('logs in with valid credentials and returns a token bound to the same company', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'admin@techcorp.com', password: 'secret123' })
        .expect(201);

      expect(res.body.access_token).toEqual(expect.any(String));
      expect(res.body.user.email).toBe('admin@techcorp.com');
      expect(res.body.user.companyName).toBe('TechCorp');
    });

    it('is case-insensitive on the email', async () => {
      await request(server)
        .post('/auth/login')
        .send({ email: 'ADMIN@TECHCORP.COM', password: 'secret123' })
        .expect(201);
    });

    it('rejects a wrong password (UnauthorizedException surfaced as 500)', async () => {
      const res = await request(server)
        .post('/auth/login')
        .send({ email: 'admin@techcorp.com', password: 'wrong-pass' })
        .expect(500);
      expect(res.body.message).toContain('Invalid credentials');
    });

    it('rejects an unknown email (500)', async () => {
      await request(server)
        .post('/auth/login')
        .send({ email: 'ghost@nowhere.com', password: 'secret123' })
        .expect(500);
    });

    it('returns 400 when the body fails DTO validation', async () => {
      await request(server).post('/auth/login').send({ email: 'bad', password: '1' }).expect(400);
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
