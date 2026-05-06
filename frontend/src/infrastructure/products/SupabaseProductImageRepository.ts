import { supabase } from "@/integrations/supabase/client";
import type { ProductImageRepository } from "@/domain/products/ProductRepository";

/**
 * Infrastructure layer — uploads product images to the per-tenant folder.
 * The bucket policy enforces the `<companyId>/...` prefix server-side.
 */
export class SupabaseProductImageRepository implements ProductImageRepository {
  async upload(companyId: string, file: File): Promise<{ url: string }> {
    const path = `${companyId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return { url: data.publicUrl };
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
