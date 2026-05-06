import type { ChatRepository } from "@/domain/chat/ChatRepository";
import type { ChatMessage } from "@/domain/chat/ChatMessage";

export class NestChatRepository implements ChatRepository {
  // Apontamos diretamente para o seu NestJS
  constructor(private readonly baseUrl: string = import.meta.env.API_URL || 'http://localhost:3001') { }

  async streamReply({ access_token, messages, onToken, signal }: {
    access_token: string;
    messages: ChatMessage[];
    onToken: (token: string) => void;
    signal?: AbortSignal;
  }) {
    // Chamamos a rota que vamos criar no backend (/chat)
    const resp = await fetch(`${this.baseUrl}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({ messages }),
      signal,
    });

    if (!resp.ok || !resp.body) {
      const err = await resp.json().catch(() => ({ error: `HTTP ${resp.status}` }));
      throw new Error(err.error ?? `HTTP ${resp.status}`);
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let done = false;

    // A sua lógica original brilhante de parsing contínua aqui intacta!
    while (!done) {
      const { done: d, value } = await reader.read();
      if (d) break;
      buf += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buf.indexOf("\n")) !== -1) {
        let line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const json = line.slice(6).trim();
        if (json === "[DONE]") { done = true; break; }
        try {
          const parsed = JSON.parse(json);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) onToken(delta);
        } catch {
          buf = line + "\n" + buf;
          break;
        }
      }
    }
  }
}