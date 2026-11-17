import 'dotenv/config'
import request from 'supertest'
import { afterAll, describe, expect, it } from 'vitest'
import { createApp } from '../app.js'
import { pool } from '../db.js'

const ALICE = '11111111-1111-4111-8111-111111111111'
const BOB = '22222222-2222-4222-8222-222222222222'

const hasDb = Boolean(process.env.DATABASE_URL)

describe.skipIf(!hasDb)('documents API access control', () => {
  const app = createApp()
  let docId = ''

  afterAll(async () => {
    if (docId) {
      await pool.query('DELETE FROM documents WHERE id = $1', [docId])
    }
    await pool.end()
  })

  it('creates a document for Alice and denies Bob until shared', async () => {
    const created = await request(app)
      .post('/api/documents')
      .set('X-Demo-User-Id', ALICE)
      .send({
        title: 'API Test Doc',
        content_json: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'secret' }],
            },
          ],
        },
      })

    expect(created.status).toBe(201)
    docId = created.body.document.id

    const denied = await request(app)
      .get(`/api/documents/${docId}`)
      .set('X-Demo-User-Id', BOB)

    expect(denied.status).toBe(403)

    const shared = await request(app)
      .post(`/api/documents/${docId}/shares`)
      .set('X-Demo-User-Id', ALICE)
      .send({ user_id: BOB, permission: 'read' })

    expect(shared.status).toBe(201)

    const allowed = await request(app)
      .get(`/api/documents/${docId}`)
      .set('X-Demo-User-Id', BOB)

    expect(allowed.status).toBe(200)
    expect(allowed.body.access).toBe('read')

    const writeDenied = await request(app)
      .patch(`/api/documents/${docId}`)
      .set('X-Demo-User-Id', BOB)
      .send({ title: 'Hijacked' })

    expect(writeDenied.status).toBe(403)
  })
})
