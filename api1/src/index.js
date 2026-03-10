/**
 * COMMIT: Member 3 only. API1 is owned by one member (Member 3).
 * Your task: API1 (Products service), connects to DB1 only. You own all api1/ files and the api1+db1 block in docker-compose.
 * BONUS: Swagger/OpenAPI at /api-docs, GraphQL at /graphql
 */
import express from 'express'
import pg from 'pg'
import swaggerUi from 'swagger-ui-express'
import { graphqlHTTP } from 'express-graphql'
import { buildSchema } from 'graphql'
import { openApiSpec } from './openapi.js'

const { Pool } = pg
const app = express()
const port = process.env.PORT || 8001

const pool = new Pool({
  host: process.env.DB_HOST || 'db1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'products',
  user: process.env.DB_USER || 'api1',
  password: process.env.DB_PASSWORD || 'api1secret',
})

app.use(express.json())

// BONUS: OpenAPI / Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec))

// BONUS: GraphQL endpoint
const schema = buildSchema(`
  type Product { id: Int!, name: String!, price: Float!, category: String }
  type Query { products(category: String): [Product!]! }
`)
const root = {
  products: async ({ category }) => {
    let query = 'SELECT id, name, price, category FROM products'
    const params = []
    if (category) { params.push(category); query += ' WHERE category = $1' }
    query += ' ORDER BY id'
    const { rows } = await pool.query(query, params)
    return rows.map(r => ({ id: r.id, name: r.name, price: parseFloat(r.price), category: r.category || 'General' }))
  }
}
app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true }))

// Page d'accueil API (évite 404 sur http://localhost:8001)
app.get('/', (req, res) => {
  res.json({
    service: 'API1 — Products',
    version: '1.0',
    endpoints: { health: '/health', products: '/products', apiDocs: '/api-docs', graphql: '/graphql' },
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api1' })
})

app.get('/products', async (req, res) => {
  try {
    const category = req.query.category
    let query = 'SELECT id, name, price, category FROM products'
    const params = []
    if (category) {
      params.push(category)
      query += ' WHERE category = $1'
    }
    query += ' ORDER BY id'
    const { rows } = await pool.query(query, params)
    res.json({ products: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/products', async (req, res) => {
  try {
    const { name, price, category } = req.body
    if (!name || price == null) {
      return res.status(400).json({ error: 'name and price required' })
    }
    const cat = category || 'General'
    const { rows } = await pool.query(
      'INSERT INTO products (name, price, category) VALUES ($1, $2, $3) RETURNING id, name, price, category',
      [name, parseFloat(price), cat]
    )
    res.status(201).json({ product: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.delete('/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (!id) {
      return res.status(400).json({ error: 'valid id required' })
    }
    const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [id])
    if (rowCount === 0) {
      return res.status(404).json({ error: 'product not found' })
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
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      category VARCHAR(100) DEFAULT 'General'
    )
  `)
  try { await client.query(`ALTER TABLE products ADD COLUMN category VARCHAR(100) DEFAULT 'General'`) } catch (e) { if (e.code !== '42701') throw e }
  client.release()
}

const server = app.listen(port, async () => {
  try {
    await initDb()
    console.log(`API1 (Products) listening on port ${port}`)
  } catch (err) {
    console.error('DB init failed:', err)
    process.exit(1)
  }
})

export { app, server }
