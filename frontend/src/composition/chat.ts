import { NestChatRepository } from "@/infrastructure/chat/EdgeFunctionChatRepository";
import { ChatUseCases } from "@/application/chat/ChatUseCases";

/**
 * Composition root for the chat feature.
 */
export const chatUseCases = new ChatUseCases(new NestChatRepository());

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
