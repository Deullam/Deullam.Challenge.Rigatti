/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Contexto de tenant por request usando AsyncLocalStorage.
 */

import { AsyncLocalStorage } from 'node:async_hooks';

export type TenantContextValue = Readonly<{
  companyId: string;
  userId: string;
  role: 'admin' | 'user';
}>;

export class TenantContext {
  private readonly als = new AsyncLocalStorage<TenantContextValue>();

  run<T>(value: TenantContextValue, fn: () => T): T {
    return this.als.run(value, fn);
  }

  get(): TenantContextValue {
    const value = this.als.getStore();
    if (!value) {
      throw new Error('TenantContext is not initialized for this request.');
    }
    return value;
  }

  tryGet(): TenantContextValue | null {
    return this.als.getStore() ?? null;
  }
}

