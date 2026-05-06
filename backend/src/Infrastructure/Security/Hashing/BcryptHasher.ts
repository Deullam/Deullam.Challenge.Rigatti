/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Implementação de hashing baseada em bcrypt.
 */

import * as bcrypt from 'bcrypt';
import { IHasher } from './IHasher';

export class BcryptHasher implements IHasher {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, 12);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
