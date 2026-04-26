/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Schema Mongoose para persistência de User.
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UserDocument = HydratedDocument<UserSchemaClass>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class UserSchemaClass {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true, enum: ['admin', 'user'] })
  role!: 'admin' | 'user';

  @Prop({ required: true, type: Types.ObjectId, ref: 'CompanySchemaClass', index: true })
  companyId!: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(UserSchemaClass);
UserSchema.index({ companyId: 1, email: 1 }, { unique: true });

