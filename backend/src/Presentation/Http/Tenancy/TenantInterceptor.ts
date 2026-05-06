/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Interceptor global que inicializa o TenantContext a partir do usuário autenticado.
 */

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../../../Infrastructure/Tenancy/TenantContext';

type RequestWithUser = {
  user?: { userId?: string; companyId?: string; role?: 'admin' | 'user' };
};

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly tenantContext: TenantContext) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<RequestWithUser>();

    // Rotas públicas não terão req.user; não inicializa contexto.
    if (!req.user) {
      return next.handle();
    }

    const { userId, companyId, role } = req.user;
    if (!userId || !companyId || !role) {
      throw new UnauthorizedException('Invalid authenticated user context.');
    }

    return this.tenantContext.run({ userId, companyId, role }, () => next.handle());
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
