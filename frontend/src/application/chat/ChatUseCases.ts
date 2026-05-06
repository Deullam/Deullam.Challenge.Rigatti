import type { ChatRepository } from "@/domain/chat/ChatRepository";
import type { ChatMessage } from "@/domain/chat/ChatMessage";

/**
 * Application layer — Chat use cases.
 * Encapsulates the conversation flow and exposes a tiny callback API to the UI.
 */
export class ChatUseCases {
  constructor(private readonly chat: ChatRepository) { }

  async sendMessage(args: {
    access_token: string;
    history: ChatMessage[];
    onToken: (token: string) => void;
    signal?: AbortSignal;
  }) {
    return this.chat.streamReply({
      access_token: args.access_token,
      messages: args.history,
      onToken: args.onToken,
      signal: args.signal,
    });
  }
}
