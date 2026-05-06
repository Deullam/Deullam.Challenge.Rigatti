# Deullam Challenge Rigatti IA — Desafio Fullstack (SaaS Multi-tenant)

Este repositório contém a entrega do desafio técnico para a posição de Desenvolvedor Fullstack. Trata-se de um Mini SaaS Multi-tenant onde empresas cadastram produtos e interagem com um Agente de IA que consulta dados reais do banco, respeitando rigorosamente o isolamento entre empresas.

---

## 🎯 Requisitos do Desafio

O desafio solicitava a criação de um mini SaaS com as seguintes entregas:

- **Backend (Node.js + NestJS + MongoDB):**
  - Autenticação JWT com roles (`admin`, `user`).
  - Multi-tenant rigoroso (Empresa A não pode ver Empresa B, travado via middleware/contexto).
  - CRUD de Produtos (nome, descrição, preço, categoria, imagem URL).
  - Endpoint `POST /chat` usando LLM e Tool Calling para consultar produtos do tenant ativo.
  - Middleware de permissões (Admin gerencia, User visualiza/chama IA).
  - Seed Script.

- **Frontend (React + Vite + TypeScript):**
  - Tela de Login/Registro.
  - Dashboard para listagem/CRUD de produtos.
  - Tela de Chat IA fluida e responsiva.
  - UI moderna e caprichada.

- **Bônus (Todos implementados):**
  - TypeScript no backend.
  - Streaming (SSE) da resposta do Agente.
  - Testes E2E/Integração automatizados.
  - Dark Mode.
  - Docker Compose para orquestração da infra de apoio (MongoDB).

---

## 🚀 Setup Rápido (Rodando via Makefile)

Para facilitar totalmente a sua vida na hora da avaliação, criei um `Makefile` com comandos simplificados.

### Pré-requisitos
- **Docker** e **Docker Compose**
- **Node.js** (v18+)
- Variáveis locais (`.env` no backend com `GEMINI_API_KEY` e `.env.local` no frontend).

### Comandos Facilitadores (Raiz do Projeto)

- `make start`: Sobe toda a infraestrutura via Docker Compose (Banco, Backend e Frontend).
- `make stop`: Para todos os serviços (containers) sem apagar dados.
- `make down`: Remove os contêineres e redes (mantém os dados salvos nos volumes).
- `make logs`: Acompanha os logs de todos os serviços em tempo real.
- `make rebuild`: Limpa o cache das imagens e reconstrói os containers do zero.
- `make clean`: **PERIGO!** Remove os contêineres e **apaga o volume de dados** do MongoDB.
- `make start-mongo`: Sobe apenas o container do MongoDB em background (útil se for rodar o backend via npm).
- `make stop-mongo`: Para apenas o MongoDB.
- `make logs-mongo`: Verifica os logs isolados do MongoDB.
- `make seed`: Roda o script de semeadura do banco de dados (Cria empresas simuladas, usuários e produtos).
- `make help`: Mostra todos os comandos disponíveis no terminal.

### 1. Inicialização via Docker (Recomendado)

A forma mais rápida de rodar o projeto inteiro com apenas um comando:

1. Na raiz do projeto, execute: `make start`
2. Aguarde os containers subirem.
3. Na raiz, rode a semeadura de dados: `make seed` (opcional).
4. Acesse a aplicação em: `http://localhost:3000`

### 2. Inicialização Local (Manual)

Caso prefira rodar o Node.js e o Vite nativamente na sua máquina:

1. Suba apenas o banco de dados: `make start-mongo`
2. No **backend**: rode `npm install` e `npm run start:dev` (Certifique-se de popular o `.env`)
3. No **frontend**: rode `npm install` e `npm run dev`
4. Na raiz: rode `make seed` (opcional caso queira usar os dados mockados).
5. Acesse a aplicação em: `http://localhost:8080`

## 🏗️ Decisões Arquiteturais e Abordagem

### 1. Sobre as Tecnologias Escolhidas (O "Upgrade" Tecnológico)
O desafio solicitava **Express puro** no backend e **React** no frontend. Optei por ir além e utilizar **NestJS** e **Vite**, e aqui está o porquê:
- **NestJS em vez de Express:** O NestJS roda sobre o Express por baixo dos panos, mas traz uma fundação arquitetural de nível Enterprise. Ele fornece Injeção de Dependências (IoC), Interceptors e Guards nativos. Para um sistema Multi-tenant, espalhar middlewares pelo Express abre margem para erros humanos (esquecer de passar a variável). Com o NestJS, consegui travar o `companyId` no nível do repositório de forma automática e inviolável.
- **Vite + React:** O Vite entrega o ecossistema React com uma performance de build e HMR incrivelmente superior às abordagens tradicionais. Como a aplicação é um SaaS (fechado atrás de login), não havia necessidade de frameworks pesados com SSR, tornando uma SPA turbinada com Vite a melhor escolha para a Experiência do Desenvolvedor (DX) e do Usuário.

### 2. Backend: Clean Architecture
Escolhi estruturar o código dividindo responsabilidades em `Domain`, `Application`, `Infrastructure` e `Presentation`. 
**Por quê?** Os Casos de Uso (`UseCases`) ficam completamente agnósticos ao framework web e ao banco de dados. Isso torna a troca de implementações (ex: mudar o provedor de IA ou de banco de dados) extremamente simples e facilita a criação de testes unitários.

### 3. A "Regra de Ouro": Multi-tenant no Nível da Infraestrutura
Em vez de depender dos desenvolvedores lembrarem de passar o `companyId` em todos os controllers e repositórios (o que gera risco de vazamento de dados), implementei uma trava global:
- Um **Interceptor** do NestJS extrai o `companyId` do token JWT e o coloca no contexto da thread assíncrona (`AsyncLocalStorage` do Node.js).
- O `MultiTenantMongooseRepository` captura esse ID e injeta **automaticamente** como filtro base em todas as queries.
**Por quê?** Segurança By Design. É impossível que a Empresa A veja dados da Empresa B, mesmo que alguém esqueça de escrever a query corretamente no nível de aplicação.

### 4. Agente de IA: Vercel AI SDK + Tool Calling Server-side
Para a integração com IA, utilizei o Vercel AI SDK 6.0 com o modelo Google Gemma-4. A lógica funciona assim:
- A interface chama a rota `POST /chat`.
- O backend injeta o *System Prompt* com regras rígidas de negócio (ex: "Consulte o catálogo antes de responder").
- O modelo emite um *Tool Call* para a função `search_company_products`.
- Essa execução acontece **no Backend** de forma segura (herdando a trava Multi-tenant do banco de dados).
- A resposta é enviada para o Frontend via **SSE (Server-Sent Events)** para streaming *token-by-token*.

### 4. Frontend: Vite + React + Zustand
Abandonei abordagens pesadas em prol do **Vite** para garantir um build quase instantâneo e uma DX incrível.
- **Estado Global:** `Zustand` e `Context API` para manter os dados do usuário autenticado disponíveis.
- **Estilo:** `Tailwind CSS` e `shadcn/ui` para entregar um Design System limpo, moderno, responsivo e com suporte a Dark Mode "Out of the box", atendendo aos requisitos visuais do desafio de forma profissional.

---

## 🔮 O que eu faria diferente em Produção?

Embora essa arquitetura seja escalável e muito robusta, em um ambiente de produção real (High-Scale), eu aplicaria as seguintes evoluções:

### Escala e Resiliência
- **Bancos de Dados Separados (Database-per-Tenant):** Se o número de clientes crescesse exponencialmente e exigisse compliance estrito (ex: GDPR/LGPD isolado), eu migraria do modelo lógico (filtro por `companyId` em uma coleção única) para bancos separados gerenciados por um roteador de tenant, ou utilizaria PostgreSQL com *Row-Level Security (RLS)*.
- **Filas e Workers (Redis/BullMQ):** A geração da IA e chamadas externas (Tool calling intensivo) seriam desacopladas para *background jobs*, liberando a *event loop* do NestJS para requisições de API tradicionais.

### Segurança
- **Secret Management:** As chaves (JWT Secret, API Keys da IA e MongoDB URIs) nunca estariam no `.env` do disco. Usaria soluções como AWS KMS, HashiCorp Vault ou Google Secret Manager.
- **Rate Limiting e Proteção contra Abuso (WAF):** Limitar o número de tokens e requisições no `POST /chat` por `companyId`, visto que chamadas de IA têm custo financeiro alto.

### Monitoramento e Observabilidade
- **Datadog ou New Relic:** Tracing distribuído para acompanhar requisições lentas no MongoDB.
- **Log de Prompt/Respostas da IA (LangSmith):** Uma ferramenta especializada para auditar o que o agente está respondendo aos usuários, capturar "alucinações" (hallucinations) e monitorar consumo de tokens para cálculo de margem (billing).

---

## ✅ Requisitos Atendidos (Checklist)

- [x] **Backend (Node/NestJS + MongoDB)**
- [x] **Auth JWT com Roles (`admin` e `user`)**
- [x] **Isolamento Multi-tenant (Trava Automática)**
- [x] **CRUD de Produtos** (Admin gerencia, User visualiza)
- [x] **Endpoint de Chat (`POST /chat`)** com isolamento no Tool Calling
- [x] **Frontend React (Vite) + Design Profissional**
- [x] *[Bônus]* **TypeScript no Backend e Frontend**
- [x] *[Bônus]* **Streaming SSE da resposta da IA**
- [x] *[Bônus]* **Dark Mode**
- [x] *[Bônus]* **Testes de Integração E2E (Vitest e Jest)** (Verificando o isolamento do Chat e do Banco simultaneamente!)

---
*Desafio Técnico Rigatti | Construído com ☕ e TypeScript.*
