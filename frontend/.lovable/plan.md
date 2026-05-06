
# Mini SaaS Multi-Tenant — Plan

A complete multi-tenant SaaS where companies manage their product catalog and chat with an AI agent that can search **only their own** products via tool calling, with token-by-token streaming.

> **Stack note:** Built on Lovable's stack (React + Vite + Tailwind + shadcn + Lovable Cloud + Lovable AI) instead of Next.js/NestJS/MongoDB/Docker, since Lovable doesn't support those. All product requirements are preserved; tenant isolation will actually be **stricter** (database-enforced via Postgres RLS rather than middleware).

---

## 1. Data model (Postgres via Lovable Cloud)

- **companies** — `id, name, created_at`
- **profiles** — `id (= auth user id), email, companyId, created_at` (auto-created on signup via trigger)
- **user_roles** — `id, user_id, companyId, role` enum (`admin` | `user`) — separate table to prevent privilege escalation
- **products** — `id, companyId, name, description, price, category, image_url, created_at, updated_at`

**Tenant isolation (the "Golden Rule"):**
Every table with `companyId` gets RLS policies that only allow rows where `companyId = (select companyId from profiles where id = auth.uid())`. This is enforced by the database — no middleware needed, and it's impossible to bypass from any client. A `SECURITY DEFINER` function `has_role(user_id, companyId, role)` powers admin-only checks.

**RBAC:**
- `admin` → full CRUD on `products` (within their company)
- `user` → read-only on `products`
- Both roles → can use chat

---

## 2. Authentication

- Email + password auth (Lovable Cloud)
- Signup flow asks for: email, password, company name (creates new company) **or** join existing company via invite (out of scope for v1 — seed handles this)
- Session managed with `onAuthStateChange`; protected routes redirect to `/login`

---

## 3. Pages & UX

**`/login`** — Polished card-based login + signup tabs, gradient background, responsive.

**`/dashboard`** — Protected. Product grid (cards with image, name, category, price, description).
- Search + category filter
- Admin only: "New product" button, edit/delete actions on each card
- Product form dialog (shadcn) with image upload to Lovable Cloud Storage → returns public URL stored in `image_url`

**`/chat`** — ChatGPT-style interface.
- Message list with markdown rendering (`react-markdown`)
- Token-by-token streaming via SSE
- Shows tool calls inline ("🔍 Searching products...") when the agent invokes `search_company_products`
- Auto-scroll, input at bottom, loading indicator

**Global:**
- Top nav with Dashboard / Chat links, user menu (email, role badge, logout), **light/dark theme toggle**
- Dark mode native via shadcn + `next-themes` pattern
- Theme + auth state in React Context

---

## 4. AI chat with tool calling + streaming

**Edge function `chat`** (Deno, deployed automatically):
1. Validates JWT, extracts `user_id` → looks up `companyId`
2. Calls Lovable AI Gateway (`google/gemini-3-flash-preview` by default) with:
   - System prompt explaining the agent helps users explore the company catalog
   - Full conversation history from client
   - **Tool definition**: `search_company_products(query, category?, max_price?)`
   - `stream: true`
3. When the model emits a tool call, the function executes the DB query **server-side using the resolved `companyId`** (client cannot tamper with tenant scope), feeds results back, and continues streaming
4. Streams SSE chunks back to the browser; client parses line-by-line and updates the last assistant message progressively

This guarantees the agent can never see another company's products, even if prompt-injected.

---

## 5. Seed data

A one-click "Seed demo data" button on the login page (and an idempotent edge function) creates:
- **TechCorp** with `admin@techcorp.com` / `user@techcorp.com` + 10 tech products
- **FoodCorp** with `admin@foodcorp.com` / `user@foodcorp.com` + 10 food products
- All passwords: `Demo1234!`

Credentials displayed on the login page in a "Demo accounts" panel for instant testing.

---

## 6. Documentation

A `README.md` covering:
- One-click run (it's already running in Lovable preview — no Docker needed)
- All 4 seed credentials
- Architecture decisions: why RLS beats middleware for multi-tenant, how the edge function enforces `companyId` on tool calls, how SSE streaming + line-buffered parsing works, RBAC via separate `user_roles` table

---

## What you get vs. original spec

| Original requirement | Delivered as |
|---|---|
| Next.js frontend | React + Vite + TS + Tailwind + shadcn (same UX, dark mode native) |
| NestJS backend + JWT guards | Lovable Cloud edge functions + Supabase Auth JWT |
| MongoDB + Mongoose | Postgres + typed client |
| Multi-tenant middleware | Postgres RLS (database-enforced, stricter) |
| Admin/User roles | `user_roles` table + `has_role()` SECURITY DEFINER |
| Product CRUD + image upload | Same, via Lovable Cloud Storage |
| OpenAI tool calling + SSE streaming | Lovable AI (Gemini/GPT-5) tool calling + SSE streaming |
| Seed script | Idempotent seed edge function + button |
| Jest tests | (Optional) Vitest tests for utilities |
| docker-compose | N/A — runs in Lovable preview, deploys with one click |

Click **Implement plan** to build it.
