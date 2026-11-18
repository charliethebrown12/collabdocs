# Submission — CollabDocs

## Candidate / project

Ajaia junior engineer take-home: collaborative document editor MVP.

## Links

| Item | URL |
|------|-----|
| **Production** | https://collabdocs-orpin.vercel.app/ |
| **Repository** | https://github.com/charliethebrown12/collabdocs |

## Confirmed deployment status

**Live production** on Vercel at the URL above (verified by this documentation pass):

- `GET /` → HTTP 200 (static UI loads)
- `GET /api/health` → HTTP 200 with body `{"ok":true,"databaseConfigured":true}`

Production requires Vercel env var `DATABASE_URL` (Supabase Postgres pooler URI). With that set, document list/create/edit/share APIs are operational. Earlier production smoke failures (HTTP 500 on `/api/users` when `DATABASE_URL` was missing) were resolved before this submission refresh.

## What works

- Create / rename / edit / save / reopen documents (Tiptap JSON in Postgres)
- Bold, italic, underline, H1–H3, bulleted & numbered lists
- Import `.txt` and `.md` → new document
- Seeded users **Alice Demo** and **Bob Demo**
- Owned vs Shared list sections
- Owner sharing (`read` / `write`) with server-side enforcement
- Validation + error surfacing in UI and API
- Automated tests (`npm test`) and production build (`npm run build`)

## Prototype authentication limitation

The top-right **Acting as** control is a **demo identity switcher**, not secure authentication. The client sends `X-Demo-User-Id`; anyone who can call the API can impersonate a demo user. That is acceptable for this take-home prototype (and labeled in the UI), but **production would need authenticated identities** (e.g. session/JWT / Supabase Auth) **plus server-enforced permissions** (keep the current API checks or migrate to Postgres RLS with the same rules).

## Incomplete / known gaps

- Demo identity switcher is **not** real auth (see above)
- Supabase anon/service_role keys were not available at build time; app uses server + `DATABASE_URL` instead of Supabase JS client / RLS
- No realtime multiplayer (CRDT / presence / comments) — intentionally deprioritized
- Walkthrough video URL not yet filled in — see `VIDEO_LINK.txt` placeholder
- Drive packaging (zip / shared folder with video + docs) is outside this repo PR

## How reviewers should test (production)

1. Open https://collabdocs-orpin.vercel.app/
2. Confirm **Acting as** shows **Alice Demo** / **Bob Demo** (prototype switcher).
3. As **Alice**: **New document** → edit title/body → use toolbar (bold/italic/lists) → **Save** → reload and confirm persistence.
4. Open **Sharing** → grant **Bob Demo** `write` (or `read`) → confirm share appears.
5. Switch **Acting as** to **Bob Demo** → confirm the doc under **Shared with me** → open it (write can edit/save; read is read-only).
6. Back on home (as Alice or Bob): **Import** a `.md` or `.txt` file → confirm a new editable document is created.
7. Optional: `curl https://collabdocs-orpin.vercel.app/api/health` → expect `{"ok":true,"databaseConfigured":true}`.

## How reviewers should test (local)

1. `cp .env.example .env` and set `DATABASE_URL` (pooler recommended)
2. `npm install && npm run db:schema && npm run dev`
3. Open http://localhost:5173 and follow the same create / edit / share / import flow as above
4. `npm test` and `npm run build`

## Design notes for production

Replace `X-Demo-User-Id` with authenticated sessions. Keep server permission checks or migrate to Postgres RLS with the same rules. See `ARCHITECTURE.md` and `AI_WORKFLOW.md`.
