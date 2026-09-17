import { getSupabaseClient } from "@/integrations/supabase/client";
import type { AuthRepository } from "@/domain/auth/IAuthRepository";
import type { SignInInput, SignUpInput } from "@/domain/auth/Auth";

/**
 * Infrastructure layer — Supabase implementation of AuthRepository.
 * The only place in the auth feature allowed to import the supabase client.
 *
 * Alternativa opcional: o composition root usa o NestAuthRepository.
 * O cliente é obtido dentro de cada método para que importar este ficheiro
 * nunca derrube o boot do app quando as variáveis VITE_SUPABASE_* não existem.
 */
export class SupabaseAuthRepository implements AuthRepository {
  async getSession() {
    const supabase = getSupabaseClient();
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  onAuthStateChange(cb: (session: any) => void) {
    const supabase = getSupabaseClient();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
    return { unsubscribe: () => data.subscription.unsubscribe() };
  }

  async signIn({ email, password }: SignInInput) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user };
  }

  async signUp({ email, password }: SignUpInput) {
    const supabase = getSupabaseClient();
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: redirectUrl },
    });
    if (error) throw error;
    return { user: data.user };
  }

  async signOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
