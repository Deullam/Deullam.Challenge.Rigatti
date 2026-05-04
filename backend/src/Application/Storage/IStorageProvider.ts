export interface IStorageProvider {
  /**
   * Salva um arquivo e retorna a URL pública.
   */
  saveFile(fileName: string, buffer: Buffer, folder: string): Promise<string>;
}