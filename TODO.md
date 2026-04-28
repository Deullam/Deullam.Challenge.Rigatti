# Lista de Tarefas do Projeto: Mini SaaS Multi-tenant com Chat IA (Versão NestJS + Mongoose)

Este documento detalha o progresso atual do projeto e as próximas etapas de desenvolvimento.

## 1. Progresso Atual (Backend)

*   **Estrutura de Projeto:** Clean Architecture implementada.
*   **Autenticação e Autorização:**
    *   [x] `LoginUseCase.ts` e `RegisterUseCase.ts` finalizados e testados.
    *   [x] `LoginUseCase.spec.ts` e `RegisterUseCase.spec.ts` criados.
    *   [x] `UserRepository` ajustado para buscas globais seguras durante o login.
*   **Infraestrutura Multi-tenant:**
    *   [x] `MultiTenantMongooseRepository` implementado com suporte a filtros automáticos e buscas globais.
    *   [x] `ProductRepository` e `UserRepository` refatorados para usar a base multi-tenant.
    *   [x] Testes unitários para repositórios multi-tenant criados (`UserRepository.spec.ts`).
    *   [x] `TenantInterceptor` e `TenantContext` revisados e configurados globalmente.
*   **CRUD de Produtos:**
    *   [x] `ListProductsUseCase` finalizado e testado.
    *   [x] `ListProductsUseCase.spec.ts` criado.
    *   [x] `GetProductUseCase` finalizado e testado.
    *   [ ] Finalizar `CreateProductUseCase`, `UpdateProductUseCase`, `DeleteProductUseCase`.

## 2. Próximos Passos (Plano de Desenvolvimento Detalhado)

### 2.1. Backend (NestJS + Mongoose)
*   **Finalizar CRUD de Produtos**: Completar e testar `Create`, `Update` e `Delete`.
*   **Agente de IA (Chat POST /chat)**: Integrar Vercel AI SDK e Tool Calling.
*   **Upload de Imagem**: Implementar endpoint com Multer.
*   **Seed Script**: Criar script para popular o banco.

### 2.2. Frontend (Next.js App Router)
*   [ ] Configuração base (Tailwind, shadcn/ui).
*   [ ] Telas de Login/Registro.
*   [ ] Dashboard de Produtos.
*   [ ] Tela de Chat IA.

### 2.3. Qualidade e Testes
*   [ ] Testes de E2E garantindo isolamento total entre Tenants.
