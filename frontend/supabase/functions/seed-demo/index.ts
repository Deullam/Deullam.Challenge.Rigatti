// Idempotent seed: creates TechCorp + FoodCorp with 1 admin + 1 user each, plus 10 products per company.
//
// ─────────────────────────────────────────────────────────────────────────────
// CLEAN ARCHITECTURE INSIDE A SINGLE FILE
//   1. DOMAIN          — fixtures + repository interfaces
//   2. INFRASTRUCTURE  — Supabase admin adapters (Repository pattern)
//   3. APPLICATION     — SeedUseCase orchestrating idempotent setup
//   4. PRESENTATION    — HTTP handler
// ─────────────────────────────────────────────────────────────────────────────

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const PASSWORD = "Demo1234!";

// ═════════════════════════════════════════════════════════════════════════════
// 1. DOMAIN — fixtures + contracts
// ═════════════════════════════════════════════════════════════════════════════

type ProductTuple = [name: string, description: string, price: number, category: string];

const TECH: ProductTuple[] = [
  ["Notebook Quantum X1", "Ultraportátil de 14 polegadas com 32GB de RAM e 1TB de SSD.", 9499, "notebooks"],
  ["Mouse Sem Fio Nebula", "Mouse Bluetooth ergonômico com clique silencioso.", 249, "acessórios"],
  ["Monitor Aurora 4K", "Tela IPS de 27 polegadas com dock USB-C.", 2749, "monitores"],
  ["Teclado Mecânico Pulse", "Switches hot-swappable e iluminação RGB.", 799, "acessórios"],
  ["Fone com Cancelamento de Ruído Echo", "Headphone over-ear, 40h de bateria, ANC.", 1499, "áudio"],
  ["Webcam Vortex Pro", "Webcam 4K com rastreamento por IA e microfones.", 999, "acessórios"],
  ["Hub USB-C Helios", "8 em 1 com HDMI, Ethernet e leitor SD.", 399, "acessórios"],
  ["Smartphone Photon 5G", "Tela OLED de 6,7 polegadas e câmera de 200MP.", 4999, "celulares"],
  ["Tablet Atlas 11", "Compatível com caneta, tela de 120Hz.", 3249, "tablets"],
  ["Smartwatch Cosmo", "Frequência cardíaca, GPS e bateria de 7 dias.", 1249, "vestíveis"],
];

const FOOD: ProductTuple[] = [
  ["Macarrão à Trufa", "Macarrão parafuso cremoso com lascas de trufa negra.", 69, "pratos principais"],
  ["Smash Burger Wagyu", "Hambúrguer duplo, cebola caramelizada e pão brioche.", 89, "pratos principais"],
  ["Pizza Margherita de Fermentação Natural", "Tomates San Marzano, fior di latte e manjericão.", 79, "pizzas"],
  ["Frango Frito Coreano", "Duplamente frito, glaceado com gochujang e gergelim.", 65, "pratos principais"],
  ["Salada de Abacate com Cítricos", "Mix de folhas, laranja sanguínea e crocante de pistache.", 55, "saladas"],
  ["Bowl de Salmão com Missô", "Arroz japonês, edamame e gengibre em conserva.", 85, "bowls"],
  ["Lámen Tonkotsu Apimentado", "Caldo de porco de 12h, ovo mollet e nori.", 75, "sopas"],
  ["Petit Gâteau de Chocolate", "Bolo quente com recheio de chocolate amargo e baunilha.", 45, "sobremesas"],
  ["Tiramisù de Matcha", "Mascarpone, biscoito champanhe e matcha cerimonial.", 49, "sobremesas"],
  ["Chá Gelado de Hibisco", "Preparado na casa com limão e hortelã.", 25, "bebidas"],
];

interface UserRepository {
  ensureUser(email: string, password: string): Promise<string>;
}
interface CompanyRepository {
  ensureCompany(name: string): Promise<string>;
}
interface MembershipRepository {
  linkProfile(userId: string, email: string, companyId: string): Promise<void>;
  assignRole(userId: string, companyId: string, role: "admin" | "user"): Promise<void>;
}
interface ProductSeedRepository {
  countByCompany(companyId: string): Promise<number>;
  bulkInsert(companyId: string, items: ProductTuple[]): Promise<void>;
}

// ═════════════════════════════════════════════════════════════════════════════
// 2. INFRASTRUCTURE
// ═════════════════════════════════════════════════════════════════════════════

class SupabaseAdminUserRepository implements UserRepository {
  constructor(private readonly admin: any) { }
  async ensureUser(email: string, password: string): Promise<string> {
    const { data: list } = await this.admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existing = list?.users?.find((u: any) => u.email === email);
    if (existing) return existing.id;
    const { data, error } = await this.admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (error) throw error;
    return data.user!.id;
  }
}

class SupabaseCompanyRepository implements CompanyRepository {
  constructor(private readonly admin: any) { }
  async ensureCompany(name: string): Promise<string> {
    const { data: existing } = await this.admin.from("companies").select("id").eq("name", name).maybeSingle();
    if (existing) return existing.id;
    const { data, error } = await this.admin.from("companies").insert({ name }).select("id").single();
    if (error) throw error;
    return data.id;
  }
}

class SupabaseMembershipRepository implements MembershipRepository {
  constructor(private readonly admin: any) { }
  async linkProfile(userId: string, email: string, companyId: string) {
    await this.admin.from("profiles").upsert([{ id: userId, email, companyId: companyId }]);
  }
  async assignRole(userId: string, companyId: string, role: "admin" | "user") {
    await this.admin.from("user_roles").upsert(
      [{ user_id: userId, companyId: companyId, role }],
      { onConflict: "user_id,role" },
    );
  }
}

class SupabaseProductSeedRepository implements ProductSeedRepository {
  constructor(private readonly admin: any) { }
  async countByCompany(companyId: string): Promise<number> {
    const { count } = await this.admin.from("products").select("*", { count: "exact", head: true }).eq("companyId", companyId);
    return count ?? 0;
  }
  async bulkInsert(companyId: string, items: ProductTuple[]) {
    await this.admin.from("products").insert(items.map(([name, description, price, category]) => ({
      companyId: companyId, name, description, price, category,
    })));
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 3. APPLICATION — Use case
// ═════════════════════════════════════════════════════════════════════════════

class SeedUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly companies: CompanyRepository,
    private readonly memberships: MembershipRepository,
    private readonly products: ProductSeedRepository,
  ) { }

  async setupCompany(companyName: string, adminEmail: string, userEmail: string, items: ProductTuple[]) {
    const companyId = await this.companies.ensureCompany(companyName);
    const adminId = await this.users.ensureUser(adminEmail, PASSWORD);
    const userId = await this.users.ensureUser(userEmail, PASSWORD);

    await this.memberships.linkProfile(adminId, adminEmail, companyId);
    await this.memberships.linkProfile(userId, userEmail, companyId);
    await this.memberships.assignRole(adminId, companyId, "admin");
    await this.memberships.assignRole(userId, companyId, "user");

    if (await this.products.countByCompany(companyId) === 0) {
      await this.products.bulkInsert(companyId, items);
    }
    return { companyId, adminId, userId };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
// 4. PRESENTATION
// ═════════════════════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const seed = new SeedUseCase(
      new SupabaseAdminUserRepository(admin),
      new SupabaseCompanyRepository(admin),
      new SupabaseMembershipRepository(admin),
      new SupabaseProductSeedRepository(admin),
    );

    const tech = await seed.setupCompany("TechCorp", "admin@techcorp.com", "user@techcorp.com", TECH);
    const food = await seed.setupCompany("FoodCorp", "admin@foodcorp.com", "user@foodcorp.com", FOOD);

    return new Response(JSON.stringify({
      ok: true,
      password: PASSWORD,
      accounts: [
        { company: "TechCorp", admin: "admin@techcorp.com", user: "user@techcorp.com" },
        { company: "FoodCorp", admin: "admin@foodcorp.com", user: "user@foodcorp.com" },
      ],
      tech, food,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("seed error", e);
    return new Response(JSON.stringify({ error: String((e instanceof Error ? e.message : e)) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
