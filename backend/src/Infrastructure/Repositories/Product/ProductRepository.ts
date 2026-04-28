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
    private readonly tenantContext: TenantContext,
  ) {
    super(productModel, tenantContext);
  }

  async listByCompany(companyId: string): Promise<Product[]> {
    // return this.productModel
    //   .find({ companyId: new Types.ObjectId(companyId) })
    //   .sort({ createdAt: -1 })
    //   .lean();
    const docs = await this.getModelWithTenantFilter()
      .find()
      .sort({ createdAt: -1 })
      .lean();
    return docs.map(this.toDomain);
  }

  async findByIdInCompany(input: {
    id: string;
    companyId: string;
  }): Promise<Product | null> {
    // const doc = await this.productModel
    //   .findOne({ _id: input.id, companyId: new Types.ObjectId(input.companyId) })
    //   .lean();
    const doc = await this.getModelWithTenantFilter()
      .findOne({ _id: input.id })
      .lean();
    return doc ? this.toDomain(doc) : null;
  }

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
      companyId: new Types.ObjectId(input.companyId), // Ainda precisamos do companyId aqui no create
    });
    return this.toDomain(created.toObject());
  }

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
      // companyId: new Types.ObjectId(input.companyId), // Removido, pois será adicionado pelo getModelWithTenantFilter
    };
    const updated = await this.getModelWithTenantFilter()
      .findOneAndUpdate(filter, input.patch, { new: true })
      .lean();
    return updated ? this.toDomain(updated) : null;
  }

  async deleteInCompany(input: {
    id: string;
    companyId: string;
  }): Promise<boolean> {
    // const res = await this.productModel.deleteOne({
    //   _id: new Types.ObjectId(input.id),
    //   companyId: new Types.ObjectId(input.companyId),
    // });
    const res = await this.getModelWithTenantFilter().deleteOne({
      _id: new Types.ObjectId(input.id),
    });
    return res.deletedCount === 1;
  }

  async searchInCompany(input: {
    companyId: string;
    query: string;
    maxResults: number;
  }): Promise<Product[]> {
    const q = input.query.trim();
    if (!q) return [];
    // const docs = await this.productModel
    //   .find({
    //     companyId: new Types.ObjectId(input.companyId),
    //     $or: [{ name: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }],
    //   })
    const docs = await this.getModelWithTenantFilter()
      .find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
        ],
      })
      .limit(Math.max(1, Math.min(input.maxResults, 50)))
      .lean();
    return docs.map(this.toDomain);
  }

  private toDomain(doc: any): Product {
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

