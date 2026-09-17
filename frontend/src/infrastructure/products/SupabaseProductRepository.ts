import { getSupabaseClient } from "@/integrations/supabase/client";
import type { ProductRepository } from "@/domain/products/ProductRepository";
import type { Product, ProductDraft } from "@/domain/products/Product";

/**
 * Infrastructure layer — Supabase implementation of ProductRepository.
 * Tenant isolation is enforced by Postgres RLS, not by this code.
 *
 * Alternativa opcional: o composition root usa o NestProductRepository.
 * O cliente é obtido dentro de cada método para que importar este ficheiro
 * nunca derrube o boot do app quando as variáveis VITE_SUPABASE_* não existem.
 */
export class SupabaseProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Product[];
  }

  async create(draft: ProductDraft) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("products").insert(draft);
    if (error) throw error;
  }

  async update(id: string, draft: ProductDraft) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("products").update(draft).eq("id", id);
    if (error) throw error;
  }

  async remove(id: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
