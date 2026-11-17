import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from '../server/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const sqlPath = path.join(__dirname, '..', 'supabase', 'schema.sql')
const sql = fs.readFileSync(sqlPath, 'utf8')

const result = await pool.query(sql)
console.log('Schema applied')
console.log(result)
await pool.end()
