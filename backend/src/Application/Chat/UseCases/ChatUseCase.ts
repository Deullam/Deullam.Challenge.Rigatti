import { Injectable, Inject, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { streamText, tool } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { IProductRepository } from '../../../Domain/Product/IProductRepository';
import { TenantContext } from '../../../Infrastructure/Tenancy/TenantContext';
import { TOKENS } from '../../../Shared/IoC/tokens';

@Injectable()
export class ChatUseCase {
  constructor(
    @Inject(TOKENS.IProductRepository)
    private readonly productRepository: IProductRepository,
    private readonly tenantContext: TenantContext,
  ) { }

  async execute(rawMessages: any[]) {
    // ----------------------------------------------------------------------
    // PROTEÇÃO 1: Validação da Entrada
    // Garante que o frontend enviou as mensagens corretamente. Se rawMessages 
    // for indefinido, o código para aqui com um erro claro em vez de quebrar no .map()
    // ----------------------------------------------------------------------
    if (!rawMessages || !Array.isArray(rawMessages)) {
      throw new BadRequestException('O histórico de mensagens deve ser uma lista (array) válida.');
    }

    // 1. Extrai o ID da empresa para filtrar os dados no MongoDB
    const { companyId } = this.tenantContext.get();
    if (!companyId) {
      throw new InternalServerErrorException('ID da empresa (Tenant) não encontrado no contexto.');
    }

    // 2. Valida e inicializa o modelo do Google
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('A chave GEMINI_API_KEY não está configurada no servidor.');
    }
    const googleAI = createGoogleGenerativeAI({ apiKey });

    // 3. Formata as mensagens para o padrão do Vercel AI SDK
    const formattedMessages = rawMessages.map((m) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content,
    }));

    // 4. Configuração principal da IA
    const streamOptions: any = {
      model: googleAI('gemini-3.1-flash-lite-preview'), // O teu modelo escolhido
      messages: formattedMessages,

      // 5. O "Cérebro" da IA: Instruções claras para forçar o uso do MongoDB
      system: `Você é um assistente de vendas inteligente exclusivo desta empresa.
      
      REGRA ABSOLUTA: Você não tem memória própria sobre os produtos. 
      Sempre que o usuário perguntar o que a loja vende, pedir para listar produtos, consultar preços ou categorias, VOCÊ DEVE OBRIGATORIAMENTE acionar a ferramenta 'search_company_products'.
      
      - Para listar todo o catálogo, acione a ferramenta enviando a query como uma string vazia "".
      - Baseie a sua resposta apenas nos dados devolvidos pela ferramenta.`,

      maxSteps: 5, // Permite que a IA raciocine e chame a ferramenta várias vezes se precisar

      // 6. Ferramentas: A ponte entre a IA e o teu MongoDB
      tools: {
        search_company_products: tool({
          description: 'Busca produtos reais na base de dados da empresa (MongoDB).',
          parameters: z.object({
            query: z.string().describe('Termo para buscar no MongoDB. Envie "" (vazio) para trazer todos.'),
            maxPrice: z.number().optional().describe('Preço máximo desejado em reais.'),
            minPrice: z.number().optional().describe('Preço mínimo desejado em reais.')
          }),
          execute: async ({ query, maxPrice, minPrice }: any) => {
            try {
              // Acesso real ao MongoDB usando a interface do teu repositório
              let products = await this.productRepository.searchInCompany({
                companyId,
                query: query || '',
                maxResults: 50,
              });

              // ----------------------------------------------------------------------
              // PROTEÇÃO 2: Validação da Base de Dados
              // Se o MongoDB devolver nulo, transformamos numa lista vazia.
              // Isso evita que o products.filter ou products.map lancem erros.
              // ----------------------------------------------------------------------
              if (!products) {
                products = [];
              }

              // Filtros de preço em memória
              if (maxPrice !== undefined) {
                products = products.filter(p => p.price <= maxPrice);
              }
              if (minPrice !== undefined) {
                products = products.filter(p => p.price >= minPrice);
              }

              // Formata e simplifica a lista devolvida para a IA não se confundir
              return products.map(p => ({
                nome: p.name,
                descricao: p.description,
                preco: p.price,
                categoria: p.category
              }));

            } catch (error) {
              // Se a ligação ao MongoDB falhar, a IA recebe esta mensagem e avisa o utilizador de forma amigável
              console.error("Erro na ferramenta de busca do MongoDB:", error);
              return "Ocorreu um erro interno ao tentar consultar o catálogo no banco de dados.";
            }
          },
        } as any),
      },
    };

    // 7. Inicia o fluxo (Stream) e devolve para o controlador lidar com o SSE
    const result = streamText(streamOptions);
    return result.textStream;
  }
}