import type { ChatMessage } from "./ChatMessage";

/**
 * Domain contract — streams assistant tokens for a given conversation.
 * Implementations decide transport (SSE, WebSocket, etc).
 */
export interface ChatRepository {
  streamReply(args: {
    access_token: string;
    messages: ChatMessage[];
    onToken: (token: string) => void;
    signal?: AbortSignal;
  }): Promise<void>;
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
