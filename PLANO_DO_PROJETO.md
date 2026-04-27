# Cérebro do Projeto: Mini SaaS Multi-tenant com Chat IA

## 1. Visão Geral e Stack
Aplicação Fullstack com isolamento total entre empresas (Multi-tenant).
- **Backend:** NestJS, TypeScript, **Mongoose** (MongoDB).
- **Frontend:** Next.js App Router (React), TypeScript, Tailwind CSS, shadcn/ui.
- **IA:** Vercel AI SDK (Gemini) com Tool Calling e Streaming SSE.
- **Infra:** Docker Compose (MongoDB, Backend, Frontend).

## 2. Arquitetura Backend (Clean Architecture + NestJS)
Aproveitando o sistema de injeção de dependência do NestJS com Tokens (IoC).
- `Domain/`: Entidades, Enums e Interfaces (ex: `IProductRepository`).
- `Application/`: Use Cases (regras de negócio) e DTOs.
- `Infrastructure/`: Mongoose Schemas (`@nestjs/mongoose`), implementações de repositórios, JWT Auth, Contexto Multi-tenant.
- `Presentation/`: Controllers, Guards de permissão e Módulos.
- `Shared/`: Tokens de IoC (`Symbol()`).

## 3. Regra de Ouro (Multi-tenant e Auth)
- **Autenticação:** JWT incluindo `company_id` e `role` (admin, user).
- **Tenant Context:** Middleware ou Interceptor do NestJS extrai o `company_id` do usuário e injeta via `AsyncLocalStorage`.
- **Isolamento de Dados:** TODO repositório do Mongoose DEVE obrigatoriamente buscar o `company_id` no AsyncLocalStorage e aplicá-lo nos filtros das queries. A Empresa A nunca vê dados da Empresa B.

## 4. Funcionalidades Chave
- **Auth:** Registro e Login de usuários.
- **Produtos:** CRUD completo (nome, descrição, preço, categoria). Guard do NestJS garante que apenas `admin` cria/edita/deleta; `user` só visualiza.
- **Upload de Imagem (Bônus):** Endpoint usando Multer para salvar imagens localmente.
- **Seed Script:** Script do NestJS rodando na inicialização para criar 2 empresas, 1 admin e 1 user por empresa, e 10 produtos cada.

## 5. Agente de IA (Chat POST /chat)
- Protegido por AuthGuard.
- Utiliza **Tool Calling** (ferramenta `search_company_products` tipada com Zod).
- A tool consulta o `IProductRepository`, que por sua vez usa o Mongoose filtrando pelo `company_id` do Tenant Context.
- Resposta enviada via **Streaming (SSE)** para o frontend.

## 6. Qualidade e Testes
- **Testes (Bônus):** Jest para testar Use Cases e garantir que o repository fake respeita o isolamento.
- **Auto-revisão IA:** Sempre revisar isolamento de dados antes de gerar código.

## 7. Padrões de Código e Versionamento (OBRIGATÓRIO)
- **Assinatura de Arquivos:** TODO novo arquivo de código criado deve, obrigatoriamente, iniciar com o seguinte cabeçalho na linha 1:
  ```typescript
  /**
   * @author Deullam Justi
   * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
   * @description [Breve descrição da função do arquivo]
   */