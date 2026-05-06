export interface IStorageProvider {
  /**
   * Salva um arquivo e retorna a URL pública.
   */
  saveFile(fileName: string, buffer: Buffer, folder: string): Promise<string>;
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
