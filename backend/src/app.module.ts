/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Módulo raiz que delega para o RootModule (composition root).
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { RootModule } from './Presentation/Modules/RootModule';
import { MongoosePersistenceModule } from './Infrastructure/Database/Mongoose/MongoosePersistenceModule'; // Import MongoosePersistenceModule
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Torna o ConfigModule global
    MongoosePersistenceModule, // Importa o módulo de persistência
    RootModule,
    // Libera a pasta 'uploads' para acesso público HTTP
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
})
export class AppModule { }

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
