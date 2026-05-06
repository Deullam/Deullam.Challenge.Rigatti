/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Módulo de persistência Mongoose (schemas/models).
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanySchema, CompanySchemaClass } from './Schemas/CompanySchema';
import { ProductSchema, ProductSchemaClass } from './Schemas/ProductSchema';
import { UserSchema, UserSchemaClass } from './Schemas/UserSchema';
import { SeedService } from '../../../scripts/SeedService';
import { TOKENS } from '../../../Shared/IoC/tokens';
import { BcryptHasher } from '../../Security/Hashing/BcryptHasher';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanySchemaClass.name, schema: CompanySchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: ProductSchemaClass.name, schema: ProductSchema },
    ]),
  ],
  providers: [
    // Documentação: O SeedService é injetado aqui para poder rodar e popular o banco de dados inicial
    SeedService,

    // Documentação: Regra de Injeção de Dependência
    // Sempre que uma classe (como o SeedService) pedir a interface IHasher (identificada pelo TOKENS.IHasher),
    // o NestJS instanciará e entregará a classe real BcryptHasher.
    {
      provide: TOKENS.IHasher,
      useClass: BcryptHasher,
    }
  ],
  // Documentação: Exportamos o MongooseModule para que as coleções fiquem disponíveis em outros módulos
  exports: [MongooseModule],
})
export class MongoosePersistenceModule { }