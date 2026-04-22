import React, { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService.js';
import { productService } from '../../api/productService.js';
import { orderService } from '../../api/orderService.js';

const salesPipelineStatuses = ['APPROVED', 'FULFILLED', 'PARTIALLY_FULFILLED', 'INVOICED', 'PAID'];
const statusClassMap = {
  PENDING_APPROVAL: 'status-pending',
  APPROVED: 'status-approved',
  FULFILLED: 'status-fulfilled',
  PARTIALLY_FULFILLED: 'status-partial',
  INVOICED: 'status-invoiced',
  PAID: 'status-paid',
  CANCELLED: 'status-cancelled',
  DRAFT: 'status-draft',
};
const getStatusClassName = (status) => statusClassMap[status] || 'status-draft';
const formatStatusLabel = (status) => String(status || '').replaceAll('_', ' ');

export default function SalesManagerDashboard() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [log, setLog] = useState('');

  async function load() {
    try {
      const [c, p, o] = await Promise.all([adminService.listCustomers(), productService.list(), orderService.list()]);
      setCustomers(c.data.customers || []);
      setProducts(p.data.products || []);
      setOrders(o.data.orders || []);
    } catch (e) {
      setLog(JSON.stringify(e.response?.data || e.message));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateOrder(id, status) {
    try {
      await orderService.update(id, { status });
      void load();
    } catch (err) {
      setLog(JSON.stringify(err.response?.data || err.message));
    }
  }

  async function tryDeleteOrder(id) {
    try {
      await orderService.remove(id);
      setLog('Unexpected: delete should be 403 for sales');
      void load();
    } catch (err) {
      setLog(`Delete blocked (expected): ${JSON.stringify(err.response?.data)}`);
    }
  }

  return (
    <div>
      <h2 style={{ marginTop: 0 }}>Sales Manager Console</h2>
      <p className="dashboard-subtitle">Orders, customers, and product catalog view with restricted admin actions.</p>
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Orders</div>
          <div className="metric-value">{orders.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Customers</div>
          <div className="metric-value">{customers.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Products</div>
          <div className="metric-value">{products.length}</div>
        </div>
      </div>
      <div className="panel-grid">
        <section className="panel">
          <h3 className="panel-title">Order actions</h3>
          <ul className="mini-list">
          {orders.map((o) => (
            <li key={o._id} className="mini-item">
              #{o._id.slice(-6)} — <span className={`status-pill ${getStatusClassName(o.status)}`}>{formatStatusLabel(o.status)}</span>
              <div className="inline-actions" style={{ marginTop: 8 }}>
                {salesPipelineStatuses.map((status) => (
                  <button key={status} type="button" className="btn btn-secondary" style={{ fontSize: 11 }} onClick={() => void updateOrder(o._id, status)}>
                    {status}
                  </button>
                ))}
                <button type="button" className="btn btn-secondary" style={{ fontSize: 11 }} onClick={() => void tryDeleteOrder(o._id)}>
                  Try delete
                </button>
              </div>
            </li>
          ))}
          </ul>
        </section>
        <section className="panel">
          <h3 className="panel-title">Customers</h3>
          <ul className="mini-list">
          {customers.map((c) => (
            <li key={c._id} className="mini-item">
              {c.name} {c.email || c.mobile}
            </li>
          ))}
          </ul>
        </section>
        <section className="panel">
          <h3 className="panel-title">Product catalog</h3>
          <ul className="mini-list">
          {products.map((p) => (
            <li key={p._id} className="mini-item">
              {p.name} — ${p.price}
            </li>
          ))}
          </ul>
        </section>
      </div>
      {log && <pre className="log-box" style={{ color: '#fbbf24' }}>{log}</pre>}
    </div>
  );
}
