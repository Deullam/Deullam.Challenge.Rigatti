import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/presentation/auth/AuthContext";
import { chatUseCases } from "@/composition/chat";
import type { ChatMessage } from "@/domain/chat/ChatMessage";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Send, Sparkles, User, Loader2 } from "lucide-react";

const SUGGESTIONS = [
  "Quais produtos temos abaixo de R$ 50?",
  "Recomende algo para um novo cliente.",
  "Liste tudo do nosso catálogo agrupado por categoria.",
];

export default function ChatPage() {
  const { session, companyName } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = `Chat — ${companyName ?? "TenantAI"}`; }, [companyName]);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy || !session) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);

    let assistantText = "";
    let started = false;
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
      await chatUseCases.sendMessage({
        accessToken: session.access_token,
        history: next,
        onToken: upsert,
      });
    } catch (e: any) {
      toast({ title: "Erro no chat", description: e.message, variant: "destructive" });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container max-w-3xl py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="grid place-items-center py-16 space-y-6 text-center">
            <div className="h-14 w-14 rounded-2xl gradient-hero grid place-items-center shadow-glow">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Pergunte ao assistente da {companyName}</h2>
              <p className="text-muted-foreground">Com tecnologia Lovable AI e chamadas de ferramentas — restrito aos produtos da sua empresa.</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 w-full max-w-2xl">
              {SUGGESTIONS.map(s => (
                <Card key={s} className="p-3 text-sm text-left cursor-pointer hover:bg-accent transition-colors" onClick={() => send(s)}>
                  {s}
                </Card>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
            {m.role === "assistant" && (
              <div className="h-8 w-8 shrink-0 rounded-lg gradient-hero grid place-items-center shadow-glow">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border"
            }`}>
              {m.role === "assistant" ? (
                <div className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">{m.content}</div>
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
            <div className="h-8 w-8 shrink-0 rounded-lg gradient-hero grid place-items-center shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="bg-card border rounded-2xl px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="border rounded-2xl p-2 bg-card shadow-card flex items-end gap-2"
      >
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
          }}
          placeholder={`Pergunte sobre os produtos da ${companyName ?? "sua empresa"}…`}
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
