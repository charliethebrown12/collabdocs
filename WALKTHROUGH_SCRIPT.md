# Walkthrough script (3–5 minutes)

Record against **production**: https://collabdocs-orpin.vercel.app/  
After upload, put the real URL in `VIDEO_LINK.txt` (currently a placeholder).

Target length: **~4 minutes**. Speak clearly; keep the cursor moving with your narration.

---

## 0:00–0:25 — Intro

- Open the production home page.
- Say: “This is CollabDocs, my Ajaia take-home — a collaborative document editor MVP.”
- Point out the **prototype identity** banner and **Acting as** switcher (Alice / Bob).
- One line on stack: React + Tiptap frontend, Express API, Supabase Postgres, deployed on Vercel.

## 0:25–1:20 — Create, edit, save (Alice)

- Confirm **Acting as → Alice Demo**.
- Click **New document**.
- Rename title (e.g. “Walkthrough demo”).
- Type a short paragraph; apply **bold**, **italic**, a **heading**, and a **list** from the toolbar.
- Click **Save**; note the saved confirmation.
- Briefly reload or return home and reopen to show persistence.

## 1:20–2:20 — Share + switch user (Bob)

- As Alice, open **Sharing**.
- Grant **Bob Demo** **write** (or show read, then switch to write — pick one to keep pace).
- Switch **Acting as → Bob Demo**.
- On home, open **Shared with me**; open the shared doc.
- Show Bob can edit/save with write access (or that read-only blocks save if you chose read).
- Optional one-liner: owner-only share mutations — Bob cannot re-share.

## 2:20–2:55 — Import

- Back on home, **Import** a small `.md` or `.txt` file.
- Show the new document opens editable with imported content.
- Mention supported types: `.txt` and `.md` only.

## 2:55–3:40 — What works vs deprioritized

**Works (show or list quickly):**

- CRUD + rich text, share with server-enforced permissions, import, Alice/Bob demo users, automated tests, live deploy.

**Deprioritized / out of scope for MVP:**

- Real authentication (demo switcher only)
- Realtime multiplayer / CRDT / presence / comments
- Supabase JS client + RLS (used trusted server + `DATABASE_URL` because anon keys were unavailable)

## 3:40–4:15 — Key decisions + AI workflow

- **Decision:** Express API + `pg` so access checks are server-side without waiting on Supabase anon keys.
- **Decision:** Prototype `X-Demo-User-Id` switcher, clearly labeled — production would need real auth + the same permission model.
- **AI:** Cursor cloud agents implemented the MVP and deploy fixes; Vercel for hosting/env; ChatGPT planning usage (if any) is not attested in repo history — say so honestly.
- Point reviewers to `SUBMISSION.md`, `AI_WORKFLOW.md`, `ARCHITECTURE.md`, and the GitHub repo.

## 4:15–4:30 — Close

- End on the production URL and repo link.
- “Happy to answer questions about tradeoffs or next steps (Auth, RLS, CI, autosave).”

---

## Recording checklist

- [ ] Use production URL (or local only if production is down — say which)
- [ ] Show Alice → create/edit/save
- [ ] Show share → Bob → Shared with me
- [ ] Show import
- [ ] State auth limitation and deprioritized stretch goals
- [ ] Mention Cursor agents + Vercel; do not invent ChatGPT/video claims
- [ ] Upload video → paste real URL into `VIDEO_LINK.txt` → include in Drive package
