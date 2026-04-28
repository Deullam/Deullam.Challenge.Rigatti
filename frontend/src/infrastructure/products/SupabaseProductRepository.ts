import { supabase } from "@/integrations/supabase/client";
import type { ProductRepository } from "@/domain/products/ProductRepository";
import type { Product, ProductDraft } from "@/domain/products/Product";

/**
 * Infrastructure layer — Supabase implementation of ProductRepository.
 * Tenant isolation is enforced by Postgres RLS, not by this code.
 */
export class SupabaseProductRepository implements ProductRepository {
  async list(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Product[];
  }

  async create(draft: ProductDraft) {
    const { error } = await supabase.from("products").insert(draft);
    if (error) throw error;
  }

  async update(id: string, draft: ProductDraft) {
    const { error } = await supabase.from("products").update(draft).eq("id", id);
    if (error) throw error;
  }

  async remove(id: string) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  }
}
