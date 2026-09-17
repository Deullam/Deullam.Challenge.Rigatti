/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Tabela das rotas atrás do JwtAuthGuard exercitadas pelos testes negativos de
 * autenticação (RG-09 JWT forjado/adulterado, RG-10 JWT expirado). É uma tabela de OBJETOS, e
 * não de tuplas, de propósito: com tuplas de tamanhos diferentes o jest-each compara
 * `params.length < fn.length` e injeta o `done` no lugar do parâmetro ausente (`body === done`),
 * o que fazia o supertest chamar `req.send(done)` e o teste estourar o timeout.
 */

/** Uma rota protegida a ser disparada com um token hostil. */
export type ProtectedRoute = {
  /** Rótulo legível usado no nome do teste (`$label`). */
  label: string;
  /** Verbo HTTP suportado pelo helper `callWithToken` dos specs. */
  method: 'get' | 'post';
  /** Caminho da rota (sem prefixo). */
  path: string;
  /** Corpo válido para a rota (ausente em GET). */
  body?: object;
};

/** Corpo válido de criação de produto (usado para provar ausência de efeito colateral). */
export const VALID_PRODUCT_BODY = {
  name: 'Produto Intruso',
  description: 'desc',
  price: 10,
  category: 'x',
};

/** Corpo válido da rota de chat (uma mensagem de usuário). */
export const VALID_CHAT_BODY = {
  messages: [{ role: 'user', content: 'Liste os produtos' }],
};

/**
 * Rotas protegidas exercitadas com cada token hostil. Uso:
 * `it.each(PROTECTED_ROUTES)('shouldReject401On $label', async ({ method, path, body }) => …)`.
 */
export const PROTECTED_ROUTES: ProtectedRoute[] = [
  { label: 'GET /products', method: 'get', path: '/products' },
  { label: 'POST /products', method: 'post', path: '/products', body: VALID_PRODUCT_BODY },
  { label: 'POST /chat', method: 'post', path: '/chat', body: VALID_CHAT_BODY },
];

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste
 * ficheiro é estritamente proibida sem autorização prévia.
 */
