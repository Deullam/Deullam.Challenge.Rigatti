/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Repositório Mongoose para User (implementa IUserRepository).
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IUserRepository } from '../../../Domain/User/IUserRepository';
import { User } from '../../../Domain/User/User';
import { UserSchemaClass } from '../../Database/Mongoose/Schemas/UserSchema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserSchemaClass>,
  ) {}

  async create(input: {
    email: string;
    passwordHash: string;
    role: 'admin' | 'user';
    companyId: string;
  }): Promise<User> {
    const created = await this.userModel.create({
      email: input.email,
      passwordHash: input.passwordHash,
      role: input.role,
      companyId: new Types.ObjectId(input.companyId),
    });

    return new User(
      created._id.toString(),
      created.email,
      created.passwordHash,
      created.role,
      created.companyId.toString(),
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const found = await this.userModel.findOne({ email: email.toLowerCase() }).lean();
    if (!found) return null;
    return new User(
      found._id.toString(),
      found.email,
      found.passwordHash,
      found.role,
      found.companyId.toString(),
    );
  }

  async findById(id: string): Promise<User | null> {
    const found = await this.userModel.findById(id).lean();
    if (!found) return null;
    return new User(
      found._id.toString(),
      found.email,
      found.passwordHash,
      found.role,
      found.companyId.toString(),
    );
  }
}

