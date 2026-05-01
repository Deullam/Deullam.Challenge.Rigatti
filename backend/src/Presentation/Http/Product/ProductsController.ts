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
import { GetProductUseCase } from '../../../Application/Product/UseCases/GetProductUseCase';
import { ListProductsUseCase } from '../../../Application/Product/UseCases/ListProductsUseCase';
import { UpdateProductUseCase } from '../../../Application/Product/UseCases/UpdateProductUseCase';
import { RequestUser } from '../../../Shared/IoC/http';
import { JwtAuthGuard } from '../Auth/JwtAuthGuard';
import { Roles } from '../Auth/RolesDecorator';
import { RolesGuard } from '../Auth/RolesGuard';

// Documentação: Tipo customizado que garante que a requisição (req) sempre terá os dados do usuário autenticado.
type RequestWithUser = { user: RequestUser };

// Documentação: @Controller define o caminho base da URL. Ex: http://localhost:3000/products
// Documentação: @UseGuards(JwtAuthGuard) tranca TODAS as rotas desta classe. Sem Token, sem acesso!
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly listProducts: ListProductsUseCase,
    private readonly getProduct: GetProductUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) { }

  /**
   * @description Rota para listar todos os produtos da empresa do usuário logado.
   * Rota HTTP: GET /products
   */
  @Get()
  async list(@Req() req: RequestWithUser) {
    return this.listProducts.execute({ companyId: req.user.companyId });
  }

  /**
   * @description Rota para buscar os detalhes de um único produto específico.
   * Rota HTTP: GET /products/:id (Ex: /products/123)
   */
  @Get(':id')
  async get(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.getProduct.execute({ companyId: req.user.companyId, id });
  }

  /**
   * @description Rota para criar um novo produto. Protegida apenas para Administradores.
   * Rota HTTP: POST /products
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Req() req: RequestWithUser, @Body() dto: CreateProductDto) {
    return this.createProduct.execute({ companyId: req.user.companyId, ...dto });
  }

  /**
   * @description Rota para atualizar informações de um produto. Protegida apenas para Administradores.
   * Rota HTTP: PATCH /products/:id
   */
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(@Req() req: RequestWithUser, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProduct.execute({ companyId: req.user.companyId, id, patch: dto });
  }

  /**
   * @description Rota para deletar um produto do catálogo. Protegida apenas para Administradores.
   * Rota HTTP: DELETE /products/:id
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.deleteProduct.execute({ companyId: req.user.companyId, id });
  }
}