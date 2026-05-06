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

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
