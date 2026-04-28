import { SupabaseProductRepository } from "@/infrastructure/products/SupabaseProductRepository";
import { SupabaseProductImageRepository } from "@/infrastructure/products/SupabaseProductImageRepository";
import { ProductUseCases } from "@/application/products/ProductUseCases";

/**
 * Composition root for the products feature.
 */
export const productUseCases = new ProductUseCases(
  new SupabaseProductRepository(),
  new SupabaseProductImageRepository(),
);
