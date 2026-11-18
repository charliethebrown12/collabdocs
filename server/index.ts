import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createApp } from './app.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT) || 3001
const app = createApp()

if (process.env.NODE_ENV === 'production') {
  const dist = path.join(__dirname, '..', 'dist')
  app.use(express.static(dist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next()
    res.sendFile(path.join(dist, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`CollabDocs API listening on http://localhost:${port}`)
})
