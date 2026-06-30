# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Multi-tenant SaaS where companies manage a product catalog and expose a generative-AI sales agent that answers questions by querying the company's **real** MongoDB data via tool calling (not from model memory). Tenant data isolation is enforced at the infrastructure layer, not by developer convention.

Monorepo: `backend/` (NestJS) + `frontend/` (React/Vite), orchestrated with Docker Compose. The codebase comments and docs are mostly in Brazilian Portuguese.

## Commands

All `make` targets run from the repo root and wrap `docker-compose`.

| Task | Command |
| :--- | :--- |
| Run full stack (build + up) | `make start` (frontend → `:3000`, backend → `:3001`, mongo → `:27017`) |
| Seed DB (TechCorp/FoodCorp tenants, users, products) | `make seed` — **required** before first login |
| Mongo only (for native local dev) | `make start-mongo` |
| Tail logs | `make logs` / `make logs-mongo` |
| Rebuild images (after dependency changes) | `make rebuild` |
| Wipe DB volume | `make clean` (destructive) |

`make seed` runs `node dist/scripts/seed.js` inside the backend container, so the backend must be **built** (`make start` does this) before seeding.

### Backend (`cd backend`)
- Dev server (watch, SWC): `npm run start:dev`
- Build: `npm run build` (NestJS, compiles to `dist/`)
- Lint: `npm run lint` (ESLint, `--max-warnings=0`)
- Test: `npm test` / single file: `npx jest path/to/file.spec.ts` / `npm run test:watch`
- Tests use `mongodb-memory-server` (no live Mongo needed for unit/integration tests).
- List available Gemini models (when the chat model id breaks): `node Tests/list_models.js` (needs `GEMINI_API_KEY`).

### Frontend (`cd frontend`)
- Dev server: `npm run dev` (Vite on `:8080` when run natively; the Docker container serves `:3000`)
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm test` (Vitest, jsdom) / single file: `npx vitest run src/path/File.test.ts`

### Environment
Both `backend/` and `frontend/` need a `.env` (copy from each `.env.example`). Backend **requires** `GEMINI_API_KEY` for chat, plus `MONGODB_URI`, `JWT_SECRET`. Note the Vite frontend reads `import.meta.env.API_URL` (not the conventional `VITE_` prefix) — see `frontend/src/lib/api.ts`.

## Architecture

### Multi-tenancy = the core invariant
Tenant isolation is the most important thing to preserve. Data is scoped to a `companyId` automatically; never rely on callers to pass/filter it. The chain:

1. `JwtStrategy` (`Presentation/Http/Auth/JwtStrategy.ts`) validates the Bearer token and produces `{ userId, companyId, role }` as `req.user`.
2. `TenantInterceptor` (global, registered in `main.ts`) reads `req.user` and calls `TenantContext.run({...}, next)`, storing the tenant in `AsyncLocalStorage` for the duration of the request. Public routes (no `req.user`) skip context init.
3. `MultiTenantMongooseRepository` (`Infrastructure/Database/Mongoose/`) base class exposes `getModelWithTenantFilter()`, which reads `companyId` from `TenantContext` and applies `.where('companyId', ObjectId)` to every query. Concrete repos (e.g. `ProductRepository`) extend it and must use this for all tenant-scoped reads/writes.
4. `getGlobalModel()` bypasses the filter — only for flows where `companyId` is unknown (e.g. login). Treat any new use of it as a security-sensitive change.

When adding a repository method that touches tenant data, go through `getModelWithTenantFilter()`. The AI chat tool is the highest-risk surface: it must only ever see the calling tenant's products.

### Backend layering (Clean Architecture, `backend/src/`)
`Domain/` (entities, enums, repo interfaces like `IProductRepository`) → `Application/` (use cases + DTOs, one folder per feature) → `Infrastructure/` (Mongoose schemas, concrete repositories, JWT/Bcrypt, `TenantContext`) → `Presentation/` (controllers, guards, decorators, and `Modules/RootModule.ts` = the composition root).

- **DI tokens**: interfaces are bound via `Symbol()` tokens in `Shared/IoC/tokens.ts` (e.g. `TOKENS.IProductRepository`). All providers are wired in `RootModule.ts`; `app.module.ts` only delegates to it and serves `/uploads` statically.
- **RBAC**: `@Roles('admin')` decorator + `RolesGuard`. `admin` = full product CRUD; `user` = read + chat only.

### AI chat (tool calling + SSE streaming)
- `Application/Chat/UseCases/ChatUseCase.ts` is the brain. Uses Vercel **AI SDK** (`ai@6`) + `@ai-sdk/google`, model `gemma-4-31b-it`. It exposes one tool `search_company_products` whose `execute` calls `productRepository.searchInCompany({ companyId, ... })` — the system prompt forbids the model from answering catalog questions without calling it. `stopWhen: stepCountIs(5)` enables the tool-call → tool-result → text multi-step.
- AI SDK v6 specifics already handled here: system prompt goes via the `system` property (filter out `role:'system'` messages); text chunks use `chunk.text` (not `textDelta`); iterate `result.fullStream` (not `textStream`) so tool steps flow through; `onError` is needed because the SDK swallows errors silently.
- `ChatController.ts` streams over **SSE**, re-wrapping deltas into an OpenAI-style `{ choices: [{ delta: { content } }] }` shape and terminating with `data: [DONE]`. Errors are pushed into the stream as a content delta rather than thrown.

### Frontend (`frontend/src/`)
Also Clean-Architecture-shaped: `domain/` → `application/` (use cases) → `infrastructure/` (repositories) → `presentation/` (pages/components) with composition roots in `composition/` wiring concrete repos into use cases.

- **Two structures coexist.** The active app (`App.tsx`) routes to `presentation/` pages (`LoginPage`, `ProductsPage`, `ChatPage`) — this is the current code. The older `pages/` directory (`Dashboard.tsx`, `Chat.tsx`, etc.) and the `ui/` shadcn primitives are Lovable-scaffolded leftovers; only `pages/Index.tsx` is still routed. Prefer the `presentation/` + `composition/` path when editing features.
- **Nest vs Supabase repositories.** `infrastructure/` contains both `Nest*` and `Supabase*` repository implementations. The composition roots select the **Nest** ones (`composition/chat.ts`, `composition/products.ts` → `Nest*`); auth uses `NestAuthRepository` + `SupabaseProfileRepository`. The NestJS backend is the source of truth — Supabase repos are alternates; check the `composition/` file to see which is actually wired before changing behavior.
- API client: `lib/api.ts` (axios) attaches the `access_token` from `localStorage` and redirects to `/login` on 401.

## Conventions
- All source files carry a proprietary copyright/license header block — keep it when creating new files in the established style.
- Stack choices (and their trade-offs) are documented in `README.md`: MongoDB (flexible catalog schema, no native RLS), NestJS (DI + interceptors for tenancy), Zustand, SSE over WebSockets. Known risks (AsyncLocalStorage overhead, no-RLS discipline, LLM external dependency, Google model-id churn) are listed there too.
