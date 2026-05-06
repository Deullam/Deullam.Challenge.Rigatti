// AI chat with tool calling + SSE streaming. Tenant-scoped: agent can only see caller's company products.
//
// ─────────────────────────────────────────────────────────────────────────────
// CLEAN ARCHITECTURE INSIDE A SINGLE FILE
// Lovable Edge Functions must keep all code in `index.ts`. To preserve the
// separation we apply on the frontend, this file is organised in 4 sections:
//
//   1. DOMAIN          — entities + repository interfaces (no I/O)
//   2. INFRASTRUCTURE  — Supabase + Lovable AI gateway adapters (Repository pattern)
//   3. APPLICATION     — use-cases that orchestrate the domain
//   4. PRESENTATION    — HTTP handler (Deno.serve) + SSE response shaping
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

// ═════════════════════════════════════════════════════════════════════════════
// 1. DOMAIN
// ═════════════════════════════════════════════════════════════════════════════

interface ChatMessage { role: string; content?: string; tool_call_id?: string; tool_calls?: any[]; }
interface ProductRow { name: string; description: string; price: number; category: string; }
interface SearchArgs { query?: string; category?: string; max_price?: number; }

interface AuthRepository {
  resolveUserId(authorizationHeader: string): Promise<string | null>;
}
interface TenantRepository {
  getCompanyForUser(userId: string): Promise<{ id: string; name: string | null } | null>;
}
interface ProductRepository {
  searchByCompany(companyId: string, args: SearchArgs): Promise<ProductRow[]>;
}
interface AIGateway {
  chatCompletion(messages: ChatMessage[], tools: any[]): Promise<{
    message: ChatMessage | null;
    error?: { status: number; body: string };
  }>;
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. INFRASTRUCTURE — Repository implementations
// ═════════════════════════════════════════════════════════════════════════════

class SupabaseAuthRepository implements AuthRepository {
  async resolveUserId(authorizationHeader: string): Promise<string | null> {
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authorizationHeader } },
    });
    const { data, error } = await userClient.auth.getUser();
    if (error || !data?.user) return null;
    return data.user.id;
  }
}

class SupabaseTenantRepository implements TenantRepository {
  constructor(private readonly admin = createClient(SUPABASE_URL, SERVICE_ROLE)) { }
  async getCompanyForUser(userId: string) {
    const { data: profile } = await this.admin
      .from("profiles").select("companyId").eq("id", userId).maybeSingle();
    if (!profile?.companyId) return null;
    const { data: company } = await this.admin
      .from("companies").select("name").eq("id", profile.companyId).maybeSingle();
    return { id: profile.companyId as string, name: (company?.name as string) ?? null };
  }
}

class SupabaseProductRepository implements ProductRepository {
  constructor(private readonly admin = createClient(SUPABASE_URL, SERVICE_ROLE)) { }
  async searchByCompany(companyId: string, args: SearchArgs): Promise<ProductRow[]> {
    let q = this.admin
      .from("products")
      .select("name, description, price, category")
      .eq("companyId", companyId)
      .limit(20);
    if (args?.query) q = q.or(`name.ilike.%${args.query}%,description.ilike.%${args.query}%`);
    if (args?.category) q = q.ilike("category", `%${args.category}%`);
    if (typeof args?.max_price === "number") q = q.lte("price", args.max_price);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return (data ?? []) as ProductRow[];
  }
}

class LovableAIGateway implements AIGateway {
  constructor(
    private readonly apiKey: string,
    private readonly model = "google/gemini-3-flash-preview",
  ) { }
  async chatCompletion(messages: ChatMessage[], tools: any[]) {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: this.model, messages, tools, stream: false }),
    });
    if (!r.ok) {
      return { message: null, error: { status: r.status, body: await r.text() } };
    }
    const data = await r.json();
    return { message: (data.choices?.[0]?.message as ChatMessage) ?? null };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. APPLICATION — Use cases
// ═════════════════════════════════════════════════════════════════════════════

const TOOLS = [{
  type: "function",
  function: {
    name: "search_company_products",
    description: "Pesquisa no catálogo da empresa do próprio usuário. Use sempre que o usuário perguntar sobre produtos, preços, categorias, recomendações ou o que está disponível.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Busca por texto livre em nome e descrição. Vazio para listar tudo." },
        category: { type: "string", description: "Filtro opcional por categoria." },
        max_price: { type: "number", description: "Filtro opcional de preço máximo." },
      },
    },
  },
}];

const MAX_HOPS = 4;

class ChatUseCases {
  constructor(
    private readonly products: ProductRepository,
    private readonly ai: AIGateway,
  ) { }

  buildSystemPrompt(companyName: string | null) {
    return `Você é um assistente de compras com IA da "${companyName ?? "empresa"}".
Você ajuda o usuário a explorar APENAS o catálogo de produtos DESTA EMPRESA. Você NÃO PODE ver nem discutir dados de outras empresas.
Quando o usuário perguntar sobre produtos, preços, categorias ou recomendações, SEMPRE chame primeiro a ferramenta search_company_products.
Responda SEMPRE em português brasileiro (PT-BR), de forma concisa e amigável, usando markdown (listas, negrito) para clareza.
Use o formato de moeda em reais (R$) ao mencionar preços.`;
  }

  /** Tool-calling loop. Returns the final assistant text or an error to surface. */
  async resolveAnswer(args: {
    companyId: string;
    companyName: string | null;
    clientMessages: ChatMessage[];
  }): Promise<{ text: string } | { error: string; status: number }> {
    const messages: ChatMessage[] = [
      { role: "system", content: this.buildSystemPrompt(args.companyName) },
      ...args.clientMessages,
    ];

    for (let hop = 0; hop < MAX_HOPS; hop++) {
      const { message, error } = await this.ai.chatCompletion(messages, TOOLS);
      if (error) {
        if (error.status === 429) return { error: "Limite de requisições atingido. Tente novamente em instantes.", status: 429 };
        if (error.status === 402) return { error: "Créditos de IA esgotados. Adicione créditos nas configurações do workspace.", status: 402 };
        console.error("LLM error", error.status, error.body);
        return { error: "Erro no gateway de IA", status: 500 };
      }
      if (!message) break;
      messages.push(message);

      const toolCalls = message.tool_calls;
      if (!toolCalls?.length) {
        return { text: message.content ?? "" };
      }

      // Execute tool calls SERVER-SIDE, scoped to companyId. The model never gets to choose the tenant.
      for (const call of toolCalls) {
        let parsed: SearchArgs = {};
        try { parsed = JSON.parse(call.function?.arguments ?? "{}"); } catch { /* ignore */ }
        let result: any = { error: "Unknown tool" };
        if (call.function?.name === "search_company_products") {
          try { result = { products: await this.products.searchByCompany(args.companyId, parsed) }; }
          catch (e: any) { result = { error: e.message ?? String(e) }; }
        }
        messages.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result),
        });
      }
    }
    return { error: "Tool loop limit reached", status: 500 };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. PRESENTATION — HTTP + SSE shaping
// ═════════════════════════════════════════════════════════════════════════════

function ssePresenter(text: string): Response {
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      // Word-by-word chunking so the UI sees a typing effect.
      for (const part of text.split(/(\s+)/)) {
        const payload = JSON.stringify({ choices: [{ delta: { content: part } }] });
        controller.enqueue(enc.encode(`data: ${payload}\n\n`));
        await new Promise(r => setTimeout(r, 12));
      }
      controller.enqueue(enc.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}

function jsonError(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Composition root for the edge function.
const authRepo: AuthRepository = new SupabaseAuthRepository();
const tenantRepo: TenantRepository = new SupabaseTenantRepository();
const productRepo: ProductRepository = new SupabaseProductRepository();
const ai: AIGateway = new LovableAIGateway(LOVABLE_API_KEY);
const chat = new ChatUseCases(productRepo, ai);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const userId = await authRepo.resolveUserId(req.headers.get("Authorization") ?? "");
    if (!userId) return jsonError(401, "Unauthorized");

    const company = await tenantRepo.getCompanyForUser(userId);
    if (!company) return jsonError(400, "Usuário sem empresa vinculada. Execute o popular dados de demonstração ou cadastre uma empresa.");

    const { messages: clientMessages } = await req.json();
    const result = await chat.resolveAnswer({
      companyId: company.id,
      companyName: company.name,
      clientMessages,
    });

    if ("error" in result) return jsonError(result.status, result.error);
    return ssePresenter(result.text);
  } catch (e) {
    console.error("chat error", e);
    return jsonError(500, String(e instanceof Error ? e.message : e));
  }
});

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
