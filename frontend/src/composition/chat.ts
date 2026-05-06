import { NestChatRepository } from "@/infrastructure/chat/EdgeFunctionChatRepository";
import { ChatUseCases } from "@/application/chat/ChatUseCases";

/**
 * Composition root for the chat feature.
 */
export const chatUseCases = new ChatUseCases(new NestChatRepository());
