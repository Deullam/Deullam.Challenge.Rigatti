import { NestAuthRepository } from "@/infrastructure/auth/NestAuthRepository";
import { NestProfileRepository } from "@/infrastructure/auth/NestProfileRepository";
import { SupabaseProfileRepository } from "@/infrastructure/auth/SupabaseProfileRepository";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { AuthUseCases } from "@/application/auth/AuthUseCases";

/**
 * Composition root for the auth feature.
 * Single place that wires concrete infrastructure into use-cases.
 *
 * O NestJS é o padrão: é ele que valida as credenciais, emite o JWT e devolve
 * companyId/companyName/role. O Supabase continua disponível como alternativa,
 * mas só é escolhido quando VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY
 * (ou VITE_SUPABASE_ANON_KEY) estiverem definidas — ver frontend/.env.example.
 */
const profileRepository = isSupabaseConfigured()
  ? new SupabaseProfileRepository()
  : new NestProfileRepository();

export const authUseCases = new AuthUseCases(
  new NestAuthRepository(),
  profileRepository,
);

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
