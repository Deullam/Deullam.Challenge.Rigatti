import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/presentation/auth/AuthContext";
// Removemos o import do chatUseCases para termos controlo total aqui
import type { ChatMessage } from "@/domain/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Send, Sparkles, User, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Quais produtos temos abaixo de R$ 50?",
  "Recomende algo para um novo cliente.",
  "Liste tudo do nosso catálogo agrupado por categoria.",
];

export default function ChatPage() {
  const { user, companyId } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = `Chat — TenantAI`; }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy || !user) return;

    // 1. Pega o token para autenticar no backend NestJS
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast({ title: "Erro", description: "Sessão não encontrada.", variant: "destructive" });
      return;
    }

    // 2. Atualiza o ecrã com a pergunta do utilizador
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    let assistantText = "";
    let started = false;

    // Função para escrever a resposta da IA no ecrã aos poucos
    const upsert = (chunk: string) => {
      assistantText += chunk;
      setMessages(prev => {
        if (!started) {
          started = true;
          return [...prev, { role: "assistant", content: assistantText }];
        }
        return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantText } : m);
      });
    };

    try {
      // 3. Comunicação direta com o nosso ChatController do NestJS
      // Ajuste a URL base se necessário
      const response = await fetch("http://localhost:3001/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        // Enviamos o histórico completo (array de mensagens)
        body: JSON.stringify({ messages: next })
      });

      // 4. O SEGREDO ESTÁ AQUI: Capturamos qualquer erro do backend NestJS!
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `O servidor recusou a mensagem (Erro ${response.status})`);
      }

      // 5. Lemos o Stream (SSE) que o nosso ChatUseCase gera
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("Streaming não suportado pelo navegador.");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          // O Vercel AI SDK no backend envia as linhas com prefixo "data: "
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));

              // Extrai o conteúdo se existir
              if (data.choices && data.choices[0]?.delta?.content) {
                upsert(data.choices[0].delta.content);
              }
            } catch (err) {
              // Ignoramos erros de parse caso o JSON chegue cortado no meio de um pacote
            }
          }
        }
      }
    } catch (e: any) {
      // Se o backend der erro, o Toast vai mostrar EXATAMENTE o motivo na tela!
      toast({ title: "Erro na comunicação", description: e.message, variant: "destructive" });
      setMessages(prev => prev.slice(0, -1)); // Remove a mensagem para poder tentar novamente
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4 px-2">
        {messages.length === 0 && (
          <div className="grid place-items-center py-16 space-y-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary/80 to-primary grid place-items-center shadow-lg">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Pergunte ao assistente da empresa</h2>
              <p className="text-muted-foreground">Catálogo inteligente com IA.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 w-full max-w-2xl">
              {SUGGESTIONS.map(s => (
                <div
                  key={s}
                  role="button"
                  tabIndex={0}
                  className="p-3 text-sm text-left cursor-pointer bg-card border shadow-sm rounded-xl hover:bg-accent transition-colors"
                  onClick={() => send(s)}
                  onKeyDown={(e) => e.key === 'Enter' && send(s)}
                >
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-primary/80 to-primary grid place-items-center shadow-sm">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border shadow-sm"
              }`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap break-words">{m.content}</div>
              )}
            </div>
            {m.role === "user" && (
              <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary grid place-items-center">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {busy && messages[messages.length - 1]?.role === "user" && (
          <div className="flex gap-3">
            <div className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-primary/80 to-primary grid place-items-center shadow-sm">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-card border shadow-sm rounded-2xl px-4 py-2.5 flex items-center">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border rounded-2xl p-2 bg-card shadow-sm flex items-end gap-2 mt-2"
      >
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(input);
            }
          }}
          placeholder="Pergunte sobre os produtos da sua empresa…"
          rows={1}
          className="border-0 focus-visible:ring-0 resize-none min-h-[40px] max-h-32"
        />
        <Button type="submit" size="icon" disabled={busy || !input.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}