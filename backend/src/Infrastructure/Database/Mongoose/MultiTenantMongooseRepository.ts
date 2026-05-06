/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Classe base abstrata para repositórios Mongoose que aplicam filtragem multi-tenant.
 */

// Documentação: Importamos o 'Types' do mongoose para fazer a conversão correta
import { Model, Types } from 'mongoose';
import { TenantContext } from '../../Tenancy/TenantContext';

export abstract class MultiTenantMongooseRepository<T> {
  protected constructor(
    protected readonly model: Model<T>,
    protected readonly tenantContext: TenantContext,
  ) { }

  /**
   * @description Retorna o modelo Mongoose filtrado pelo companyId do contexto atual.
   * DEVE ser usado para a maioria das operações (CRUD de produtos, etc).
   */
  protected getModelWithTenantFilter(): any {
    const { companyId } = this.tenantContext.get();
    // Convertemos a string do contexto para o formato nativo ObjectId do MongoDB.
    const objectId = new Types.ObjectId(companyId);

    return this.model.where('companyId', objectId);
  }

  /**
   * @description Retorna o modelo Mongoose sem filtros automáticos.
   * Use com EXTREMA cautela apenas em fluxos onde o companyId não é conhecido (ex: Login).
   */
  protected getGlobalModel(): Model<T> {
    return this.model;
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
