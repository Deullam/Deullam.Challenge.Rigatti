/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Repositório Mongoose para Product com isolamento por companyId.
 */

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { IProductRepository } from '../../../Domain/Product/IProductRepository';
import { Product } from '../../../Domain/Product/Product';
import { ProductSchemaClass } from '../../Database/Mongoose/Schemas/ProductSchema';
import { MultiTenantMongooseRepository } from '../../Database/Mongoose/MultiTenantMongooseRepository';
import { TenantContext } from '../../Tenancy/TenantContext';

@Injectable()
export class ProductRepository
  extends MultiTenantMongooseRepository<ProductSchemaClass>
  implements IProductRepository {
  constructor(
    @InjectModel(ProductSchemaClass.name)
    private readonly productModel: Model<ProductSchemaClass>,
    protected readonly tenantContext: TenantContext,
  ) {
    super(productModel, tenantContext);
  }

  /**
   * @description Lista os produtos. O filtro de empresa já é aplicado pelo getModelWithTenantFilter().
   */
  async listByCompany(_companyId: string): Promise<Product[]> {
    const docs = await this.getModelWithTenantFilter()
      .find()
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(this.toDomain);
  }

  /**
   * @description Busca um produto específico. 
   */
  async findByIdInCompany(input: {
    id: string;
    companyId: string;
  }): Promise<Product | null> {
    // Documentação: Adicionado 'new Types.ObjectId(input.id)' para garantir 
    // que o Mongoose entenda o ID do produto corretamente.
    const doc = await this.getModelWithTenantFilter()
      .findOne({ _id: new Types.ObjectId(input.id) })
      .lean();
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * @description Cria um novo produto no banco de dados.
   */
  async create(input: {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string | null;
    companyId: string;
  }): Promise<Product> {
    const created = await this.productModel.create({
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
      imageUrl: input.imageUrl ?? undefined,
      companyId: new Types.ObjectId(input.companyId),
    });
    return this.toDomain(created.toObject());
  }

  /**
   * @description Atualiza os dados de um produto existente.
   */
  async updateInCompany(input: {
    id: string;
    companyId: string;
    patch: Partial<{
      name: string;
      description: string;
      price: number;
      category: string;
      imageUrl: string | null;
    }>;
  }): Promise<Product | null> {
    const filter: FilterQuery<ProductSchemaClass> = {
      _id: new Types.ObjectId(input.id),
    };
    const updated = await this.getModelWithTenantFilter()
      .findOneAndUpdate(filter, input.patch, { new: true })
      .lean();
    return updated ? this.toDomain(updated) : null;
  }

  /**
   * @description Apaga um produto do banco de dados.
   */
  async deleteInCompany(input: {
    id: string;
    companyId: string;
  }): Promise<boolean> {
    const res = await this.getModelWithTenantFilter().deleteOne({
      _id: new Types.ObjectId(input.id),
    });
    return res.deletedCount === 1;
  }

  /**
   * @description Faz uma busca por texto (nome ou descrição) dentro dos produtos da empresa.
   */
  async searchInCompany(input: {
    companyId: string;
    query: string;
    maxResults: number;
  }): Promise<Product[]> {
    const q = input.query.trim();
    
    let filter: FilterQuery<ProductSchemaClass> = {};
    if (q) {
      filter = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { category: { $regex: q, $options: 'i' } },
        ],
      };
    }

    const docs = await this.getModelWithTenantFilter()
      .find(filter)
      .limit(Math.max(1, Math.min(input.maxResults, 50)))
      .lean();
    return docs.map(this.toDomain);
  }

  /**
   * @description Converte o documento do Mongoose para a entidade de Domínio.
   */
  private toDomain = (doc: any): Product => {
    return new Product(
      doc._id.toString(),
      doc.name,
      doc.description,
      doc.price,
      doc.category,
      doc.imageUrl ?? null,
      doc.companyId.toString(),
    );
  }
}

/**
 * @copyright Copyright (c) 2026 Deullam - Todos os direitos reservados.
 * @license Uso Proprietário. A cópia, distribuição ou modificação deste 
 * ficheiro é estritamente proibida sem autorização prévia.
 */
