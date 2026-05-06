/**
 * Script de teste manual para o chat.
 * 1. Faz login no /auth/login para obter JWT
 * 2. Chama POST /chat pedindo para listar produtos
 * 3. Imprime a resposta SSE completa
 */

const http = require('http');

const BASE = 'http://localhost:3001';

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk.toString(); });
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: raw });
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function streamPost(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE);
    const data = JSON.stringify(body);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      console.log(`\n--- RESPONSE STATUS: ${res.statusCode} ---`);
      console.log(`--- CONTENT-TYPE: ${res.headers['content-type']} ---\n`);
      
      let fullBody = '';
      res.on('data', (chunk) => {
        const text = chunk.toString();
        fullBody += text;
        // Print each SSE chunk as it arrives
        process.stdout.write(text);
      });
      res.on('end', () => {
        console.log('\n\n--- STREAM ENDED ---');
        resolve({ status: res.statusCode, body: fullBody });
      });
    });

    // Timeout de 60s para dar tempo do Gemini processar tools
    req.setTimeout(60000, () => {
      console.log('\n--- TIMEOUT (60s) ---');
      req.destroy();
      resolve({ status: 0, body: 'TIMEOUT' });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    // 1. Login
    console.log('=== STEP 1: Login (TechCorp) ===');
    const loginRes = await post('/auth/login', {
      email: 'admin@techcorp.com',
      password: 'Demo1234!',
    });
    console.log(`Login status: ${loginRes.status}`);
    
    if (loginRes.status !== 200 && loginRes.status !== 201) {
      console.log('Login failed. Perhaps techcorp doesnt exist in this database? response:', loginRes.body);
      process.exit(1);
    }
    
    const parsed = JSON.parse(loginRes.body);
    const token = parsed.access_token || parsed.token;
    console.log(`Token obtido: ${token ? token.substring(0, 30) + '...' : 'NENHUM'}`);
    
    // 1.5. Fetch /products
    console.log('\n=== STEP 1.5: GET /products (Verificação Manual) ===');
    const prodRes = await new Promise((resolve, reject) => {
      const req = http.request(new URL('/products', BASE), {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res) => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => resolve({ status: res.statusCode, body: raw }));
      });
      req.on('error', reject);
      req.end();
    });
    
    console.log(`Products status: ${prodRes.status}`);
    const productsData = JSON.parse(prodRes.body);
    console.log(`Produtos encontrados via API normal: ${productsData.length}`);
    if (productsData.length > 0) {
      console.log(productsData.map(p => `- ${p.name} ($${p.price})`).join('\n'));
    }

    // 2. Chat - perguntar sobre produtos
    console.log('\n=== STEP 2: Chat - Liste os produtos ===');
    const chatRes = await streamPost('/chat', {
      messages: [
        { role: 'user', content: 'Liste todos os produtos disponíveis no catálogo da empresa' }
      ],
    }, {
      'Authorization': `Bearer ${token}`,
    });

    console.log(`\n=== RESULTADO FINAL ===`);
    console.log(`Status: ${chatRes.status}`);
    console.log(`Body length: ${chatRes.body.length} chars`);
    
    // Parse SSE events
    const lines = chatRes.body.split('\n').filter(l => l.startsWith('data: '));
    console.log(`\nSSE events recebidos: ${lines.length}`);
    
    let fullText = '';
    for (const line of lines) {
      if (line.includes('[DONE]')) {
        console.log('  [DONE] recebido');
        continue;
      }
      try {
        const data = JSON.parse(line.replace('data: ', ''));
        if (data.choices?.[0]?.delta?.content) {
          fullText += data.choices[0].delta.content;
        }
      } catch (e) {}
    }
    
    console.log(`\n=== TEXTO COMPLETO DA IA ===`);
    console.log(fullText || '(VAZIO - Nenhum texto gerado pela IA)');
    
  } catch (err) {
    console.error('ERRO:', err.message);
  }
})();

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
