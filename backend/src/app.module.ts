/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Módulo raiz que delega para o RootModule (composition root).
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Import ConfigModule
import { RootModule } from './Presentation/Modules/RootModule';
import { MongoosePersistenceModule } from './Infrastructure/Database/Mongoose/MongoosePersistenceModule'; // Import MongoosePersistenceModule

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Torna o ConfigModule global
    MongoosePersistenceModule, // Importa o módulo de persistência
    RootModule,
  ],
})
export class AppModule { }

