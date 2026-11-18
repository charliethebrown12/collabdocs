import 'dotenv/config'
import { createApp } from '../server/app.js'

/**
 * Vercel serverless entry. Express app handles /api/* after rewrites.
 * Requires Production env: DATABASE_URL (Supabase pooler URI).
 */
const app = createApp()

export default app
