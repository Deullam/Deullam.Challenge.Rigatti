/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Tokens padronizados de IoC/DI para o container do NestJS.
 */

export const TOKENS = {
  ICompanyRepository: Symbol('ICompanyRepository'),
  IUserRepository: Symbol('IUserRepository'),
  IProductRepository: Symbol('IProductRepository'),

  IHasher: Symbol('IHasher'),
  ITokenService: Symbol('ITokenService'),

  TenantContext: Symbol('TenantContext'),
} as const;

export type TokenKey = keyof typeof TOKENS;

