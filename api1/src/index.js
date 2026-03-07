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
  type Product { id: Int!, name: String!, price: Float! }
  type Query { products: [Product!]! }
`)
const root = {
  products: async () => {
    const { rows } = await pool.query('SELECT id, name, price FROM products ORDER BY id')
    return rows.map(r => ({ id: r.id, name: r.name, price: parseFloat(r.price) }))
  }
}
app.use('/graphql', graphqlHTTP({ schema, rootValue: root, graphiql: true }))

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api1' })
})

app.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, price FROM products ORDER BY id')
    res.json({ products: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
})

app.post('/products', async (req, res) => {
  try {
    const { name, price } = req.body
    if (!name || price == null) {
      return res.status(400).json({ error: 'name and price required' })
    }
    const { rows } = await pool.query(
      'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id, name, price',
      [name, parseFloat(price)]
    )
    res.status(201).json({ product: rows[0] })
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
      price DECIMAL(10,2) NOT NULL
    )
  `)
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
