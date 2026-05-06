/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Interface do repositório de User.
 */

import { User } from './User';

export interface IUserRepository {
  create(input: {
    email: string;
    passwordHash: string;
    role: 'admin' | 'user';
    companyId?: string;
    companyName: string;
  }): Promise<User>;

  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

