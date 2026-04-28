import { SupabaseAuthRepository } from "@/infrastructure/auth/SupabaseAuthRepository";
import { SupabaseProfileRepository } from "@/infrastructure/auth/SupabaseProfileRepository";
import { AuthUseCases } from "@/application/auth/AuthUseCases";

/**
 * Composition root for the auth feature.
 * Single place that wires concrete infrastructure into use-cases.
 */
export const authUseCases = new AuthUseCases(
  new SupabaseAuthRepository(),
  new SupabaseProfileRepository(),
);
