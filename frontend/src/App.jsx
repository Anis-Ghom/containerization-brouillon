/**
 * COMMIT: Members 1 & 2 (frontend pair). Shared between both.
 * Your task: Main app and API integration (calls API1 & API2). Both contribute to frontend; Dockerfile and .dockerignore are shared.
 */
import { useState, useEffect } from 'react'

const API1_URL = import.meta.env.VITE_API1_URL || '/api1'
const API2_URL = import.meta.env.VITE_API2_URL || '/api2'

const CATEGORIES = ['General', 'Electronics', 'Clothing', 'Food', 'Books', 'Other']

export default function App() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [events, setEvents] = useState([])
  const [loading1, setLoading1] = useState(true)
  const [loading2, setLoading2] = useState(true)
  const [error1, setError1] = useState(null)
  const [error2, setError2] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'General' })
  const [newOrder, setNewOrder] = useState({ product_id: '', quantity: '1' })
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('theme') !== 'light' } catch (_) { return true }
  })

  useEffect(() => {
    try { localStorage.setItem('theme', darkMode ? 'dark' : 'light') } catch (_) {}
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  const fetchProducts = () => {
    const url = categoryFilter ? `${API1_URL}/products?category=${encodeURIComponent(categoryFilter)}` : `${API1_URL}/products`
    fetch(url)
      .then((res) => res.json())
      .then((data) => { setProducts(data.products || []); setError1(null) })
      .catch((e) => setError1(e.message))
      .finally(() => setLoading1(false))
  }

  useEffect(() => { fetchProducts() }, [categoryFilter])

  useEffect(() => {
    fetch(`${API2_URL}/orders`)
      .then((res) => res.json())
      .then((data) => { setOrders(data.orders || []); setError2(null) })
      .catch((e) => setError2(e.message))
      .finally(() => setLoading2(false))
  }, [])

  useEffect(() => {
    fetch(`${API2_URL}/orders/events`)
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []))
      .catch(() => setEvents([]))
    const t = setInterval(() => {
      fetch(`${API2_URL}/orders/events`)
        .then((res) => res.json())
        .then((data) => setEvents(data.events || []))
        .catch(() => {})
    }, 5000)
    return () => clearInterval(t)
  }, [])

  const addProduct = (e) => {
    e.preventDefault()
    const name = newProduct.name.trim()
    const price = parseFloat(newProduct.price)
    if (!name || isNaN(price)) return
    fetch(`${API1_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price, category: newProduct.category || 'General' }),
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts((prev) => [...prev, data.product])
        setNewProduct({ name: '', price: '', category: 'General' })
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
        setEvents((prev) => [{ orderId: data.order.id, product_id, quantity, status: 'pending', at: new Date().toISOString() }, ...prev.slice(0, 4)])
      })
      .catch((e) => setError2(e.message))
  }

  const updateOrderStatus = (id, status) => {
    fetch(`${API2_URL}/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .then((data) => setOrders((prev) => prev.map((o) => (o.id === id ? data.order : o))))
      .catch((e) => setError2(e.message))
  }

  const deleteProduct = (id) => {
    fetch(`${API1_URL}/products/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`delete failed (${res.status})`)
        setProducts((prev) => prev.filter((p) => p.id !== id))
      })
      .catch((e) => setError1(e.message))
  }

  const deleteOrder = (id) => {
    fetch(`${API2_URL}/orders/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`delete failed (${res.status})`)
        setOrders((prev) => prev.filter((o) => o.id !== id))
      })
      .catch((e) => setError2(e.message))
  }

  return (
    <>
      <header className="app-header">
        <h1>Microservices Demo — Products & Orders</h1>
        <button type="button" className="theme-toggle" onClick={() => setDarkMode((d) => !d)} aria-label="Toggle theme">
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <section className="section dashboard">
        <h2>Dashboard</h2>
        <div className="stats">
          <div className="stat-card">
            <span className="stat-value">{products.length}</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{orders.length}</span>
            <span className="stat-label">Orders</span>
          </div>
        </div>
        <div className="events-feed">
          <h3>Last events (Redis)</h3>
          {events.length === 0 ? (
            <p className="muted">No recent order events.</p>
          ) : (
            <ul className="events-list">
              {events.slice(0, 5).map((ev, i) => (
                <li key={i}>
                  Order #{ev.orderId} — product {ev.product_id}, qty {ev.quantity} — {ev.at ? new Date(ev.at).toLocaleString() : ''}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="section">
        <h2>Products (API 1)</h2>
        <div className="filter-row">
          <label>Category: </label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        {loading1 && <p className="loading">Loading products…</p>}
        {error1 && <p className="error">Error: {error1}</p>}
        {!loading1 && !error1 && (
          <>
            <ul>
              {products.map((p) => (
                <li key={p.id}>
                  <span>{p.name}</span>
                  <span className="product-meta">€{parseFloat(p.price).toFixed(2)} {p.category && <span className="badge">{p.category}</span>}</span>
                  <button type="button" onClick={() => deleteProduct(p.id)}>Delete</button>
                </li>
              ))}
            </ul>
            <form onSubmit={addProduct}>
              <input placeholder="Product name" value={newProduct.name} onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))} />
              <input type="number" step="0.01" placeholder="Price" value={newProduct.price} onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))} />
              <select value={newProduct.category} onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
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
                  <span className="order-status">
                    <span className={`badge status-${o.status || 'pending'}`}>{o.status || 'pending'}</span>
                    <select value={o.status || 'pending'} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                      <option value="pending">pending</option>
                      <option value="shipped">shipped</option>
                      <option value="delivered">delivered</option>
                    </select>
                  </span>
                  <button type="button" onClick={() => deleteOrder(o.id)}>Delete</button>
                </li>
              ))}
            </ul>
            <form onSubmit={addOrder}>
              <input type="number" placeholder="Product ID" value={newOrder.product_id} onChange={(e) => setNewOrder((prev) => ({ ...prev, product_id: e.target.value }))} />
              <input type="number" min="1" placeholder="Quantity" value={newOrder.quantity} onChange={(e) => setNewOrder((prev) => ({ ...prev, quantity: e.target.value }))} />
              <button type="submit">Create Order</button>
            </form>
          </>
        )}
      </section>
    </>
  )
}
