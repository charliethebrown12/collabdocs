# AI workflow

How this CollabDocs MVP was produced with a Cursor cloud agent.

## Approach

1. **Inspect credentials** in the project store (Supabase URL + DB password). Anon/service_role keys were missing.
2. **Probe connectivity**: direct `db.*.supabase.co:5432` was IPv6-only and unreachable from the agent host; the **Supabase pooler** (IPv4) worked.
3. **Choose vertical slice**: Express API + `pg` against Postgres so permissions are server-enforced without waiting on anon keys.
4. **Schema first**: create `users` / `documents` / `document_shares`, seed Alice & Bob.
5. **Implement incrementally**: API routes → React list/editor → sharing → import → tests → docs.
6. **Verify**: run `npm test` and smoke the API; only report results that actually ran.

## Tools / patterns used

- Vite React-TS scaffold, Tailwind v4, Tiptap StarterKit + Underline
- Zod validation on write endpoints
- Vitest for pure permission helpers + API access-control integration test (supertest + live DB when `DATABASE_URL` is set)
- Explicit prototype labeling for the demo identity switcher

## Tradeoffs

- **Depth over polish**: functional UI, not a design showcase
- **No stretch features** (realtime CRDT, presence, comments) until core CRUD/share/import worked
- **Secrets**: only `.env.example` is committed; local `.env` is gitignored
- **Deploy**: Vercel config included; live URL depends on deploy credentials being available

## What I would do next with more time

- Wire Supabase Auth + RLS once anon keys exist
- Add CI workflow for `npm test` / `npm run build`
- Persist autosave + conflict handling for concurrent editors
