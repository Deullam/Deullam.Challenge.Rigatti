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

    try {
      // 2. Chamamos o Cérebro da IA (retorna um ReadableStream de textos)
      const stream = await this.chatUseCase.execute(messages);
      const reader = stream.getReader();

      // 3. Lemos os pedaços da resposta um a um
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Quando terminar, enviamos o sinal de [DONE] que o seu frontend espera
          res.write('data: [DONE]\n\n');
          break;
        }

        // 4. Empacotamos o texto no formato OpenAI para não quebrar o seu React
        const payload = {
          choices: [
            {
              delta: { content: value }
            }
          ]
        };
        res.write(`data: ${JSON.stringify(payload)}\n\n`);
      }
    } catch (error) {
      console.error('Erro no streaming de chat:', error);
      // Se houver erro, fecha o fluxo adequadamente
      res.write('data: [DONE]\n\n');
    } finally {
      res.end();
    }
  }
}