import { Test, TestingModule } from '@nestjs/testing';

// Ajuste dos caminhos apontando para a pasta src na raiz
import { ChatController } from '../../../../src/Presentation/Http/Chat/ChatController';
import { ChatUseCase } from '../../../../src/Application/Chat/UseCases/ChatUseCase';

describe('ChatController', () => {
  let controller: ChatController;
  let mockChatUseCase: any;

  beforeEach(async () => {
    mockChatUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatUseCase, useValue: mockChatUseCase },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should stream text-delta chunks (using chunk.text) in OpenAI SSE format and end with [DONE]', async () => {
    // Na ai@6.0.174, o fullStream emite chunks com { type: 'text-delta', text: '...' }
    const mockResult = {
      fullStream: (async function* () {
        yield { type: 'text-delta', text: 'Olá' };
        yield { type: 'text-delta', text: ', como posso ajudar?' };
      })(),
    };

    mockChatUseCase.execute.mockResolvedValue(mockResult);

    const mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    await controller.chat([{ role: 'user', content: 'Oi' }], mockRes as any);

    // Verifica os headers SSE
    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
    expect(mockRes.setHeader).toHaveBeenCalledWith('Connection', 'keep-alive');
    expect(mockRes.setHeader).toHaveBeenCalledWith('X-Accel-Buffering', 'no');

    // Verifica que os dois chunks de texto foram enviados
    const payload1 = JSON.stringify({ choices: [{ delta: { content: 'Olá' } }] });
    const payload2 = JSON.stringify({ choices: [{ delta: { content: ', como posso ajudar?' } }] });
    expect(mockRes.write).toHaveBeenCalledWith(`data: ${payload1}\n\n`);
    expect(mockRes.write).toHaveBeenCalledWith(`data: ${payload2}\n\n`);

    // Verifica que terminou com [DONE]
    expect(mockRes.write).toHaveBeenCalledWith('data: [DONE]\n\n');
    expect(mockRes.end).toHaveBeenCalled();
  });

  it('should ignore tool-call and tool-result chunks and only send text-delta to frontend', async () => {
    // Simula um fluxo com tool-call + tool-result + text-delta (cenário real do chat com MongoDB)
    const mockResult = {
      fullStream: (async function* () {
        yield { type: 'tool-call', toolCallId: '1', toolName: 'search_company_products', args: { query: '' } };
        yield { type: 'tool-result', toolCallId: '1', result: [{ nome: 'Mouse', preco: 29.9 }] };
        yield { type: 'text-delta', text: 'Encontrei 1 produto!' };
      })(),
    };

    mockChatUseCase.execute.mockResolvedValue(mockResult);

    const mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    await controller.chat([{ role: 'user', content: 'Liste os produtos' }], mockRes as any);

    // Só deve ter enviado 2 writes: o text-delta e o [DONE]
    const textPayload = JSON.stringify({ choices: [{ delta: { content: 'Encontrei 1 produto!' } }] });
    expect(mockRes.write).toHaveBeenCalledWith(`data: ${textPayload}\n\n`);
    expect(mockRes.write).toHaveBeenCalledWith('data: [DONE]\n\n');

    // Não deve ter enviado nenhum tool-call ou tool-result para o frontend
    expect(mockRes.write).toHaveBeenCalledTimes(2);
    expect(mockRes.end).toHaveBeenCalled();
  });

  it('should send error payload and [DONE] when ChatUseCase throws', async () => {
    mockChatUseCase.execute.mockRejectedValue(new Error('Chave API inválida'));

    const mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    await controller.chat([{ role: 'user', content: 'Oi' }], mockRes as any);

    // Verifica que o erro foi enviado como payload SSE
    const errorPayload = JSON.stringify({
      choices: [{ delta: { content: '\n\n**Erro no Servidor:** Chave API inválida' } }]
    });
    expect(mockRes.write).toHaveBeenCalledWith(`data: ${errorPayload}\n\n`);
    expect(mockRes.write).toHaveBeenCalledWith('data: [DONE]\n\n');
    expect(mockRes.end).toHaveBeenCalled();
  });
});