import express from 'express'
import { createProxyMiddleware, fixRequestBody } from 'http-proxy-middleware'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const API_BACKEND = process.env.API_BACKEND_URL || 'http://localhost:3000'

const app = express()

app.use(express.json())

app.use(
  '/api',
  createProxyMiddleware({
    target: API_BACKEND,
    changeOrigin: true,
    secure: true,
    on: {
      proxyReq: (proxyReq, req) => {
        proxyReq.path = req.originalUrl
        fixRequestBody(proxyReq, req)
      },
    },
  }),
)

app.use(express.static(path.join(__dirname, 'dist')))

app.get('{*path}', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Frontend serving on :${PORT}, proxying /api → ${API_BACKEND}`)
})
