
import { NestProductRepository } from '@/infrastructure/products//NestProductRepository';
// import { SupabaseProductImageRepository } from '@/infrastructure/SupabaseProductImageRepository'; // Se mantiver o Supabase para imagens
import { NestProductImageRepository } from '@/infrastructure/products/NestProductImageRepository';
import { ProductUseCases } from '@/application/products/ProductUseCases';

// Instanciamos os novos repositórios do NestJS
const productRepository = new NestProductRepository();

// Use o repositório de imagem que escolheu no Passo 2
const imageRepository = new NestProductImageRepository();

// Injetamos na camada de casos de uso (que a sua página React consome)
export const productUseCases = new ProductUseCases(
  productRepository,
  imageRepository
);