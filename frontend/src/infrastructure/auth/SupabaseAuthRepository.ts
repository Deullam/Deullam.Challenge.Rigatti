import { supabase } from "@/integrations/supabase/client";
import type { AuthRepository } from "@/domain/auth/IAuthRepository";
import type { SignInInput, SignUpInput } from "@/domain/auth/Auth";

/**
 * Infrastructure layer — Supabase implementation of AuthRepository.
 * The only place in the auth feature allowed to import the supabase client.
 */
export class SupabaseAuthRepository implements AuthRepository {
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }

  onAuthStateChange(cb: (session: any) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
    return { unsubscribe: () => data.subscription.unsubscribe() };
  }

  async signIn({ email, password }: SignInInput) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return { user: data.user };
  }

  async signUp({ email, password }: SignUpInput) {
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { emailRedirectTo: redirectUrl },
    });
    if (error) throw error;
    return { user: data.user };
  }

  async signOut() {
    await supabase.auth.signOut();
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
