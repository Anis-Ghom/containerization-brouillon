/**
 * COMMIT: Member 4 only. API2 is owned by one member (Member 4).
 * Your task: API2 (Orders service), connects to DB2 only. You own all api2/ files and the api2+db2+redis block in docker-compose.
 * BONUS: Swagger/OpenAPI at /api-docs, Redis queue for order events
 */
import express from 'express'
import pg from 'pg'
import { createClient } from 'redis'
import swaggerUi from 'swagger-ui-express'
import { openApiSpec } from './openapi.js'

const { Pool } = pg
const app = express()
const port = process.env.PORT || 8002

const pool = new Pool({
  host: process.env.DB_HOST || 'db2',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'orders',
  user: process.env.DB_USER || 'api2',
  password: process.env.DB_PASSWORD || 'api2secret',
})

// BONUS: Redis queue (optional; queue works if REDIS_URL is set)
let redisClient = null
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379'
const QUEUE_KEY = 'order_events'
async function getRedis() {
  if (!redisClient) {
    redisClient = createClient({ url: REDIS_URL })
    redisClient.on('error', () => {})
    try { await redisClient.connect() } catch (_) { redisClient = null }
  }
  return redisClient
}

app.use(express.json())

// BONUS: OpenAPI / Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

// Page d'accueil API (évite 404 sur http://localhost:8002)
app.get('/', (req, res) => {
  res.json({
    service: 'API2 — Orders',
    version: '1.0',
    endpoints: { health: '/health', orders: '/orders', orderEvents: '/orders/events', apiDocs: '/api-docs' },
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api2' })
})

// BONUS: recent order events from Redis queue
app.get('/orders/events', async (req, res) => {
  try {
    const redis = await getRedis()
    if (!redis) return res.json({ events: [], message: 'Redis not available' })
    const events = await redis.lRange(QUEUE_KEY, 0, 49)
    res.json({ events: events.map(e => JSON.parse(e)) })
  } catch (err) {
    res.json({ events: [] })
  }
})

app.get('/orders', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, product_id, quantity, status, created_at FROM orders ORDER BY id DESC')
    res.json({ orders: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/orders', async (req, res) => {
  try {
    const { product_id, quantity } = req.body
    if (product_id == null) {
      return res.status(400).json({ error: 'product_id required' })
    }
    const qty = parseInt(quantity, 10) || 1
    const { rows } = await pool.query(
      'INSERT INTO orders (product_id, quantity, status) VALUES ($1, $2, \'pending\') RETURNING id, product_id, quantity, status, created_at',
      [parseInt(product_id, 10), qty]
    )
    res.status(201).json({ order: rows[0] })
    // BONUS: push order event to Redis queue
    const redis = await getRedis()
    if (redis) {
      await redis.lPush(QUEUE_KEY, JSON.stringify({ orderId: rows[0].id, product_id, quantity: qty, status: 'pending', at: new Date().toISOString() }))
      await redis.lTrim(QUEUE_KEY, 0, 99)
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

// Mise à jour du statut d'une commande (pending | shipped | delivered)
app.patch('/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { status } = req.body
    const allowed = ['pending', 'shipped', 'delivered']
    if (!id || !status || !allowed.includes(status)) {
      return res.status(400).json({ error: 'valid id and status (pending|shipped|delivered) required' })
    }
    const { rows, rowCount } = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, product_id, quantity, status, created_at',
      [status, id]
    )
    if (rowCount === 0) return res.status(404).json({ error: 'order not found' })
    res.json({ order: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.delete('/orders/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) {
      return res.status(400).json({ error: 'valid id required' })
    }
    const { rowCount } = await pool.query('DELETE FROM orders WHERE id = $1', [id])
    if (rowCount === 0) {
      return res.status(404).json({ error: 'order not found' })
    }
    res.json({ deleted: true, id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

async function initDb() {
  const client = await pool.connect()
  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  try { await client.query(`ALTER TABLE orders ADD COLUMN status VARCHAR(20) DEFAULT 'pending'`) } catch (e) { if (e.code !== '42701') throw e }
  client.release()
}

const server = app.listen(port, async () => {
  try {
    await initDb()
    console.log(`API2 (Orders) listening on port ${port}`)
  } catch (err) {
    console.error('DB init failed:', err)
    process.exit(1)
  }
})

export { app, server }
