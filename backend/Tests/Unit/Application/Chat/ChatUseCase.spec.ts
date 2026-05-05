import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ChatUseCase } from '../../../../src/Application/Chat/UseCases/ChatUseCase';
import { TOKENS } from '../../../../src/Shared/IoC/tokens';
import { TenantContext } from '../../../../src/Infrastructure/Tenancy/TenantContext';

jest.mock('ai', () => ({
  streamText: jest.fn(),
  tool: jest.fn((config) => config),
  stepCountIs: jest.fn((n) => `stepCountIs(${n})`),
}));

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn().mockReturnValue(() => 'mocked-model'),
}));

describe('ChatUseCase', () => {
  let useCase: ChatUseCase;
  let mockProductRepository: any;
  let mockTenantContext: any;
  let streamTextMock: jest.Mock;

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };

    // Importa e limpa o mock ANTES de cada teste
    streamTextMock = require('ai').streamText as jest.Mock;
    streamTextMock.mockReset();
    streamTextMock.mockReturnValue({
      textStream: 'mocked-text-stream',
      fullStream: (async function* () {
        yield { type: 'text-delta', text: 'mocked' };
      })(),
    });

    mockProductRepository = {
      searchInCompany: jest.fn(),
    };

    mockTenantContext = {
      get: jest.fn().mockReturnValue({ companyId: 'tenant-123' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatUseCase,
        { provide: TOKENS.IProductRepository, useValue: mockProductRepository },
        { provide: TenantContext, useValue: mockTenantContext },
      ],
    }).compile();

    useCase = module.get<ChatUseCase>(ChatUseCase);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should throw an error if GEMINI_API_KEY is not set', async () => {
    delete process.env.GEMINI_API_KEY;

    await expect(useCase.execute([{ role: 'user', content: 'Oi' }]))
      .rejects
      .toThrow(InternalServerErrorException);
  });

  it('should return the full streamText result object with fullStream', async () => {
    const rawMessages = [{ role: 'user', content: 'Quero um notebook' }];

    const result = await useCase.execute(rawMessages);

    // O resultado deve conter tanto textStream quanto fullStream
    expect(result).toHaveProperty('fullStream');
    expect(result).toHaveProperty('textStream');
    expect(mockTenantContext.get).toHaveBeenCalledTimes(1);

    const callOptions = streamTextMock.mock.calls[0][0];

    // Mensagens do usuário devem ser passadas (sem role 'system')
    expect(callOptions.messages).toEqual(rawMessages);
    // Na ai@6, usa stopWhen em vez de maxSteps
    expect(callOptions.stopWhen).toBeDefined();
    expect(callOptions.tools).toHaveProperty('search_company_products');
    // O system prompt deve ser uma string separada, não dentro do array
    expect(typeof callOptions.system).toBe('string');
    expect(callOptions.system).toContain('tenant-123');
  });

  it('should filter out system messages from rawMessages', async () => {
    const rawMessages = [
      { role: 'system', content: 'System prompt do frontend' },
      { role: 'user', content: 'Olá' },
    ];

    await useCase.execute(rawMessages);

    // Pega a chamada DESTE teste (index 0, pois o mock foi resetado no beforeEach)
    const callOptions = streamTextMock.mock.calls[0][0];

    // Só deve conter a mensagem do user, não a do system
    expect(callOptions.messages).toEqual([{ role: 'user', content: 'Olá' }]);
  });

  it('should filter products by price in memory correctly within the tool execution', async () => {
    mockProductRepository.searchInCompany.mockResolvedValue([
      { name: 'Mouse', description: 'desc', price: 20, category: 'A' },
      { name: 'Teclado', description: 'desc', price: 60, category: 'A' },
      { name: 'Monitor', description: 'desc', price: 150, category: 'A' },
    ]);

    await useCase.execute([{ role: 'user', content: 'teste' }]);

    // Pega a chamada DESTE teste (index 0, pois o mock foi resetado no beforeEach)
    const callOptions = streamTextMock.mock.calls[0][0];
    const toolExecute = callOptions.tools.search_company_products.execute;

    const result = await toolExecute({ query: '', maxPrice: 50 });

    expect(mockProductRepository.searchInCompany).toHaveBeenCalledWith({
      companyId: 'tenant-123',
      query: '',
      maxResults: 50,
    });

    expect(result).toHaveLength(1);
    expect(result[0].nome).toBe('Mouse');
    expect(result[0].preco).toBe(20);
  });
});