import { describe, it, expect, beforeAll } from 'vitest';
import { NestChatRepository } from '../../infrastructure/chat/EdgeFunctionChatRepository';
import { ChatUseCases } from './ChatUseCases';

// Import local para fazer o login no backend
const BASE_URL = 'http://localhost:3001';

describe('ChatIntegration (Frontend -> Backend)', () => {
  let token = '';

  beforeAll(async () => {
    // 1. Obter um token real de login com TechCorp
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@techcorp.com',
        password: 'Demo1234!'
      })
    });

    if (!loginRes.ok) {
      throw new Error(`Failed to login for test. Status: ${loginRes.status}`);
    }

    const data = await loginRes.json();
    token = data.access_token || data.token;
  });

  it('deve conseguir enviar uma mensagem para a API e receber os chunks textuais listando produtos', async () => {
    // 2. Instancia o Repository e o UseCase originais da nossa arquitetura React
    const repository = new NestChatRepository(BASE_URL);
    const useCase = new ChatUseCases(repository);

    let fullText = '';
    let callCount = 0;

    // 3. Roda a chamada multi-step usando a função onToken exata do Frontend React
    await useCase.sendMessage({
      access_token: token,
      history: [{ role: 'user', content: 'Liste todos os produtos disponíveis no catálogo da empresa' }],
      onToken: (chunkText) => {
        callCount++;
        fullText += chunkText;
      }
    });

    // 4. Verificamos se o Vercel AI no backend empacotou o SSE com sucesso e se o UseCase filtrou tudo
    expect(callCount).toBeGreaterThan(0);
    expect(fullText.length).toBeGreaterThan(50);
    
    // Verificamos que o Gemini listou os produtos da TechCorp no markdown gerado
    expect(fullText.toLowerCase()).toContain('quantum laptop');
    expect(fullText.toLowerCase()).toContain('monitor');
    
    console.log(`[Vitest] Mensagem recebida da IA (Total: ${fullText.length} caracteres):`);
    console.log(fullText);
  }, 60000); // Timeout elevado de 60s porque o Gemini pode demorar pra responder
});
