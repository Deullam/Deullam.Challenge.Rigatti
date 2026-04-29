import type { ChatRepository } from "@/domain/chat/ChatRepository";
import type { ChatMessage } from "@/domain/chat/ChatMessage";

/**
 * Application layer — Chat use cases.
 * Encapsulates the conversation flow and exposes a tiny callback API to the UI.
 */
export class ChatUseCases {
  constructor(private readonly chat: ChatRepository) {}

  async sendMessage(args: {
    accessToken: string;
    history: ChatMessage[];
    onToken: (token: string) => void;
    signal?: AbortSignal;
  }) {
    return this.chat.streamReply({
      accessToken: args.accessToken,
      messages: args.history,
      onToken: args.onToken,
      signal: args.signal,
    });
  }
}
