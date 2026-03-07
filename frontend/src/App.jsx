/**
 * COMMIT: Members 1 & 2 (frontend pair). Shared between both.
 * Your task: Main app and API integration (calls API1 & API2). Both contribute to frontend; Dockerfile and .dockerignore are shared.
 */
import { useState, useEffect } from 'react'

const API1_URL = import.meta.env.VITE_API1_URL || 'http://localhost:8001'
const API2_URL = import.meta.env.VITE_API2_URL || 'http://localhost:8002'

export default function App() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading1, setLoading1] = useState(true)
  const [loading2, setLoading2] = useState(true)
  const [error1, setError1] = useState(null)
  const [error2, setError2] = useState(null)
  const [newProduct, setNewProduct] = useState({ name: '', price: '' })
  const [newOrder, setNewOrder] = useState({ product_id: '', quantity: '1' })

  useEffect(() => {
    fetch(`${API1_URL}/products`)
      .then((res) => res.json())
      .then((data) => { setProducts(data.products || []); setError1(null) })
      .catch((e) => setError1(e.message))
      .finally(() => setLoading1(false))
  }, [])

  useEffect(() => {
    fetch(`${API2_URL}/orders`)
      .then((res) => res.json())
      .then((data) => { setOrders(data.orders || []); setError2(null) })
      .catch((e) => setError2(e.message))
      .finally(() => setLoading2(false))
  }, [])

  const addProduct = (e) => {
    e.preventDefault()
    const name = newProduct.name.trim()
    const price = parseFloat(newProduct.price)
    if (!name || isNaN(price)) return
    fetch(`${API1_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts((prev) => [...prev, data.product])
        setNewProduct({ name: '', price: '' })
      })
      .catch((e) => setError1(e.message))
  }

  const addOrder = (e) => {
    e.preventDefault()
    const product_id = parseInt(newOrder.product_id, 10)
    const quantity = parseInt(newOrder.quantity, 10) || 1
    if (!product_id) return
    fetch(`${API2_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id, quantity }),
    })
      .then((res) => res.json())
      .then((data) => {
        setOrders((prev) => [...prev, data.order])
        setNewOrder({ product_id: '', quantity: '1' })
      })
      .catch((e) => setError2(e.message))
  }

  return (
    <>
      <h1>Microservices Demo — Products & Orders</h1>

      <section className="section">
        <h2>Products (API 1)</h2>
        {loading1 && <p className="loading">Loading products…</p>}
        {error1 && <p className="error">Error: {error1}</p>}
        {!loading1 && !error1 && (
          <>
            <ul>
              {products.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <span>€{parseFloat(p.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={addProduct}>
              <input
                placeholder="Product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))}
              />
              <button type="submit">Add Product</button>
            </form>
          </>
        )}
      </section>

      <section className="section">
        <h2>Orders (API 2)</h2>
        {loading2 && <p className="loading">Loading orders…</p>}
        {error2 && <p className="error">Error: {error2}</p>}
        {!loading2 && !error2 && (
          <>
            <ul>
              {orders.map((o) => (
                <li key={o.id}>
                  <span>Order #{o.id}</span>
                  <span>Product ID: {o.product_id}, Qty: {o.quantity}</span>
                </li>
              ))}
            </ul>
            <form onSubmit={addOrder}>
              <input
                type="number"
                placeholder="Product ID"
                value={newOrder.product_id}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, product_id: e.target.value }))}
              />
              <input
                type="number"
                min="1"
                placeholder="Quantity"
                value={newOrder.quantity}
                onChange={(e) => setNewOrder((prev) => ({ ...prev, quantity: e.target.value }))}
              />
              <button type="submit">Create Order</button>
            </form>
          </>
        )}
      </section>
    </>
  )
}
