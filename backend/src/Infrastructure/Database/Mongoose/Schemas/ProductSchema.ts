/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Schema Mongoose para persistência de Product.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<ProductSchemaClass>;

@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class ProductSchemaClass {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, trim: true })
  category!: string;

  @Prop({ required: false })
  imageUrl?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'CompanySchemaClass', index: true })
  companyId!: Types.ObjectId;
}

export const ProductSchema = SchemaFactory.createForClass(ProductSchemaClass);
ProductSchema.index({ companyId: 1, name: 1 });
ProductSchema.index({ companyId: 1, category: 1 });

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
