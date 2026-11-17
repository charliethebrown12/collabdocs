import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import {
  canRead,
  canShare,
  canWrite,
  getUserAccess,
  pool,
  type DocumentRow,
  type User,
} from './db.js'

const UUID = z.string().uuid()

const emptyDoc = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

async function requireDemoUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const header = req.header('x-demo-user-id')
  if (!header) {
    return res.status(401).json({
      error: 'Missing X-Demo-User-Id header (prototype identity switcher)',
    })
  }

  const parsed = UUID.safeParse(header)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid demo user id' })
  }

  try {
    const user = await pool.query<User>(
      'SELECT id, display_name FROM users WHERE id = $1',
      [parsed.data],
    )
    if (!user.rows[0]) {
      return res.status(401).json({ error: 'Unknown demo user' })
    }
    res.locals.user = user.rows[0]
    next()
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to resolve demo user' })
  }
}

export function createApp() {
  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '2mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/api/users', async (_req, res) => {
    try {
      const result = await pool.query<User>(
        'SELECT id, display_name FROM users ORDER BY display_name',
      )
      res.json({ users: result.rows })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to load users' })
    }
  })

  const api = express.Router()
  api.use(requireDemoUser)

  api.get('/documents', async (_req, res) => {
    const user = res.locals.user as User
    try {
      const result = await pool.query<
        DocumentRow & { access: 'owner' | 'write' | 'read' }
      >(
        `SELECT d.id, d.owner_id, d.title, d.created_at, d.updated_at,
                CASE
                  WHEN d.owner_id = $1 THEN 'owner'
                  ELSE s.permission
                END AS access
         FROM documents d
         LEFT JOIN document_shares s
           ON s.document_id = d.id AND s.user_id = $1
         WHERE d.owner_id = $1 OR s.user_id = $1
         ORDER BY d.updated_at DESC`,
        [user.id],
      )

      const owned = result.rows.filter((d) => d.owner_id === user.id)
      const shared = result.rows.filter((d) => d.owner_id !== user.id)
      res.json({ owned, shared })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to list documents' })
    }
  })

  api.post('/documents', async (req, res) => {
    const user = res.locals.user as User
    const body = z
      .object({
        title: z.string().trim().min(1).max(200).default('Untitled'),
        content_json: z.unknown().optional(),
      })
      .safeParse(req.body)

    if (!body.success) {
      return res
        .status(400)
        .json({ error: 'Invalid document payload', details: body.error.flatten() })
    }

    try {
      const result = await pool.query<DocumentRow>(
        `INSERT INTO documents (owner_id, title, content_json)
         VALUES ($1, $2, $3::jsonb)
         RETURNING id, owner_id, title, content_json, created_at, updated_at`,
        [
          user.id,
          body.data.title,
          JSON.stringify(body.data.content_json ?? emptyDoc),
        ],
      )
      res.status(201).json({ document: result.rows[0], access: 'owner' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to create document' })
    }
  })

  api.get('/documents/:id', async (req, res) => {
    const user = res.locals.user as User
    const id = UUID.safeParse(req.params.id)
    if (!id.success) return res.status(400).json({ error: 'Invalid document id' })

    try {
      const access = await getUserAccess(id.data, user.id)
      if (!canRead(access)) {
        return res
          .status(403)
          .json({ error: 'You do not have access to this document' })
      }

      const result = await pool.query<DocumentRow>(
        `SELECT id, owner_id, title, content_json, created_at, updated_at
         FROM documents WHERE id = $1`,
        [id.data],
      )
      if (!result.rows[0]) {
        return res.status(404).json({ error: 'Document not found' })
      }

      res.json({ document: result.rows[0], access })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to load document' })
    }
  })

  api.patch('/documents/:id', async (req, res) => {
    const user = res.locals.user as User
    const id = UUID.safeParse(req.params.id)
    if (!id.success) return res.status(400).json({ error: 'Invalid document id' })

    const body = z
      .object({
        title: z.string().trim().min(1).max(200).optional(),
        content_json: z.unknown().optional(),
      })
      .safeParse(req.body)

    if (!body.success) {
      return res
        .status(400)
        .json({ error: 'Invalid update payload', details: body.error.flatten() })
    }
    if (body.data.title === undefined && body.data.content_json === undefined) {
      return res.status(400).json({ error: 'Provide title and/or content_json' })
    }

    try {
      const access = await getUserAccess(id.data, user.id)
      if (!canWrite(access)) {
        return res
          .status(403)
          .json({ error: 'You do not have write access to this document' })
      }

      const result = await pool.query<DocumentRow>(
        `UPDATE documents SET
           title = COALESCE($2, title),
           content_json = COALESCE($3::jsonb, content_json),
           updated_at = now()
         WHERE id = $1
         RETURNING id, owner_id, title, content_json, created_at, updated_at`,
        [
          id.data,
          body.data.title ?? null,
          body.data.content_json !== undefined
            ? JSON.stringify(body.data.content_json)
            : null,
        ],
      )

      if (!result.rows[0]) {
        return res.status(404).json({ error: 'Document not found' })
      }
      res.json({ document: result.rows[0], access })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to update document' })
    }
  })

  api.get('/documents/:id/shares', async (req, res) => {
    const user = res.locals.user as User
    const id = UUID.safeParse(req.params.id)
    if (!id.success) return res.status(400).json({ error: 'Invalid document id' })

    try {
      const access = await getUserAccess(id.data, user.id)
      if (!canShare(access)) {
        return res.status(403).json({ error: 'Only the owner can view shares' })
      }

      const result = await pool.query(
        `SELECT s.id, s.document_id, s.user_id, s.permission, u.display_name
         FROM document_shares s
         JOIN users u ON u.id = s.user_id
         WHERE s.document_id = $1
         ORDER BY u.display_name`,
        [id.data],
      )
      res.json({ shares: result.rows })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to load shares' })
    }
  })

  api.post('/documents/:id/shares', async (req, res) => {
    const user = res.locals.user as User
    const id = UUID.safeParse(req.params.id)
    if (!id.success) return res.status(400).json({ error: 'Invalid document id' })

    const body = z
      .object({
        user_id: UUID,
        permission: z.enum(['read', 'write']),
      })
      .safeParse(req.body)

    if (!body.success) {
      return res
        .status(400)
        .json({ error: 'Invalid share payload', details: body.error.flatten() })
    }

    try {
      const access = await getUserAccess(id.data, user.id)
      if (!canShare(access)) {
        return res
          .status(403)
          .json({ error: 'Only the owner can share this document' })
      }

      if (body.data.user_id === user.id) {
        return res
          .status(400)
          .json({ error: 'Cannot share a document with its owner' })
      }

      const target = await pool.query<User>(
        'SELECT id, display_name FROM users WHERE id = $1',
        [body.data.user_id],
      )
      if (!target.rows[0]) {
        return res.status(404).json({ error: 'Target user not found' })
      }

      const result = await pool.query(
        `INSERT INTO document_shares (document_id, user_id, permission)
         VALUES ($1, $2, $3)
         ON CONFLICT (document_id, user_id)
         DO UPDATE SET permission = EXCLUDED.permission
         RETURNING id, document_id, user_id, permission`,
        [id.data, body.data.user_id, body.data.permission],
      )

      res.status(201).json({
        share: {
          ...result.rows[0],
          display_name: target.rows[0].display_name,
        },
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to share document' })
    }
  })

  api.delete('/documents/:id/shares/:shareId', async (req, res) => {
    const user = res.locals.user as User
    const id = UUID.safeParse(req.params.id)
    const shareId = UUID.safeParse(req.params.shareId)
    if (!id.success || !shareId.success) {
      return res.status(400).json({ error: 'Invalid id' })
    }

    try {
      const access = await getUserAccess(id.data, user.id)
      if (!canShare(access)) {
        return res.status(403).json({ error: 'Only the owner can revoke shares' })
      }

      const result = await pool.query(
        `DELETE FROM document_shares
         WHERE id = $1 AND document_id = $2
         RETURNING id`,
        [shareId.data, id.data],
      )
      if (!result.rows[0]) {
        return res.status(404).json({ error: 'Share not found' })
      }
      res.status(204).send()
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to revoke share' })
    }
  })

  app.use('/api', api)
  return app
}
