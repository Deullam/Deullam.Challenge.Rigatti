/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Serviço para popular o banco de dados com dados iniciais (Seed).
 */

import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CompanySchemaClass } from '../Infrastructure/Database/Mongoose/Schemas/CompanySchema';
import { UserSchemaClass } from '../Infrastructure/Database/Mongoose/Schemas/UserSchema';
import { ProductSchemaClass } from '../Infrastructure/Database/Mongoose/Schemas/ProductSchema';
import { IHasher } from '../Infrastructure/Security/Hashing/IHasher';
import { TOKENS } from '../Shared/IoC/tokens';
import { hash } from 'bcrypt'; // Usando bcrypt diretamente para o seed, se não houver IHasher injetado


@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(CompanySchemaClass.name) private companyModel: Model<CompanySchemaClass>,
    @InjectModel(UserSchemaClass.name) private userModel: Model<UserSchemaClass>,
    @InjectModel(ProductSchemaClass.name) private productModel: Model<ProductSchemaClass>,
    @Inject(TOKENS.IHasher) private readonly hasher: IHasher, // Injetar IHasher se disponível
  ) { }

  async seedData() {
    this.logger.log('Starting data seeding...');

    // Limpa dados existentes (opcional, mas útil para desenvolvimento)
    await this.companyModel.deleteMany({});
    await this.userModel.deleteMany({});
    await this.productModel.deleteMany({});

    // 1. Criação das Empresas
    const techCorp = await this.companyModel.create({ name: 'TechCorp' });
    const foodCorp = await this.companyModel.create({ name: 'FoodCorp' });

    // Hash de senha para os usuários (usando IHasher se injetado, senão bcrypt diretamente)
    const passwordHash = this.hasher ? await this.hasher.hash('Demo1234!') : await hash('Demo1234!', 10);

    // 2. Criação dos Usuários
    // TechCorp Users
    await this.userModel.create({
      email: 'admin@techcorp.com',
      passwordHash,
      role: 'admin',
      companyId: techCorp._id,
      companyName: 'TechCorp',
    });
    await this.userModel.create({
      email: 'user@techcorp.com',
      passwordHash,
      role: 'user',
      companyId: techCorp._id,
      companyName: 'TechCorp',
    });

    // FoodCorp Users
    await this.userModel.create({
      email: 'admin@foodcorp.com',
      passwordHash,
      role: 'admin',
      companyId: foodCorp._id,
      companyName: 'FoodCorp',
    });
    await this.userModel.create({
      email: 'user@foodcorp.com',
      passwordHash,
      role: 'user',
      companyId: foodCorp._id,
      companyName: 'FoodCorp',
    });

    // 3. Criação dos Produtos (TechCorp)
    const techProducts = [
      { name: 'Quantum Laptop X1', description: 'Ultraportátil de 14 polegadas com 32GB de RAM e 1TB de SSD.', price: 9499.00, category: 'notebooks', companyId: techCorp._id },
      { name: 'Nebula Wireless Mouse', description: 'Mouse Bluetooth ergonômico com clique silencioso.', price: 249.00, category: 'acessórios', companyId: techCorp._id },
      { name: 'Aurora 4K Monitor', description: 'Tela IPS de 27 polegadas com dock USB-C.', price: 2749.00, category: 'monitores', companyId: techCorp._id },
      { name: 'Pulse Mechanical Keyboard', description: 'Switches hot-swappable e iluminação RGB.', price: 799.00, category: 'acessórios', companyId: techCorp._id },
      { name: 'Echo Noise-Cancelling Headphones', description: 'Headphone over-ear, 40h de bateria, ANC.', price: 1499.00, category: 'áudio', companyId: techCorp._id },
      { name: 'Vortex Webcam Pro', description: 'Webcam 4K com rastreamento por IA e microfones.', price: 999.00, category: 'acessórios', companyId: techCorp._id },
      { name: 'Helios USB-C Hub', description: '8 em 1 com HDMI, Ethernet e leitor SD.', price: 399.00, category: 'acessórios', companyId: techCorp._id },
      { name: 'Photon Smartphone 5G', description: 'Tela OLED de 6,7 polegadas e câmera de 200MP.', price: 4999.00, category: 'celulares', companyId: techCorp._id },
      { name: 'Atlas Tablet 11', description: 'Compatível com caneta, tela de 120Hz.', price: 3249.00, category: 'tablets', companyId: techCorp._id },
      { name: 'Cosmo Smart Watch', description: 'Frequência cardíaca, GPS e bateria de 7 dias.', price: 1249.00, category: 'vestíveis', companyId: techCorp._id },
    ];
    await this.productModel.insertMany(techProducts);

    // 4. Criação dos Produtos (FoodCorp)
    const foodProducts = [
      { name: 'Truffle Mac & Cheese', description: 'Macarrão parafuso cremoso com lascas de trufa negra.', price: 69.00, category: 'pratos principais', companyId: foodCorp._id },
      { name: 'Wagyu Smash Burger', description: 'Hambúrguer duplo, cebola caramelizada e pão brioche.', price: 89.00, category: 'pratos principais', companyId: foodCorp._id },
      { name: 'Margherita Sourdough Pizza', description: 'Tomates San Marzano, fior di latte e manjericão.', price: 79.00, category: 'pizzas', companyId: foodCorp._id },
      { name: 'Korean Fried Chicken', description: 'Duplamente frito, glaceado com gochujang e gergelim.', price: 65.00, category: 'pratos principais', companyId: foodCorp._id },
      { name: 'Avocado Citrus Salad', description: 'Mix de folhas, laranja sanguínea e crocante de pistache.', price: 55.00, category: 'saladas', companyId: foodCorp._id },
      { name: 'Miso Glazed Salmon Bowl', description: 'Arroz japonês, edamame e gengibre em conserva.', price: 85.00, category: 'bowls', companyId: foodCorp._id },
      { name: 'Spicy Tonkotsu Ramen', description: 'Caldo de porco de 12h, ovo mollet e nori.', price: 75.00, category: 'sopas', companyId: foodCorp._id },
      { name: 'Molten Chocolate Lava Cake', description: 'Bolo quente com recheio de chocolate amargo e baunilha.', price: 45.00, category: 'sobremesas', companyId: foodCorp._id },
      { name: 'Matcha Tiramisu', description: 'Mascarpone, biscoito champanhe e matcha cerimonial.', price: 49.00, category: 'sobremesas', companyId: foodCorp._id },
      { name: 'Hibiscus Iced Tea', description: 'Preparado na casa com limão e hortelã.', price: 25.00, category: 'bebidas', companyId: foodCorp._id },
    ];
    await this.productModel.insertMany(foodProducts);

    this.logger.log('Data seeding completed successfully.');
  }
}
