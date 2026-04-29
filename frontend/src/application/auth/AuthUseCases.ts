import type { AuthRepository, ProfileRepository } from "@/domain/auth/AuthRepository";
import type { Role, SignInInput, SignUpInput } from "@/domain/auth/entities";

/**
 * Application layer — Auth use cases.
 * Orchestrates repositories. No framework, no UI.
 */
export class AuthUseCases {
  constructor(
    private readonly auth: AuthRepository,
    private readonly profiles: ProfileRepository,
  ) {}

  // Expose the auth repository so the React adapter can subscribe to session changes.
  get authRepository(): AuthRepository {
    return this.auth;
  }

  signIn(input: SignInInput) {
    return this.auth.signIn(input);
  }

  async signUp(input: SignUpInput) {
    const { user } = await this.auth.signUp(input);
    if (user && input.companyName?.trim()) {
      await this.profiles.attachCompanyToUser(user.id, input.companyName.trim());
    }
    return { user };
  }

  signOut() {
    return this.auth.signOut();
  }

  async loadUserContext(userId: string) {
    const [{ companyId, companyName }, roles] = await Promise.all([
      this.profiles.loadCompany(userId),
      this.profiles.loadRoles(userId),
    ]);
    const role: Role | null = roles.includes("admin") ? "admin" : roles.length ? "user" : null;
    return { companyId, companyName, role };
  }
}
