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

  it('should stream data in OpenAI SSE format and end with [DONE]', async () => {
    const mockReader = {
      read: jest.fn()
        .mockResolvedValueOnce({ done: false, value: 'Teste' })
        .mockResolvedValueOnce({ done: true }),
    };

    const mockStream = {
      getReader: () => mockReader,
    };

    mockChatUseCase.execute.mockResolvedValue(mockStream);

    const mockRes = {
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    };

    await controller.chat([{ role: 'user', content: 'Oi' }], mockRes as any);

    expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/event-stream');

    const expectedPayload = JSON.stringify({ choices: [{ delta: { content: 'Teste' } }] });
    expect(mockRes.write).toHaveBeenCalledWith(`data: ${expectedPayload}\n\n`);

    expect(mockRes.write).toHaveBeenCalledWith('data: [DONE]\n\n');
    expect(mockRes.end).toHaveBeenCalled();
  });
});