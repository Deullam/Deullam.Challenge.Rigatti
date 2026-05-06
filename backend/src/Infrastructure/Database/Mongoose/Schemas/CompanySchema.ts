/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Schema Mongoose para persistência de Company.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CompanyDocument = HydratedDocument<CompanySchemaClass>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class CompanySchemaClass {
  @Prop({ required: true, trim: true })
  name!: string;
}

export const CompanySchema = SchemaFactory.createForClass(CompanySchemaClass);

