# Submission — CollabDocs

## Candidate / project

Ajaia junior engineer take-home: collaborative document editor MVP.

## Repository

https://github.com/charliethebrown12/collabdocs

## What works

- Create / rename / edit / save / reopen documents (Tiptap JSON in Postgres)
- Bold, italic, underline, H1–H3, bulleted & numbered lists
- Import `.txt` and `.md` → new document
- Seeded users **Alice Demo** and **Bob Demo**
- Owned vs Shared list sections
- Owner sharing (`read` / `write`) with server-side enforcement
- Validation + error surfacing in UI and API
- Automated tests (`npm test`)

## Incomplete / known gaps

- Demo identity switcher is **not** real auth (clearly labeled)
- Supabase anon/service_role keys were not provided; app uses server + `DATABASE_URL` instead of Supabase JS client / RLS
- Live deployment URL: see README / PR once deploy credentials are available

## How reviewers should test

1. `cp .env.example .env` and set `DATABASE_URL` (pooler recommended)
2. `npm install && npm run db:schema && npm run dev`
3. Open http://localhost:5173
4. As Alice: create a doc, format text, save, reload
5. Share with Bob → switch user → open under **Shared with me**
6. Import a `.md` or `.txt` file
7. `npm test`

## Live URL

https://collabdocs-orpin.vercel.app/

Requires Vercel Production env var `DATABASE_URL` (Supabase Postgres pooler URI). Without it, `/api/*` fails while the static UI still loads.

## Design notes for production

Replace `X-Demo-User-Id` with authenticated sessions. Keep server permission checks or migrate to Postgres RLS with the same rules.
