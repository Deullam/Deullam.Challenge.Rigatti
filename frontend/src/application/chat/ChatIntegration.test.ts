import { describe, it, expect, beforeAll } from 'vitest';
import { NestChatRepository } from '../../infrastructure/chat/EdgeFunctionChatRepository';
import { ChatUseCases } from './ChatUseCases';

const BASE_URL = 'http://localhost:3001';

// Função auxiliar para fazer login
async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) throw new Error(`Login falhou: ${res.status}`);
  const data = await res.json();
  return data.access_token || data.token;
}

// Função auxiliar para enviar mensagem ao chat e retornar o texto completo
async function askChat(token, text) {
  const repository = new NestChatRepository(BASE_URL);
  const useCase = new ChatUseCases(repository);
  let fullText = '';
  
  await useCase.sendMessage({
    access_token: token,
    history: [{ role: 'user', content: text }],
    onToken: (chunk) => { fullText += chunk; }
  });
  
  return fullText;
}

describe('Chat Integration E2E', () => {

  describe('TechCorp Existente', () => {
    it('deve conseguir enviar uma mensagem para a API e receber o catálogo da TechCorp', async () => {
      const token = await login('admin@techcorp.com', 'Demo1234!');
      const response = await askChat(token, 'Liste todos os produtos disponíveis no catálogo da empresa');
      
      expect(response.length).toBeGreaterThan(50);
      expect(response.toLowerCase()).toContain('quantum laptop');
      console.log(`\n[TechCorp] Catálogo recebido (${response.length} chars)`);
    }, 60000);
  });

  describe('FoodCorp Existente', () => {
    it('deve conseguir enviar uma mensagem para a API e receber o catálogo da FoodCorp', async () => {
      const token = await login('admin@foodcorp.com', 'Demo1234!');
      const response = await askChat(token, 'Liste todos os produtos disponíveis no catálogo da empresa');
      
      expect(response.length).toBeGreaterThan(50);
      expect(response.toLowerCase()).toContain('burguer'); // Assumindo que a FoodCorp venda comida
      console.log(`\n[FoodCorp] Catálogo recebido (${response.length} chars)`);
    }, 60000);
  });

  describe('Nova Empresa Criada do 0', () => {
    let newToken = '';
    const uniqueId = Date.now();
    const newEmail = `admin_${uniqueId}@newcorp.com`;

    beforeAll(async () => {
      // 1. Criar a empresa do zero
      const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newEmail,
          password: 'Password123!',
          companyName: `NewCorp ${uniqueId}`,
          role: 'admin'
        })
      });

      if (!regRes.ok) {
        const err = await regRes.text();
        throw new Error(`Falha ao registrar nova empresa: ${err}`);
      }
      const data = await regRes.json();
      newToken = data.access_token || data.token;

      // 2. Cadastrar 5 produtos
      const produtos = [
        { name: 'Cadeira Gamer', description: 'Cadeira confortável', price: 900, category: 'Móveis' },
        { name: 'Mousepad Gigante', description: 'Mousepad de tecido', price: 40, category: 'Acessórios' },
        { name: 'Headset Pro', description: 'Fone de ouvido 7.1', price: 250, category: 'Áudio' },
        { name: 'Teclado Básico', description: 'Teclado de membrana', price: 35, category: 'Acessórios' },
        { name: 'Mesa de Escritório', description: 'Mesa de madeira MDF', price: 450, category: 'Móveis' }
      ];

      for (const prod of produtos) {
        await fetch(`${BASE_URL}/products`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`
          },
          body: JSON.stringify(prod)
        });
      }
    });

    it('Verifica Listagem Padrão (GET /products)', async () => {
      const res = await fetch(`${BASE_URL}/products`, {
        headers: { 'Authorization': `Bearer ${newToken}` }
      });
      const data = await res.json();
      expect(data.length).toBe(5);
      console.log(`\n[NewCorp] ${data.length} produtos inseridos com sucesso e listados na API.`);
    });

    it('Prompt 1: Quais produtos temos abaixo de R$ 50?', async () => {
      const response = await askChat(newToken, 'Quais produtos temos abaixo de R$ 50?');
      const lowerResp = response.toLowerCase();
      
      expect(lowerResp).toContain('mousepad');
      expect(lowerResp).toContain('teclado b');
      expect(lowerResp).not.toContain('cadeira'); // 900 reais não deve vir
      console.log(`\n[NewCorp Prompt 1] Resposta Abaixo de R$50:\n${response}`);
    }, 60000);

    it('Prompt 2: Recomende algo para um novo cliente.', async () => {
      const response = await askChat(newToken, 'Recomende algo para um novo cliente.');
      
      expect(response.length).toBeGreaterThan(10);
      console.log(`\n[NewCorp Prompt 2] Recomendação:\n${response}`);
    }, 60000);

    it('Prompt 3: Liste tudo do nosso catálogo agrupado por categoria.', async () => {
      const response = await askChat(newToken, 'Liste tudo do nosso catálogo agrupado por categoria.');
      const lowerResp = response.toLowerCase();
      
      // Deve ter separado por categorias
      expect(lowerResp).toContain('móveis');
      expect(lowerResp).toContain('acessórios');
      expect(lowerResp).toContain('áudio');
      expect(lowerResp).toContain('cadeira gamer');
      console.log(`\n[NewCorp Prompt 3] Agrupado por Categoria:\n${response}`);
    }, 60000);

  });

});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
