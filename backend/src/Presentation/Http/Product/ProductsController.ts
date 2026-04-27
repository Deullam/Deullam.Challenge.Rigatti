/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Controller HTTP para CRUD de produtos (multi-tenant).
 */

import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { CreateProductDto } from '../../../Application/Product/DTOs/CreateProductDto';
import { UpdateProductDto } from '../../../Application/Product/DTOs/UpdateProductDto';
import { CreateProductUseCase } from '../../../Application/Product/UseCases/CreateProductUseCase';
import { DeleteProductUseCase } from '../../../Application/Product/UseCases/DeleteProductUseCase';
import { ListProductsUseCase } from '../../../Application/Product/UseCases/ListProductsUseCase';
import { UpdateProductUseCase } from '../../../Application/Product/UseCases/UpdateProductUseCase';
import { RequestUser } from '../../../Shared/IoC/http';
import { JwtAuthGuard } from '../Auth/JwtAuthGuard';
import { Roles } from '../Auth/RolesDecorator';
import { RolesGuard } from '../Auth/RolesGuard';

type RequestWithUser = { user: RequestUser };

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {}

  @Get()
  async list(@Req() req: RequestWithUser) {
    return this.listProducts.execute({ companyId: req.user.companyId });
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Req() req: RequestWithUser, @Body() dto: CreateProductDto) {
    return this.createProduct.execute({ companyId: req.user.companyId, ...dto });
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProduct.execute({ companyId: req.user.companyId, id, patch: dto });
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.deleteProduct.execute({ companyId: req.user.companyId, id });
  }
}

