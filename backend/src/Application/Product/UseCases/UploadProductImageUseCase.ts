import { Injectable, Inject } from '@nestjs/common';
import { IStorageProvider } from '../../Storage/IStorageProvider';
import { TOKENS } from '../../../Shared/IoC/tokens'; // Assumindo que você usa tokens para DI

@Injectable()
export class UploadProductImageUseCase {
  constructor(
    @Inject(TOKENS.IStorageProvider)
    private readonly storageProvider: IStorageProvider,
  ) { }

  async execute(input: { file: Express.Multer.File }): Promise<string> {
    // O Use Case orquestra a chamada ao provider
    // Aqui você poderia adicionar validações de tamanho ou tipo de arquivo futuramente
    return this.storageProvider.saveFile(
      input.file.originalname,
      input.file.buffer,
      'products',
    );
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
