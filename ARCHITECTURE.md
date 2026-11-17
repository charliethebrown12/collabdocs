# Architecture

## Overview

CollabDocs is a small full-stack app:

- **Browser**: React SPA (Vite) with Tiptap for editing
- **API**: Express routes under `/api` enforce document access
- **Data**: Supabase-hosted PostgreSQL

```text
[React + Tiptap] --X-Demo-User-Id--> [Express API] --> [Supabase Postgres]
```

## Why an API instead of direct Supabase client?

Anon / service_role keys were not available at build time. The MVP therefore uses the **database password + connection pooler** from a trusted server process. That still meets the requirement for **server-enforced access** (equivalent intent to RLS).

Production options:

1. Keep this API and add real auth (JWT / Supabase Auth) instead of `X-Demo-User-Id`
2. Or expose tables via PostgREST with **RLS** once anon keys and auth are configured

## Schema

- `users(id, display_name)`
- `documents(id, owner_id, title, content_json, created_at, updated_at)`
- `document_shares(id, document_id, user_id, permission)` where `permission ∈ {read, write}`

Document body is Tiptap JSON in `content_json` (JSONB).

## Permission model

For a given `(document, user)`:

| Role | Read | Write | Share |
|------|------|-------|-------|
| Owner | ✓ | ✓ | ✓ |
| Share write | ✓ | ✓ | ✗ |
| Share read | ✓ | ✗ | ✗ |
| None | ✗ | ✗ | ✗ |

Checks live in `server/db.ts` (`getUserAccess`) and route handlers in `server/app.ts`. Pure helpers in `server/permissions.ts` are unit-tested.

## Identity (prototype)

The UI identity switcher selects a seeded demo user and stores the id in `localStorage`. The client sends `X-Demo-User-Id` on mutating/list document calls. This is labeled in the UI as a prototype.

## Import pipeline

`.txt` → paragraphs. `.md` → `marked` HTML → lightweight DOM walk → Tiptap JSON. Supported types are listed in the UI and README.

## Runtime

- **Development**: Vite (`5173`) proxies `/api` → Express (`3001`)
- **Production (Node)**: `npm start` serves `dist/` + API
- **Vercel**: static frontend + `api/index.ts` serverless entry; requires `DATABASE_URL`

## Key modules

| Path | Role |
|------|------|
| `src/pages/*` | List + editor screens |
| `src/components/DocumentEditor.tsx` | Tiptap surface |
| `src/api/client.ts` | Typed fetch wrapper |
| `server/app.ts` | HTTP API + validation (Zod) |
| `supabase/schema.sql` | Schema + seed users |
