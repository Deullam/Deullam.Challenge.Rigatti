import { supabase } from "@/integrations/supabase/client";
import type { ProfileRepository } from "@/domain/auth/AuthRepository";
import type { Role } from "@/domain/auth/entities";

/**
 * Infrastructure layer — profiles + roles + companies access.
 * Hides the table shape from the rest of the app.
 */
export class SupabaseProfileRepository implements ProfileRepository {
  async loadCompany(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("company_id, companies(name)")
      .eq("id", userId)
      .maybeSingle();
    return {
      companyId: data?.company_id ?? null,
      companyName: (data as any)?.companies?.name ?? null,
    };
  }

  async loadRoles(userId: string): Promise<Role[]> {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    return (data ?? []).map((r: any) => r.role as Role);
  }

  async attachCompanyToUser(userId: string, companyName: string) {
    const { data: company, error } = await supabase
      .from("companies")
      .insert({ name: companyName })
      .select("id")
      .single();
    if (error) throw error;
    await supabase.from("profiles").update({ company_id: company.id }).eq("id", userId);
    await supabase.from("user_roles").insert({ user_id: userId, company_id: company.id, role: "admin" });
    return { companyId: company.id };
  }
}
