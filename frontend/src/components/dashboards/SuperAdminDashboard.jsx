import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import CurrencyRupeeOutlinedIcon from '@mui/icons-material/CurrencyRupeeOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ShortcutOutlinedIcon from '@mui/icons-material/ShortcutOutlined';
import { adminService } from '../../api/adminService.js';
import { productService } from '../../api/productService.js';
import { orderService } from '../../api/orderService.js';
import { reportService } from '../../api/reportService.js';

const adminPipelineStatuses = ['PENDING_APPROVAL', 'APPROVED', 'FULFILLED', 'PARTIALLY_FULFILLED', 'INVOICED', 'PAID', 'CANCELLED'];
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
const kpiCardDefinitions = [
  { key: 'ordersToday', label: 'Orders Today', icon: <LocalShippingOutlinedIcon />, color: '#1a377f' },
  { key: 'pendingApprovals', label: 'Pending Approval', icon: <PendingActionsOutlinedIcon />, color: '#b1771e' },
  { key: 'revenueToday', label: 'Revenue Today', icon: <CurrencyRupeeOutlinedIcon />, color: '#25624a' },
  { key: 'activeShops', label: 'Active Shops', icon: <StorefrontOutlinedIcon />, color: '#6f4a8b' },
];
const cardBaseSx = {
  borderRadius: 4,
  border: '1px solid #d9c39b',
  height: '100%',
  background: 'linear-gradient(180deg, #fffdfa 0%, #f5ecdc 100%)',
  boxShadow: '0 10px 20px rgba(43, 29, 10, 0.08)',
  transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 18px 30px rgba(43, 29, 10, 0.16)',
    borderColor: '#b98f4f',
    background: 'linear-gradient(180deg, #fffcf7 0%, #f4e6ce 100%)',
  },
};
const infoCardBaseSx = {
  ...cardBaseSx,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 16px 26px rgba(36, 24, 8, 0.14)',
    borderColor: '#b98f4f',
  },
};
const iconFrameSx = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flex: '0 0 48px',
};

export default function SuperAdminDashboard({ activeTab = 'dashboard' }) {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [log, setLog] = useState('');
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', mobile: '', role: 'SALES_MANAGER' });
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', mobile: '', city: '', tier: 'STANDARD', creditLimit: 5000 });
  const [productForm, setProductForm] = useState({ name: '', price: '', sku: '', category: '', brand: '', stock: '', description: '' });
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [lastCreatedAdmin, setLastCreatedAdmin] = useState(null);

  async function loadAll() {
    const [usersResponse, productsResponse, ordersResponse, summaryResponse] = await Promise.allSettled([
      adminService.listUsers(),
      productService.list(),
      orderService.list(),
      reportService.summary(),
    ]);
    if (usersResponse.status === 'fulfilled') {
      setUsers(usersResponse.value.data.users || []);
    }
    if (productsResponse.status === 'fulfilled') {
      setProducts(productsResponse.value.data.products || []);
    }
    if (ordersResponse.status === 'fulfilled') {
      setOrders(ordersResponse.value.data.orders || []);
    }
    if (summaryResponse.status === 'fulfilled') {
      setSummary(summaryResponse.value.data.summary || null);
    }
    const failedCalls = [
      usersResponse.status === 'rejected' ? usersResponse.reason : null,
      productsResponse.status === 'rejected' ? productsResponse.reason : null,
      ordersResponse.status === 'rejected' ? ordersResponse.reason : null,
      summaryResponse.status === 'rejected' ? summaryResponse.reason : null,
    ].filter(Boolean);
    if (failedCalls.length > 0) {
      setLog(JSON.stringify(failedCalls[0]?.response?.data || failedCalls[0]?.message || 'Some data failed to refresh'));
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function createAdmin(e) {
    e.preventDefault();
    setIsCreatingAdmin(true);
    try {
      const { data } = await adminService.createAdmin(newAdmin);
      const temporaryPassword = data?.temporaryPassword || '';
      if (!temporaryPassword) {
        setLog('Admin created, but temporary password missing in response.');
        setLastCreatedAdmin(null);
      } else {
        setLog(`Admin created. Temporary password: ${temporaryPassword}`);
        setLastCreatedAdmin({
          email: newAdmin.email.trim().toLowerCase(),
          role: data.role || newAdmin.role,
          temporaryPassword,
        });
      }
      setNewAdmin({ name: '', email: '', mobile: '', role: 'SALES_MANAGER' });
      void loadAll();
    } catch (err) {
      setLog(JSON.stringify(err.response?.data || err.message));
      setLastCreatedAdmin(null);
    } finally {
      setIsCreatingAdmin(false);
    }
  }

  async function addProduct(e) {
    e.preventDefault();
    try {
      await productService.create({
        name: productForm.name,
        price: Number(productForm.price),
        sku: productForm.sku,
        category: productForm.category,
        brand: productForm.brand,
        stock: Number(productForm.stock),
        description: productForm.description,
      });
      setProductForm({ name: '', price: '', sku: '', category: '', brand: '', stock: '', description: '' });
      void loadAll();
    } catch (err) {
      setLog(JSON.stringify(err.response?.data || err.message));
    }
  }
  async function createCustomer(e) {
    e.preventDefault();
    try {
      const { data } = await adminService.createCustomer(newCustomer);
      setLog(`Customer created: ${JSON.stringify(data.customer?._id || data.message)}`);
      setNewCustomer({ name: '', email: '', mobile: '', city: '', tier: 'STANDARD', creditLimit: 5000 });
      void loadAll();
    } catch (err) {
      setLog(JSON.stringify(err.response?.data || err.message));
    }
  }

  async function deleteProduct(id) {
    try {
      await productService.remove(id);
      void loadAll();
    } catch (err) {
      setLog(JSON.stringify(err.response?.data || err.message));
    }
  }

  async function advanceOrderStatus(orderId, status) {
    try {
      await orderService.update(orderId, { status });
      void loadAll();
    } catch (err) {
      setLog(JSON.stringify(err.response?.data || err.message));
    }
  }

  const customerRows = useMemo(() => users.filter((user) => user.role === 'CUSTOMER'), [users]);
  const teamRows = useMemo(() => users.filter((user) => user.role !== 'CUSTOMER'), [users]);
  const selectedUser = selectedUserId ? users.find((u) => u._id === selectedUserId) : null;
  const pendingApprovalRows = useMemo(
    () => orders.filter((order) => ['PENDING_APPROVAL', 'PENDING'].includes(order.status)),
    [orders]
  );
  const kpiValues = {
    ordersToday: orders.length,
    pendingApprovals: summary?.pendingOrders ?? 0,
    revenueToday: `BND ${orders.reduce((total, order) => total + Number(order.total || 0), 0).toFixed(2)}`,
    activeShops: customerRows.length,
  };
  const lowStockCount = products.filter((product) => Number(product.stock ?? 0) < 10).length;
  return (
    <div className="super-admin-layout">
      {activeTab === 'dashboard' ? (
        <>
          <Card
            sx={{
              borderRadius: 4,
              border: '1px solid #d1b27d',
              background: 'linear-gradient(115deg, #08183f 0%, #183776 58%, #10295a 100%)',
              color: '#f6e9d0',
              mb: 2,
              boxShadow: '0 18px 34px rgba(8, 24, 63, 0.28)',
            }}
          >
            <CardContent sx={{ p: 2.2 }}>
              <Typography variant="overline" sx={{ letterSpacing: '0.08em', opacity: 0.86 }}>
                PARVATI CONTROL ROOM
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontFamily: '"Palatino Linotype", serif', fontWeight: 700, letterSpacing: '0.02em', mt: 0.5, color: '#fff5df !important' }}
              >
                Super Admin Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: '#f2e4c9 !important', mt: 0.8 }}>
                Monitor wholesale operations, approvals, inventory risk, and order flow in one place.
              </Typography>
            </CardContent>
          </Card>
          <Typography variant="body1" sx={{ color: '#6b5538', mb: 2 }}>
            Monitor wholesale operations, approvals, inventory risk, and order flow in one place.
          </Typography>
          <div className="admin-grid-row-shell">
            <div className="admin-grid-row admin-grid-row-kpi">
              {kpiCardDefinitions.map((kpiCardDefinition) => (
                <Card key={kpiCardDefinition.key} sx={cardBaseSx}>
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="overline" sx={{ fontWeight: 700, color: '#67533b', letterSpacing: '0.08em' }}>
                          {kpiCardDefinition.label}
                        </Typography>
                        <Typography variant="h3" sx={{ fontFamily: '"Palatino Linotype", serif', fontWeight: 800, mt: 1, color: '#20160b' }}>
                          {kpiValues[kpiCardDefinition.key]}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          ...iconFrameSx,
                          backgroundColor: `${kpiCardDefinition.color}1f`,
                          color: kpiCardDefinition.color,
                        }}
                      >
                        {kpiCardDefinition.icon}
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="admin-grid-row-shell" style={{ marginTop: 8 }}>
            <div className="admin-grid-row admin-grid-row-info">
              <Card sx={infoCardBaseSx}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Box sx={{ ...iconFrameSx, width: 38, height: 38, flex: '0 0 38px', backgroundColor: '#13337214' }}>
                      <LinkOutlinedIcon sx={{ color: '#133372', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>Zoho Books Link</Typography>
                  </Stack>
                  <Stack spacing={1}>
                    <Chip size="small" label="Mode: STUB" sx={{ alignSelf: 'flex-start', backgroundColor: '#f8e7c7', color: '#7f5313' }} />
                    <Chip size="small" label="Status: OK" sx={{ alignSelf: 'flex-start', backgroundColor: '#d6eedf', color: '#1f5a34' }} />
                    <Typography variant="body2" sx={{ color: '#665339' }}>Using in-memory stub data for POC sync.</Typography>
                  </Stack>
                </CardContent>
              </Card>
              <Card sx={infoCardBaseSx}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Box sx={{ ...iconFrameSx, width: 38, height: 38, flex: '0 0 38px', backgroundColor: '#bc7f1f14' }}>
                      <WarningAmberOutlinedIcon sx={{ color: '#bc7f1f', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>Low Stock Alerts</Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ fontFamily: '"Palatino Linotype", serif', fontWeight: 700, color: '#2c1d0c', mb: 0.3 }}>
                    {lowStockCount}
                  </Typography>
                  <Typography variant="overline" sx={{ color: '#8b5e1b', letterSpacing: '0.06em', fontWeight: 700 }}>
                    SKU BELOW REORDER LEVEL
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#665339' }}>
                    SKUs at or below reorder threshold across all warehouses.
                  </Typography>
                  <button type="button" className="btn btn-secondary luxury-action-btn" style={{ marginTop: 10 }}>
                    View low stock SKUs
                  </button>
                </CardContent>
              </Card>
              <Card sx={infoCardBaseSx}>
                <CardContent>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Box sx={{ ...iconFrameSx, width: 38, height: 38, flex: '0 0 38px', backgroundColor: '#1f5a3414' }}>
                      <ShortcutOutlinedIcon sx={{ color: '#1f5a34', fontSize: 18 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>Action Center</Typography>
                  </Stack>
                  <Stack spacing={1.1}>
                    <Alert severity="warning" sx={{ py: 0, border: '1px solid #e5c98f' }}>
                      Orders pending approval: <strong>{pendingApprovalRows.length}</strong>
                    </Alert>
                    <Alert severity="info" sx={{ py: 0, border: '1px solid #b8c8ea' }}>
                      Active shops: <strong>{customerRows.length}</strong>
                    </Alert>
                    <button type="button" className="btn btn-primary" onClick={() => setLog('Zoho sync simulated successfully.')}>
                      Run Zoho sync
                    </button>
                  </Stack>
                </CardContent>
              </Card>
            </div>
          </div>
          <Card sx={{ ...infoCardBaseSx, mt: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Inventory2OutlinedIcon sx={{ color: '#163a7f', fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 18 }}>Recent Orders</Typography>
              </Stack>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Shop</th>
                      <th>By</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((order) => (
                      <tr key={order._id}>
                        <td>PRV-{order._id.slice(-6)}</td>
                        <td>{order.customerName || 'Al-Barakah Mart'}</td>
                        <td>{order.customerName || 'Salesman Raj'}</td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '21 Apr 2026'}</td>
                        <td><span className={`status-pill ${getStatusClassName(order.status)}`}>{formatStatusLabel(order.status)}</span></td>
                        <td>BND {Number(order.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
      {activeTab === 'orders' ? (
        <section className="panel">
          <div className="luxury-section-head">
            <h3 className="panel-title">Orders</h3>
            <p className="muted" style={{ margin: 0 }}>Track every order across channels with clear pipeline visibility.</p>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order No.</th>
                  <th>Shop</th>
                  <th>Placed by</th>
                  <th>Channel</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Lines</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>PRV-{order._id.slice(-6)}</td>
                    <td>{order.customerName || 'Al-Barakah Mart'}</td>
                    <td>{order.customerName || 'Salesman Raj'}</td>
                    <td>{order.status === 'PENDING' ? 'SALESMAN APP' : 'CUSTOMER PORTAL'}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '21 Apr 2026'}</td>
                    <td><span className={`status-pill ${getStatusClassName(order.status)}`}>{formatStatusLabel(order.status)}</span></td>
                    <td>{order.items?.length || 2}</td>
                    <td>BND {Number(order.total || 0).toFixed(2)}</td>
                    <td><button type="button" className="btn btn-secondary luxury-action-btn" onClick={() => void advanceOrderStatus(order._id, 'APPROVED')}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {activeTab === 'approvals' ? (
        <section className="panel">
          <div className="luxury-section-head">
            <h3 className="panel-title">Orders Awaiting Approval</h3>
            <p className="muted" style={{ margin: 0 }}>Review, approve, or reject orders with faster decision controls.</p>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Shop</th>
                  <th>Placed by</th>
                  <th>Submitted</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovalRows.map((order) => (
                  <tr key={order._id}>
                    <td>PRV-{order._id.slice(-6)}</td>
                    <td>{order.customerName || 'Al-Barakah Mart'}</td>
                    <td>{order.customerName || 'Manager'}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                    <td>{String(order.items || '').split(',').length}</td>
                    <td>BND {Number(order.total || 0).toFixed(2)}</td>
                    <td>
                      <div className="inline-actions luxury-review-actions">
                        <button type="button" className="btn btn-primary luxury-approve-btn" onClick={() => void advanceOrderStatus(order._id, 'APPROVED')}>Approve</button>
                        <button type="button" className="btn btn-secondary luxury-reject-btn" onClick={() => void advanceOrderStatus(order._id, 'CANCELLED')}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pendingApprovalRows.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No pending approvals.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {activeTab === 'products' ? (
        <section className="panel">
          <h3 className="panel-title">Products ({products.length})</h3>
          <div className="products-head-row">
            <input className="input products-search" placeholder="Search SKU or name..." />
            <button type="button" className="btn btn-primary">Search</button>
          </div>
          <form onSubmit={addProduct} className="stack super-admin-form-grid" style={{ marginBottom: 10 }}>
            <input className="input" placeholder="Product name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required />
            <input className="input" placeholder="Price" type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} required />
            <input className="input" placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} required />
            <input className="input" placeholder="Category" value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} />
            <input className="input" placeholder="Brand" value={productForm.brand} onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })} />
            <input className="input" placeholder="Stock" type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} />
            <input className="input super-admin-span-2" placeholder="Short description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
            <button type="submit" className="btn btn-primary super-admin-span-2">Add Product</button>
          </form>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>UOMs</th>
                  <th>On hand</th>
                  <th>Zoho</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.brand || 'Parvati'}</td>
                    <td>{product.category || 'All Products'}</td>
                    <td>UNIT, CARTON</td>
                    <td>{String(product.stock ?? 0)}</td>
                    <td><button type="button" className="link-btn" onClick={() => void deleteProduct(product._id)}>Local</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {activeTab === 'customers' ? (
        <section className="panel">
          <h3 className="panel-title">Customers (shops)</h3>
          <form onSubmit={createCustomer} className="stack super-admin-form-grid" style={{ marginBottom: 10 }}>
            <input className="input" placeholder="Shop name" value={newCustomer.name} onChange={(event) => setNewCustomer({ ...newCustomer, name: event.target.value })} required />
            <input className="input" placeholder="Email" type="email" value={newCustomer.email} onChange={(event) => setNewCustomer({ ...newCustomer, email: event.target.value })} required />
            <input className="input" placeholder="Mobile" value={newCustomer.mobile} onChange={(event) => setNewCustomer({ ...newCustomer, mobile: event.target.value })} required />
            <input className="input" placeholder="City" value={newCustomer.city} onChange={(event) => setNewCustomer({ ...newCustomer, city: event.target.value })} />
            <select className="input" value={newCustomer.tier} onChange={(event) => setNewCustomer({ ...newCustomer, tier: event.target.value })}>
              <option value="STANDARD">STANDARD</option>
              <option value="SILVER">SILVER</option>
              <option value="GOLD">GOLD</option>
              <option value="PLATINUM">PLATINUM</option>
            </select>
            <input className="input" type="number" min="0" placeholder="Credit limit" value={newCustomer.creditLimit} onChange={(event) => setNewCustomer({ ...newCustomer, creditLimit: Number(event.target.value) })} />
            <button type="submit" className="btn btn-primary super-admin-span-2">Create Customer Shop</button>
          </form>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>City</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Users</th>
                  <th>Credit limit</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {customerRows.map((customer) => (
                  <tr key={customer._id}>
                    <td>{customer.name || 'Customer'}</td>
                    <td>{customer.city || 'Bandar Seri Begawan'}</td>
                    <td>{customer.tier || 'STANDARD'}</td>
                    <td>{customer.isVerified ? 'ACTIVE' : 'PENDING'}</td>
                    <td>1</td>
                    <td>BND {Number(customer.creditLimit ?? 5000).toLocaleString()}</td>
                    <td>{Math.max(1, orders.filter((order) => order.customerName === customer.name).length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {activeTab === 'users' ? (
        <section className="panel">
          <h3 className="panel-title">Users ({teamRows.length})</h3>
          <form onSubmit={createAdmin} className="stack super-admin-form-grid" style={{ marginBottom: 10 }}>
            <input className="input" placeholder="Full name" value={newAdmin.name} onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} required />
            <input className="input" placeholder="Email address" value={newAdmin.email} onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
            <input className="input" placeholder="Mobile number" value={newAdmin.mobile} onChange={(e) => setNewAdmin({ ...newAdmin, mobile: e.target.value })} required />
            <select className="input" value={newAdmin.role} onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}>
              <option value="SALES_MANAGER">SALES_MANAGER</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <button type="submit" className="btn btn-primary super-admin-span-2" disabled={isCreatingAdmin}>
              {isCreatingAdmin ? 'Creating...' : 'Create Admin User'}
            </button>
          </form>
          {lastCreatedAdmin ? (
            <div className="panel" style={{ marginTop: 0, marginBottom: 10, borderColor: '#bbf7d0', background: '#f0fdf4' }}>
              <h4 className="panel-title" style={{ marginBottom: 6 }}>Login credentials generated</h4>
              <p style={{ margin: 0 }}><strong>Email:</strong> {lastCreatedAdmin.email}</p>
              <p style={{ margin: 0 }}><strong>Role:</strong> {lastCreatedAdmin.role}</p>
              <p style={{ margin: 0 }}><strong>Temporary password:</strong> {lastCreatedAdmin.temporaryPassword}</p>
              <div className="inline-actions" style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    void navigator.clipboard.writeText(lastCreatedAdmin.temporaryPassword);
                    setLog('Temporary password copied.');
                  }}
                >
                  Copy password
                </button>
              </div>
            </div>
          ) : null}
          {log ? <p className="muted" style={{ marginTop: -2, marginBottom: 10 }}>{log}</p> : null}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Shop</th>
                  <th>Mobile</th>
                  <th>Active</th>
                  <th>Last login</th>
                </tr>
              </thead>
              <tbody>
                {teamRows.map((member) => (
                  <tr key={member._id}>
                    <td>{member.name || '—'}</td>
                    <td>{member.email || '—'}</td>
                    <td>{member.role}</td>
                    <td>{member.role === 'CUSTOMER' ? member.name : '—'}</td>
                    <td>{member.mobile || '—'}</td>
                    <td>{member.isVerified ? 'Active' : 'Pending'}</td>
                    <td>{member.updatedAt ? new Date(member.updatedAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel" style={{ marginTop: 12 }}>
            <h3 className="panel-title">User details</h3>
            <ul className="mini-list clickable-list">
              {users.map((u) => (
                <li key={u._id} className={`mini-item ${selectedUserId === u._id ? 'is-selected' : ''}`}>
                  <button type="button" className="list-row-button" onClick={() => setSelectedUserId(u._id)}>
                    <span>{u.name || u.email || u.mobile}</span>
                    <strong>{u.role}</strong>
                  </button>
                </li>
              ))}
            </ul>
            {selectedUser ? (
              <div className="detail-grid" style={{ marginTop: 10 }}>
                <p style={{ margin: 0 }}><strong>Email:</strong> {selectedUser.email || '—'}</p>
                <p style={{ margin: 0 }}><strong>Mobile:</strong> {selectedUser.mobile || '—'}</p>
                <p style={{ margin: 0 }}><strong>Verified:</strong> {selectedUser.isVerified ? 'Yes' : 'No'}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
      {activeTab === 'reports' ? (
        <section className="panel">
          <h3 className="panel-title">Reports</h3>
          <div className="metric-grid">
            <div className="metric-card">
              <div className="metric-label">Total users</div>
              <div className="metric-value">{summary?.users ?? users.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total products</div>
              <div className="metric-value">{summary?.products ?? products.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Total orders</div>
              <div className="metric-value">{summary?.orders ?? orders.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Pending orders</div>
              <div className="metric-value">{summary?.pendingOrders ?? 0}</div>
            </div>
          </div>
        </section>
      ) : null}
      {activeTab === 'sync' ? (
        <section className="panel">
          <h3 className="panel-title">Zoho sync</h3>
          <p className="muted">Mode: STUB</p>
          <p className="muted">Status: OK</p>
          <button type="button" className="btn btn-primary" onClick={() => setLog('Zoho sync simulated successfully.')}>Run sync</button>
        </section>
      ) : null}
    </div>
  );
}
