/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Testes E2E da jornada RG-07 — resiliência do POST /chat a falhas antes e durante o
 * LLM: sem GEMINI_API_KEY no processo, corpo sem `messages` válido (ausente / não-array / não-JSON)
 * e stream que quebra no meio. Em todos os casos a resposta tem de continuar sendo um SSE bem
 * formado (frames `data: {json}` no formato OpenAI) terminando em `data: [DONE]`, com a mensagem
 * de erro em português no delta.content — nunca um 500 cru nem uma conexão que fica pendurada.
 * O LLM (Vercel AI SDK + Google) é mockado; o AppModule real sobe contra MongoDB em memória.
 */

import * as request from 'supertest';
import { streamText } from 'ai';
import { createE2EApp, E2EContext } from '../Helpers/createE2EApp';
import { parseSse, ParsedSse } from '../Helpers/sse';

jest.setTimeout(60000);

// Mock do AI SDK: `streamText` é um jest.fn cuja implementação cada teste define (stream saudável,
// stream que quebra no meio, chunk de erro). `tool` devolve a config crua para o use case não quebrar.
jest.mock('ai', () => ({
  tool: jest.fn((cfg) => cfg),
  stepCountIs: jest.fn((n) => n),
  streamText: jest.fn(),
}));

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn(() => () => 'mocked-model'),
}));

/** Referência tipada ao mock de streamText para trocar a implementação por teste. */
const streamTextMock = streamText as unknown as jest.Mock;

/** Chave sintética: o use case só verifica presença, o SDK está mockado. */
const FAKE_GEMINI_KEY = 'test-gemini-key'; // gitleaks:allow

/** Sessão autenticada: token emitido pelo backend + empresa dona. */
type Session = { token: string; companyId: string };

/** Corpo válido para o chat (o caminho feliz). */
const VALID_BODY = { messages: [{ role: 'user', content: 'Liste os produtos' }] };

/** Stream saudável: um único delta de texto. */
const healthyStream = (text = 'Tudo certo.') => ({
  fullStream: (async function* () {
    yield { type: 'text-delta', text };
  })(),
});

/** Stream que emite um delta parcial e depois lança — simula queda do provedor no meio da resposta. */
const streamThatBreaksMidway = (partial: string, failure: Error) => ({
  fullStream: (async function* () {
    yield { type: 'text-delta', text: partial };
    throw failure;
  })(),
});

/** Stream que só emite um chunk `error` (o SDK engole erros e os reporta assim). */
const streamWithErrorChunk = () => ({
  fullStream: (async function* () {
    yield { type: 'error', error: new Error('provider unavailable') };
  })(),
});

// Rastreio: jornada RG-07 do plano do PO (chat resiliente a falha do LLM e a corpo inválido).
describe('RG-07 — POST /chat resilience: SSE always well formed and terminated (E2E)', () => {
  let ctx: E2EContext;
  let server: any;
  let session: Session;

  /** Registra um admin (empresa nova) e devolve token + companyId reais. */
  const register = async (email: string, companyName: string): Promise<Session> => {
    const res = await request(server)
      .post('/auth/register')
      .send({ email, password: 'secret123', companyName, role: 'admin' }) // gitleaks:allow
      .expect(201);
    return { token: res.body.access_token, companyId: res.body.user.companyId };
  };

  /** POST /chat autenticado com o corpo informado (qualquer forma, inclusive inválida). */
  const postChat = (body: unknown) =>
    request(server)
      .post('/chat')
      .set('Authorization', `Bearer ${session.token}`)
      .send(body as object);

  /**
   * Asserções comuns a TODA resposta do chat: nunca 5xx, cabeçalhos de SSE, todos os frames
   * `data: ` no formato OpenAI e exatamente um `[DONE]` como último frame.
   */
  const expectWellFormedSse = (res: request.Response): ParsedSse => {
    expect(res.status).toBeLessThan(500);
    // O ChatController usa @Res() em um @Post(), logo o Express responde 201 por padrão.
    expect(res.status).toBe(201);
    expect(res.headers['content-type']).toMatch(/^text\/event-stream/);
    expect(res.headers['cache-control']).toBe('no-cache');

    const parsed = parseSse(res.text);
    expect(parsed.frames.length).toBeGreaterThan(0);
    expect(parsed.doneCount).toBe(1);
    expect(parsed.endsWithDone).toBe(true);
    return parsed;
  };

  beforeAll(async () => {
    process.env.GEMINI_API_KEY = FAKE_GEMINI_KEY;
    ctx = await createE2EApp();
    server = ctx.app.getHttpServer();
  });

  afterAll(async () => {
    await ctx.close();
  });

  beforeEach(async () => {
    await ctx.clearDatabase();
    // Estado limpo por teste: chave presente e stream saudável por padrão.
    process.env.GEMINI_API_KEY = FAKE_GEMINI_KEY;
    streamTextMock.mockReset();
    streamTextMock.mockImplementation(() => healthyStream());
    session = await register('owner@resilience-test.com', 'ResilienceCorp');
  });

  afterEach(() => {
    process.env.GEMINI_API_KEY = FAKE_GEMINI_KEY;
  });

  // Controle: com chave e corpo válidos o harness produz o SSE normal (prova que os casos de erro
  // abaixo falham pelo motivo certo e não por defeito do mock).
  describe('control', () => {
    it('shouldStreamHealthyResponseWhenKeyAndBodyAreValid', async () => {
      const res = await postChat(VALID_BODY);

      const sse = expectWellFormedSse(res);
      expect(sse.deltas).toEqual(['Tudo certo.']);
      expect(streamTextMock).toHaveBeenCalledTimes(1);
    });
  });

  // Negativo do PO: sem GEMINI_API_KEY → SSE bem formado, erro amigável em pt-BR, [DONE], sem 500.
  describe('missing GEMINI_API_KEY', () => {
    it('shouldEmitFriendlyPortugueseErrorDeltaAndDoneWithoutCallingTheLlm', async () => {
      delete process.env.GEMINI_API_KEY;

      const res = await postChat(VALID_BODY);

      const sse = expectWellFormedSse(res);
      expect(sse.deltas).toHaveLength(1);
      expect(sse.text).toContain('**Erro no Servidor:**');
      expect(sse.text).toContain('GEMINI_API_KEY');
      expect(sse.text).toContain('não está configurada no servidor');
      // A falha é detectada ANTES de tentar o provedor: nenhuma chamada ao SDK.
      expect(streamTextMock).not.toHaveBeenCalled();
    });

    it('shouldTreatEmptyStringKeyAsMissing', async () => {
      process.env.GEMINI_API_KEY = '';

      const res = await postChat(VALID_BODY);

      const sse = expectWellFormedSse(res);
      expect(sse.text).toContain('GEMINI_API_KEY');
      expect(streamTextMock).not.toHaveBeenCalled();
    });

    it('shouldRecoverOnTheNextRequestOnceTheKeyIsBack', async () => {
      delete process.env.GEMINI_API_KEY;
      await postChat(VALID_BODY).expect(201);

      process.env.GEMINI_API_KEY = FAKE_GEMINI_KEY;
      const res = await postChat(VALID_BODY);

      const sse = expectWellFormedSse(res);
      expect(sse.deltas).toEqual(['Tudo certo.']);
      expect(streamTextMock).toHaveBeenCalledTimes(1);
    });
  });

  // Negativo do PO: body sem `messages` válido → mesmo padrão, erro surfaced como conteúdo SSE.
  describe('body without a valid messages array', () => {
    it.each([
      ['empty object', {}],
      ['messages is a string', { messages: 'Liste os produtos' }],
      ['messages is null', { messages: null }],
      ['messages is a number', { messages: 42 }],
      ['messages is an object', { messages: { role: 'user', content: 'oi' } }],
      ['messages is a boolean', { messages: true }],
    ])('shouldEmitValidationErrorAsSseFor %s', async (_label, body) => {
      const res = await postChat(body);

      const sse = expectWellFormedSse(res);
      expect(sse.deltas).toHaveLength(1);
      expect(sse.text).toContain('**Erro no Servidor:**');
      expect(sse.text).toContain('lista (array)');
      expect(streamTextMock).not.toHaveBeenCalled();
    });

    it('shouldEmitValidationErrorAsSseForNonJsonBody', async () => {
      const res = await request(server)
        .post('/chat')
        .set('Authorization', `Bearer ${session.token}`)
        .set('Content-Type', 'text/plain')
        .send('Liste os produtos');

      const sse = expectWellFormedSse(res);
      expect(sse.text).toContain('lista (array)');
      expect(streamTextMock).not.toHaveBeenCalled();
    });

    it('shouldAcceptAnEmptyMessagesArrayWithoutBreakingTheStream', async () => {
      // Array vazio É uma lista válida: chega ao LLM (mockado) e o stream termina normalmente.
      const res = await postChat({ messages: [] });

      const sse = expectWellFormedSse(res);
      expect(sse.text).not.toContain('Erro no Servidor');
      expect(streamTextMock).toHaveBeenCalledTimes(1);
    });
  });

  // Extra RG-07: falha DURANTE o stream também não pode pendurar a conexão nem omitir o [DONE].
  describe('failure while streaming', () => {
    it('shouldFlushPartialTextThenErrorDeltaThenDoneWhenTheStreamThrowsMidway', async () => {
      streamTextMock.mockImplementation(() =>
        streamThatBreaksMidway('Encontrei: ', new Error('provedor de IA caiu')),
      );

      const res = await postChat(VALID_BODY);

      const sse = expectWellFormedSse(res);
      expect(sse.deltas).toHaveLength(2);
      expect(sse.deltas[0]).toBe('Encontrei: ');
      expect(sse.deltas[1]).toContain('**Erro no Servidor:** provedor de IA caiu');
    });

    it('shouldStillTerminateWithDoneWhenTheSdkReportsAnErrorChunk', async () => {
      streamTextMock.mockImplementation(() => streamWithErrorChunk());

      const res = await postChat(VALID_BODY);

      const sse = expectWellFormedSse(res);
      // O chunk `error` do SDK é só logado; o stream fecha limpo com o [DONE].
      expect(sse.frames).toEqual(['data: [DONE]']);
    });

    it('shouldEmitErrorDeltaAndDoneWhenStreamTextItselfThrows', async () => {
      streamTextMock.mockImplementation(() => {
        throw new Error('falha ao iniciar o modelo');
      });

      const res = await postChat(VALID_BODY);

      const sse = expectWellFormedSse(res);
      expect(sse.deltas).toHaveLength(1);
      expect(sse.text).toContain('**Erro no Servidor:** falha ao iniciar o modelo');
    });
  });

  // Negativo já coberto em Chat.e2e.spec.ts (sem token → 401): repetido aqui como guarda de que o
  // caminho de erro do controller NÃO se aplica antes do JwtAuthGuard (resposta JSON, não SSE).
  describe('authentication precedes the SSE path', () => {
    it('shouldReturnJson401NotSseWhenUnauthenticated', async () => {
      const res = await request(server).post('/chat').send(VALID_BODY).expect(401);

      expect(res.headers['content-type']).toMatch(/^application\/json/);
      expect(res.body.statusCode).toBe(401);
      expect(streamTextMock).not.toHaveBeenCalled();
    });
  });
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
