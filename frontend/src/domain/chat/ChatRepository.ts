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
