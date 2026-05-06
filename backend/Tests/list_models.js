require('dotenv').config();

async function run() {
  const req = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
  const data = await req.json();
  const gemmas = data.models.filter(m => m.name.toLowerCase().includes('gemma'));
  console.log("Modelos Gemma disponíveis:");
  gemmas.forEach(m => console.log(m.name));
}

run();

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
