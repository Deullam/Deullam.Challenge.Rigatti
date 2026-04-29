import { NestAuthRepository } from "@/infrastructure/auth/NestAuthRepository";
import { SupabaseProfileRepository } from "@/infrastructure/auth/SupabaseProfileRepository";
import { AuthUseCases } from "@/application/auth/AuthUseCases";

/**
 * Composition root for the auth feature.
 * Single place that wires concrete infrastructure into use-cases.
 */
export const authUseCases = new AuthUseCases(
  new NestAuthRepository() as any,
  new SupabaseProfileRepository(),
);

