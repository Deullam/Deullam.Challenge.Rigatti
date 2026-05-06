/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Utilitário para gerenciar o MongoDB em memória nos testes de integração.
 */

import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection } from 'mongoose';

export class TestDatabase {
  private mongod!: MongoMemoryServer;
  private connection!: Connection;

  async connect() {
    this.mongod = await MongoMemoryServer.create();
    const uri = this.mongod.getUri();
    const mongooseConnection = await connect(uri);
    this.connection = mongooseConnection.connection;
  }

  async close() {
    if (this.connection) {
      await this.connection.close();
    }
    if (this.mongod) {
      await this.mongod.stop();
    }
  }

  async clear() {
    const collections = this.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }

  getUri() {
    return this.mongod.getUri();
  }
}
