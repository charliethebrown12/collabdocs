# CollabDocs

Lightweight collaborative document editor (Ajaia take-home MVP).

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Tiptap rich text editor
- Express API with server-enforced permissions
- Supabase PostgreSQL (`users`, `documents`, `document_shares`)

## Features

1. Create, rename, edit, save, and reopen documents (Tiptap JSON in Postgres)
2. Rich text: bold, italic, underline, headings (H1–H3), bulleted and numbered lists
3. Import **`.txt`** and **`.md`** into a new editable document
4. Two seeded demo users with **Owned** vs **Shared with me** sections
5. Owner can share a document with the other demo user (`read` or `write`)
6. Access checks run on the API (not only in the UI)
7. Validation, error handling, and automated tests

## Prototype identity switcher

The top-right **Acting as** control is a **prototype**, not real authentication. Every API request sends `X-Demo-User-Id`. Production would use authenticated identities (e.g. Supabase Auth) plus the same server permission checks (or Postgres RLS).

## Supported import types

| Extension | Format |
|-----------|--------|
| `.txt` | Plain text |
| `.md` | Markdown (headings, paragraphs, lists) |

## Setup

1. Copy `.env.example` → `.env` and set `DATABASE_URL` to your Supabase Postgres connection string. Prefer the **pooler** URL on IPv4-only hosts:

   ```text
   postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres
   ```

2. Apply schema + seed users:

   ```bash
   npm run db:schema
   ```

   Or run `supabase/schema.sql` in the Supabase SQL editor.

3. Install and run:

   ```bash
   npm install
   npm run dev
   ```

   - Web: http://localhost:5173  
   - API: http://localhost:3001  

4. Tests:

   ```bash
   npm test
   ```

## Seeded demo users

| Name | UUID |
|------|------|
| Alice Demo | `11111111-1111-4111-8111-111111111111` |
| Bob Demo | `22222222-2222-4222-8222-222222222222` |

### How to test sharing

1. Act as **Alice Demo** → create or open a document → use **Sharing** to grant **Bob Demo** write (or read) access.
2. Switch **Acting as** to **Bob Demo**.
3. Confirm the document appears under **Shared with me**.
4. Open it: write access can edit/save; read access is read-only.
5. As Bob, creating a share should fail (owner-only; API returns 403).

## Production

```bash
npm run build
npm start
```

Serves the Vite `dist/` build and `/api/*` from one Node process.

### Vercel

Production: https://collabdocs-orpin.vercel.app/

Set **Production** (and Preview if desired) env:

| Name | Purpose |
|------|---------|
| `DATABASE_URL` | Supabase Postgres pooler URI (IPv4), e.g. `postgresql://postgres.<ref>:<password>@aws-0-us-west-2.pooler.supabase.com:6543/postgres` |

Do not commit secrets. After setting env, redeploy so serverless functions pick it up. See `ARCHITECTURE.md`.

## Docs

- `ARCHITECTURE.md` — system design
- `AI_WORKFLOW.md` — how the agent built this
- `SUBMISSION.md` — assessment submission notes
