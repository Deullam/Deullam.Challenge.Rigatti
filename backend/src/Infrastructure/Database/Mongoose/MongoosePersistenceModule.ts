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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanySchemaClass.name, schema: CompanySchema },
      { name: UserSchemaClass.name, schema: UserSchema },
      { name: ProductSchemaClass.name, schema: ProductSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class MongoosePersistenceModule {}

