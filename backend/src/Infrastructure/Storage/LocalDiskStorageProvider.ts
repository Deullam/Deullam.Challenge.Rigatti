/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Provedor de armazenamento local em disco.
 */

import { Injectable } from '@nestjs/common';
import { IStorageProvider } from '../../Application/Storage/IStorageProvider';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalDiskStorageProvider implements IStorageProvider {
  async saveFile(originalName: string, buffer: Buffer, folder: string): Promise<string> {
    // 1. Gera o nome único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(originalName);
    const fileName = `${uniqueSuffix}${ext}`;

    // 2. Define o caminho físico (process.cwd() para funcionar no Docker)
    const uploadPath = path.join(process.cwd(), 'uploads', folder);

    // Garante que a pasta existe
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // 3. Salva o arquivo fisicamente
    const filePath = path.join(uploadPath, fileName);
    fs.writeFileSync(filePath, buffer);

    // 4. Monta a URL
    const baseUrl = process.env.API_URL || 'http://localhost:3001';
    return `${baseUrl}/uploads/${folder}/${fileName}`;
  }
}