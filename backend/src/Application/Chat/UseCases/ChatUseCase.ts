import { Injectable, Inject, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { streamText, tool, stepCountIs } from 'ai';
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
    //    IMPORTANTE: Filtra role 'system' pois o Vercel AI SDK envia o system prompt
    //    separadamente via a propriedade `system`, não dentro do array de mensagens.
    const formattedMessages = rawMessages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    // 4. Configuração principal da IA
    //    Modelo: gemma-4-31b-it — modelo Gemma válido retornado pela API do Google
    const result = streamText({
      model: googleAI('gemma-4-31b-it'),
      messages: formattedMessages,

      system: `Você é um assistente de vendas inteligente exclusivo desta empresa (companyId: ${companyId}).
      
      REGRA ABSOLUTA: Você não tem memória própria sobre os produtos. 
      Sempre que o usuário perguntar o que a loja vende, pedir para listar produtos, consultar preços, categorias ou qualquer informação sobre o catálogo, VOCÊ DEVE OBRIGATORIAMENTE acionar a ferramenta 'search_company_products'.
      
      - Para listar todo o catálogo, acione a ferramenta enviando a query como uma string vazia "".
      - Baseie a sua resposta EXCLUSIVAMENTE nos dados devolvidos pela ferramenta.
      - NUNCA invente produtos. Se a ferramenta devolver uma lista vazia, informe ao usuário que não há produtos cadastrados.
      - Responda sempre em português do Brasil.
      
      INSTRUÇÕES ESPECÍFICAS PARA COMANDOS FREQUENTES:
      1. Se o usuário perguntar "Quais produtos temos abaixo de R$ X?": Use a ferramenta passando o valor em 'maxPrice'.
      2. Se o usuário pedir "Recomende algo para um novo cliente": Busque o catálogo todo (query "") e destaque 2 ou 3 produtos variados e populares com entusiasmo.
      3. Se o usuário pedir "Liste tudo do nosso catálogo agrupado por categoria": Busque o catálogo todo (query "") e formate a resposta dividindo os produtos claramente por seções de Categoria usando Markdown (ex: ### Categoria A).`,

      // 6. Na ai@6, maxSteps foi substituído por stopWhen.
      //    O default é stepCountIs(1), que faz apenas 1 chamada LLM.
      //    Com stepCountIs(5), a IA pode: chamar tool → receber resultado → gerar texto.
      stopWhen: stepCountIs(5),

      // 7. Ferramentas: A ponte entre a IA e o teu MongoDB
      tools: {
        search_company_products: tool({
          description: 'Busca produtos reais na base de dados da empresa (MongoDB). SEMPRE use esta ferramenta quando o usuário perguntar sobre produtos, catálogo, preços ou categorias.',
          inputSchema: z.object({
            query: z.string().describe('Termo para buscar no MongoDB. Envie "" (vazio) para trazer todos os produtos.'),
            maxPrice: z.number().optional().describe('Preço máximo desejado em reais.'),
            minPrice: z.number().optional().describe('Preço mínimo desejado em reais.')
          }),
          execute: async ({ query, maxPrice, minPrice }) => {
            try {
              console.log(`[ChatUseCase] Tool chamada: query="${query}", companyId="${companyId}"`);

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

              console.log(`[ChatUseCase] Produtos encontrados: ${products.length}`);

              // Formata e simplifica a lista devolvida para a IA não se confundir
              return products.map(p => ({
                nome: p.name,
                descricao: p.description,
                preco: p.price,
                categoria: p.category
              }));

            } catch (error) {
              // Se a ligação ao MongoDB falhar, a IA recebe esta mensagem e avisa o utilizador de forma amigável
              console.error("[ChatUseCase] Erro na ferramenta de busca do MongoDB:", error);
              return [];
            }
          },
        }),
      },

      // 8. Callback de erro — o Vercel AI SDK engole erros silenciosamente por padrão.
      //    Este callback garante que qualquer erro interno apareça no terminal.
      onError: ({ error }) => {
        console.error('[ChatUseCase] Erro no streamText:', error);
      },
    });

    // 9. Retorna o objeto result inteiro para o controller iterar no fullStream.
    return result;
  }
}