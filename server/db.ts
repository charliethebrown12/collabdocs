import pg from 'pg'
import dns from 'node:dns'

dns.setDefaultResultOrder('ipv4first')

const { Pool } = pg

let pool: pg.Pool | null = null

/** Lazy pool so serverless cold start can serve /api/health without DATABASE_URL. */
export function getPool(): pg.Pool {
  if (pool) return pool

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured')
  }

  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Serverless-friendly: avoid exhausting Supabase pooler slots
    max: process.env.VERCEL ? 1 : 10,
  })

  return pool
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export type User = {
  id: string
  display_name: string
}

export type DocumentRow = {
  id: string
  owner_id: string
  title: string
  content_json: unknown
  created_at: string
  updated_at: string
}

export type DocumentShare = {
  id: string
  document_id: string
  user_id: string
  permission: 'read' | 'write'
}

export type AccessLevel = 'owner' | 'write' | 'read' | null

export async function getUserAccess(
  documentId: string,
  userId: string,
): Promise<AccessLevel> {
  const result = await getPool().query<{
    is_owner: boolean
    permission: 'read' | 'write' | null
  }>(
    `SELECT
       (d.owner_id = $2) AS is_owner,
       s.permission
     FROM documents d
     LEFT JOIN document_shares s
       ON s.document_id = d.id AND s.user_id = $2
     WHERE d.id = $1`,
    [documentId, userId],
  )

  const row = result.rows[0]
  if (!row) return null
  if (row.is_owner) return 'owner'
  if (row.permission === 'write') return 'write'
  if (row.permission === 'read') return 'read'
  return null
}

export function canRead(access: AccessLevel): boolean {
  return access === 'owner' || access === 'write' || access === 'read'
}

export function canWrite(access: AccessLevel): boolean {
  return access === 'owner' || access === 'write'
}

export function canShare(access: AccessLevel): boolean {
  return access === 'owner'
}
