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
import { MultiTenantMongooseRepository } from '../../Database/Mongoose/MultiTenantMongooseRepository';
import { TenantContext } from '../../Tenancy/TenantContext';

@Injectable()
export class UserRepository
  extends MultiTenantMongooseRepository<UserSchemaClass>
  implements IUserRepository {
  constructor(
    @InjectModel(UserSchemaClass.name)
    private readonly userModel: Model<UserSchemaClass>,
    protected readonly tenantContext: TenantContext,
  ) {
    super(userModel, tenantContext);
  }

  async create(input: {
    email: string;
    passwordHash: string;
    role: 'admin' | 'user';
    companyId?: string; // opcional, se não vier gera um novo
    companyName: string;
  }): Promise<User> {
    const objectId = input.companyId ? new Types.ObjectId(input.companyId) : new Types.ObjectId();
    const created = await this.userModel.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      companyId: objectId,
      companyName: input.companyName,
    });

    return new User(
      created._id.toString(),
      created.email,
      created.passwordHash,
      created.role,
      created.companyId.toString(),
      created.companyName || created.companyId.toString(),
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    // Busca global (sem filtro de tenant) para suportar o login
    const found = await this.getGlobalModel()
      .findOne({ email: email.toLowerCase() })
      .lean();
    if (!found) return null;
    return new User(
      found._id.toString(),
      found.email,
      found.passwordHash,
      found.role,
      found.companyId.toString(),
      found.companyName || found.companyId.toString(),
    );
  }


  async findById(id: string): Promise<User | null> {
    const found = await this.getModelWithTenantFilter()
      .findOne({ _id: id })
      .lean();
    if (!found) return null;
    return new User(
      found._id.toString(),
      found.email,
      found.passwordHash,
      found.role,
      found.companyId.toString(),
      found.companyName || found.companyId.toString(),
    );
  }
}


