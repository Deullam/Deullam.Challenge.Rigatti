import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ChatUseCase } from '../../../../src/Application/Chat/UseCases/ChatUseCase';
import { TOKENS } from '../../../../src/Shared/IoC/tokens';
import { TenantContext } from '../../../../src/Infrastructure/Tenancy/TenantContext';

jest.mock('ai', () => ({
  streamText: jest.fn().mockReturnValue({
    textStream: 'mocked-stream',
  }),
  tool: jest.fn((config) => config),
}));

jest.mock('@ai-sdk/google', () => ({
  createGoogleGenerativeAI: jest.fn().mockReturnValue(() => 'mocked-model'),
}));

describe('ChatUseCase', () => {
  let useCase: ChatUseCase;
  let mockProductRepository: any;
  let mockTenantContext: any;

  const originalEnv = process.env;

  beforeEach(async () => {
    process.env = { ...originalEnv, GEMINI_API_KEY: 'test-key' };

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

  it('should call streamText with formatted messages and correct tools', async () => {
    const rawMessages = [{ role: 'user', content: 'Quero um notebook' }];

    const result = await useCase.execute(rawMessages);

    expect(result).toBe('mocked-stream');
    expect(mockTenantContext.get).toHaveBeenCalledTimes(1);

    const streamTextMock = require('ai').streamText;
    const callOptions = streamTextMock.mock.calls[0][0];

    expect(callOptions.messages).toEqual(rawMessages);
    expect(callOptions.maxSteps).toBe(5);
    expect(callOptions.tools).toHaveProperty('search_company_products');
  });

  it('should filter products by price in memory correctly within the tool execution', async () => {
    mockProductRepository.searchInCompany.mockImplementation(async () => [
      { name: 'Mouse', description: 'desc', price: 20, category: 'A' },
      { name: 'Teclado', description: 'desc', price: 60, category: 'A' },
      { name: 'Monitor', description: 'desc', price: 150, category: 'A' },
    ]);

    await useCase.execute([]);

    const streamTextMock = require('ai').streamText;
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