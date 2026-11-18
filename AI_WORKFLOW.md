# AI workflow

How this CollabDocs MVP was produced, and how AI tools fit into the process.

## Tools used (honest account)

| Tool | Role | Evidence / confidence |
|------|------|------------------------|
| **Cursor cloud agents** | Primary implementation: scaffold, Express API + Postgres, React/Tiptap UI, sharing, import, tests, Vercel wiring, docs | High — repo history and agent runs built the MVP and follow-up deploy harden (`#1`, `#2`) |
| **Vercel** | Hosting + Production env (`DATABASE_URL`); serverless `api/index.ts` entry | High — live URL https://collabdocs-orpin.vercel.app/ |
| **ChatGPT** | May have been used by the candidate for planning / brainstorming outside the agent runs | **Unknown** — not attested in repo history or agent transcripts; do not assume specific ChatGPT sessions |

No other AI coding tools are claimed here. This file only documents what project history supports.

## Approach (what the agents actually did)

1. **Inspect credentials** in the project store (Supabase URL + DB password). Anon/service_role keys were missing.
2. **Probe connectivity**: direct `db.*.supabase.co:5432` was IPv6-only and unreachable from the agent host; the **Supabase pooler** (IPv4) worked.
3. **Choose vertical slice**: Express API + `pg` against Postgres so permissions are server-enforced without waiting on anon keys.
4. **Schema first**: create `users` / `documents` / `document_shares`, seed Alice & Bob.
5. **Implement incrementally**: API routes → React list/editor → sharing → import → tests → docs.
6. **Deploy**: Vercel project + `DATABASE_URL` in Production; harden API when env missing; re-verify `/api/health` and smoke flows.
7. **Verify**: run `npm test` / `npm run build` and smoke the API/UI; only report results that actually ran.

## Implementation decisions (AI-assisted, human-owned scope)

- **Server API over direct Supabase client** — missing anon keys; still meets “server-enforced access.”
- **Demo identity header (`X-Demo-User-Id`)** — labeled prototype; not production auth.
- **Tiptap + Zod + Vitest** — rich text, validated writes, permission unit + API access-control tests.
- **Depth over polish / stretch** — CRUD, share, import first; no CRDT/presence/comments in MVP.
- **Secrets** — only `.env.example` committed; live secrets stay in Vercel / local `.env`.

## Verification practices

- Prefer commands that actually ran (`npm test`, `npm run build`, `curl /api/health`, browser smoke).
- Do not invent passing CI or video links.
- Document limitations (prototype auth, missing Supabase JS keys) instead of hiding them.

## What I would do next with more time

- Wire Supabase Auth + RLS once anon keys exist
- Add CI workflow for `npm test` / `npm run build`
- Persist autosave + conflict handling for concurrent editors
- Record and link the walkthrough video (`VIDEO_LINK.txt`)
