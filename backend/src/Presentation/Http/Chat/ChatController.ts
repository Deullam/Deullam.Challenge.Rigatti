import { Controller, Post, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ChatUseCase } from '../../../Application/Chat/UseCases/ChatUseCase';
import { JwtAuthGuard } from '../Auth/JwtAuthGuard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatUseCase: ChatUseCase) { }

  @Post()
  async chat(@Body('messages') messages: any[], @Res() res: Response) {
    // 1. Configuramos os headers para Streaming (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Desativa buffer de proxies (como Nginx) para o stream funcionar em tempo real
    res.setHeader('X-Accel-Buffering', 'no');

    try {
      // 2. Chamamos o Cérebro da IA (retorna o objeto completo do streamText)
      const result = await this.chatUseCase.execute(messages);

      // 3. Iteramos sobre o fullStream para capturar TODOS os tipos de eventos.
      //    Na ai@6.0.174, o chunk text-delta usa a propriedade `text` (não `textDelta`).
      //    Usando fullStream em vez de textStream garantimos que o multi-step
      //    (tool-call → tool-result → geração de texto) funcione corretamente.
      for await (const chunk of result.fullStream) {
        console.log(`[ChatController] chunk.type = ${chunk.type}`);
        
        if (chunk.type === 'text-delta' && chunk.text) {
          // 4. Empacotamos o texto no formato OpenAI para o frontend React consumir
          const payload = {
            choices: [
              {
                delta: { content: chunk.text }
              }
            ]
          };
          res.write(`data: ${JSON.stringify(payload)}\n\n`);

          // Força o envio imediato se o framework/express tiver buffer ativado
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        } else if (chunk.type === 'tool-call') {
          console.log(`[ChatController] Tool call: ${(chunk as any).toolName}`, JSON.stringify((chunk as any).args || (chunk as any).input));
        } else if (chunk.type === 'tool-result') {
          console.log(`[ChatController] Tool result:`, JSON.stringify((chunk as any).result || (chunk as any).output).substring(0, 200));
        } else if (chunk.type === 'error') {
          console.error(`[ChatController] Stream error:`, (chunk as any).error || (chunk as any).errorText);
        }
      }

      // 5. Quando o stream terminar, enviamos o sinal de [DONE]
      res.write('data: [DONE]\n\n');
    } catch (error: any) {
      console.error('Erro no streaming de chat:', error);

      // Enviamos o erro real para o frontend renderizar na tela
      const errorPayload = {
        choices: [
          {
            delta: { content: `\n\n**Erro no Servidor:** ${error?.message || 'Falha ao processar a resposta da IA.'}` }
          }
        ]
      };
      res.write(`data: ${JSON.stringify(errorPayload)}\n\n`);
      res.write('data: [DONE]\n\n');
    } finally {
      res.end();
    }
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
