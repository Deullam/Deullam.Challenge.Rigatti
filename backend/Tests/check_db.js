const { MongoClient } = require('mongodb');
require('dotenv').config();

async function checkDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://root:root@localhost:27017/deullam_challenge?authSource=admin';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Conectado ao MongoDB!");
    
    const db = client.db('deullam_challenge');
    
    // 1. Buscar todos os usuários
    const users = await db.collection('users').find({}).toArray();
    console.log(`\n=== USUÁRIOS ENCONTRADOS (${users.length}) ===`);
    users.forEach(u => {
      console.log(`- Email: ${u.email} | ID: ${u._id} | CompanyID: ${u.companyId}`);
    });

    // 2. Buscar todos os produtos
    const products = await db.collection('products').find({}).toArray();
    console.log(`\n=== TODOS OS PRODUTOS NO BANCO (${products.length}) ===`);
    if (products.length === 0) {
      console.log("NENHUM PRODUTO ENCONTRADO NO BANCO DE DADOS GERAL.");
    } else {
      products.forEach(p => {
        console.log(`- Produto: ${p.name} | Preço: ${p.price} | Categoria: ${p.category} | CompanyID: ${p.companyId}`);
      });
    }

    // 3. Agrupar produtos por CompanyID
    console.log(`\n=== PRODUTOS POR COMPANY ID ===`);
    const companies = [...new Set(products.map(p => p.companyId.toString()))];
    for (const cid of companies) {
      const companyProducts = products.filter(p => p.companyId.toString() === cid);
      console.log(`CompanyID [${cid}]: ${companyProducts.length} produtos`);
    }

  } catch (err) {
    console.error("Erro ao conectar:", err);
  } finally {
    await client.close();
  }
}

checkDatabase();

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
