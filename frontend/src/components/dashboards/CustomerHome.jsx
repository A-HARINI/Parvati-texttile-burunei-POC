import React, { useEffect, useState } from 'react';
import { productService } from '../../api/productService.js';
import { orderService } from '../../api/orderService.js';

const sampleCatalogProducts = [
  { _id: 'sample-1', name: '888 Margarine 500g', brand: '888', category: 'Dairy & Cheese', description: 'Premium margarine for bakery and home use.', price: 3.6, stock: 289 },
  { _id: 'sample-2', name: '888 Premium Palm Oil 5L', brand: '888', category: 'Palm Oil', description: 'Reliable cooking oil for everyday use.', price: 15.9, stock: 345 },
  { _id: 'sample-3', name: '888 Premium Palm Oil 2L', brand: '888', category: 'Palm Oil', description: 'Value pack cooking oil.', price: 6.6, stock: 263 },
  { _id: 'sample-4', name: 'Arla Full Cream Milk Powder', brand: 'Arla', category: 'Dairy & Cheese', description: 'Milk powder suitable for tea and desserts.', price: 11.5, stock: 190 },
];
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
const DEFAULT_DISCOUNT_PERCENT = 5;
const DEFAULT_TAX_PERCENT = 5;
const UOM_CONVERSION_FACTORS = {
  UNIT: 1,
  PCS: 1,
  BOX: 12,
  CARTON: 12,
  ROLL: 100,
  MTR: 1,
};
const UOM_DISCOUNT_PERCENT = {
  UNIT: 0,
  CARTON: 8,
};

function getConversionFactor(uom) {
  return UOM_CONVERSION_FACTORS[uom] || 1;
}

function getLineGross(item) {
  const effectiveUnits = Number(item.qty) * Number(item.conversionFactor || 1);
  return Number(item.price) * effectiveUnits;
}

function getLineDiscount(item) {
  const manualDiscountPercent = Number(item.discountPercent) || 0;
  const uomDiscountPercent = UOM_DISCOUNT_PERCENT[item.uom] || 0;
  const totalDiscountPercent = Math.min(90, manualDiscountPercent + uomDiscountPercent);
  return getLineGross(item) * (totalDiscountPercent / 100);
}

function getLineTaxable(item) {
  return getLineGross(item) - getLineDiscount(item);
}

function getLineTax(item, taxPercent) {
  return getLineTaxable(item) * (Number(taxPercent) / 100);
}

function getUomRate(item) {
  return Number(item.price) * Number(item.conversionFactor || 1);
}

export default function CustomerHome({ user, activeTab = 'account', isSalesPortal = false }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [orderMessage, setOrderMessage] = useState('');
  const [taxPercent, setTaxPercent] = useState(DEFAULT_TAX_PERCENT);
  const [selectedCatalogCategory, setSelectedCatalogCategory] = useState('ALL');
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [minimumPrice, setMinimumPrice] = useState('');
  const [maximumPrice, setMaximumPrice] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const cartStorageKey = isSalesPortal ? 'sales-cart' : 'customer-cart';
  const accountTitle = isSalesPortal ? 'Sales account' : 'My account';
  const cartTitle = isSalesPortal ? 'Sales cart' : 'Your cart';
  const orderListTitle = isSalesPortal ? 'Sales orders' : 'My orders';

  useEffect(() => {
    productService
      .list()
      .then((r) => setProducts(r.data.products || []))
      .catch(() => setProducts([]));
  }, []);
  useEffect(() => {
    const storedCart = window.localStorage.getItem(cartStorageKey);
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
    orderService
      .list()
      .then((response) => setMyOrders(response.data.orders || []))
      .catch(() => setMyOrders([]));
  }, [cartStorageKey]);
  const effectiveProducts = products.length > 0 ? products : sampleCatalogProducts;
  const filteredProducts = effectiveProducts.filter((product) => {
    const value = search.trim().toLowerCase();
    if (value.length === 0) return true;
    return (
      (product.name || '').toLowerCase().includes(value) ||
      (product.category || '').toLowerCase().includes(value) ||
      (product.brand || '').toLowerCase().includes(value)
    );
  });
  const visibleCatalogProducts = filteredProducts.filter((product, index) => {
    const price = Number(product.price || 0);
    const minimum = Number(minimumPrice || 0);
    const maximum = Number(maximumPrice || 0);
    if (minimumPrice !== '' && price < minimum) return false;
    if (maximumPrice !== '' && price > maximum) return false;
    if (selectedCatalogCategory === 'ALL') return true;
    const isCategoryMatch = (product.category || 'All Products') === selectedCatalogCategory;
    if (!isCategoryMatch) return false;
    if (selectedTag === 'ALL') return true;
    if (selectedTag === 'NEW_ARRIVALS') return index < 8;
    if (selectedTag === 'HOT_DEALS') return price <= 10;
    if (selectedTag === 'CLEARANCE') return Number(product.stock || 0) < 50;
    if (selectedTag === 'BESTSELLERS') return index < 6;
    return true;
  });
  const categories = Array.from(new Set(effectiveProducts.map((product) => product.category || 'All Products')));
  const accountQuickStats = [
    { label: 'Pending approvals', value: '2' },
    { label: 'Active orders', value: String(myOrders.length) },
    { label: 'Invoices', value: '6' },
    { label: 'Payments', value: '4' },
  ];
  function addToCart(product) {
    const existingItem = cartItems.find((item) => item.id === product._id);
    if (existingItem) {
      const next = cartItems.map((item) => (item.id === product._id ? { ...item, qty: item.qty + 1 } : item));
      setCartItems(next);
      window.localStorage.setItem(cartStorageKey, JSON.stringify(next));
      return;
    }
    const next = [
      ...cartItems,
      {
        id: product._id,
        name: product.name,
        price: Number(product.price),
        qty: 1,
        uom: product.uom || 'UNIT',
        conversionFactor: getConversionFactor(product.uom || 'UNIT'),
        discountPercent: DEFAULT_DISCOUNT_PERCENT,
        sku: product.sku || 'SKU-NA',
      },
    ];
    setCartItems(next);
    window.localStorage.setItem(cartStorageKey, JSON.stringify(next));
  }
  function updateCartQuantity(productId, nextQty) {
    const qtyNumber = Math.max(1, Number(nextQty) || 1);
    const next = cartItems.map((item) => (item.id === productId ? { ...item, qty: qtyNumber } : item));
    setCartItems(next);
    window.localStorage.setItem(cartStorageKey, JSON.stringify(next));
  }
  function updateCartItemDiscount(productId, nextDiscountPercent) {
    const discountPercent = Math.max(0, Number(nextDiscountPercent) || 0);
    const next = cartItems.map((item) => (item.id === productId ? { ...item, discountPercent } : item));
    setCartItems(next);
    window.localStorage.setItem(cartStorageKey, JSON.stringify(next));
  }
  function updateCartItemUom(productId, nextUom) {
    const uom = nextUom || 'UNIT';
    const conversionFactor = getConversionFactor(uom);
    const next = cartItems.map((item) => (item.id === productId ? { ...item, uom, conversionFactor } : item));
    setCartItems(next);
    window.localStorage.setItem(cartStorageKey, JSON.stringify(next));
  }
  function removeCartItem(productId) {
    const next = cartItems.filter((item) => item.id !== productId);
    setCartItems(next);
    window.localStorage.setItem(cartStorageKey, JSON.stringify(next));
  }
  function clearCart() {
    setCartItems([]);
    window.localStorage.setItem(cartStorageKey, JSON.stringify([]));
  }
  async function placeOrder() {
    if (cartItems.length === 0) {
      setOrderMessage('Cart is empty. Add products first.');
      return;
    }
    const subtotal = cartItems.reduce((sum, item) => sum + getLineTaxable(item), 0);
    const taxAmount = subtotal * (Number(taxPercent) / 100);
    const grandTotal = subtotal + taxAmount;
    const items = cartItems.map((item) => {
      const packDiscountPercent = UOM_DISCOUNT_PERCENT[item.uom] || 0;
      return `${item.name} x${item.qty} ${item.uom} (manualDisc ${Number(item.discountPercent || 0)}%, packDisc ${packDiscountPercent}%)`;
    }).join(', ');
    try {
      await orderService.create({
        customerName: user?.name || (isSalesPortal ? 'Sales order' : 'Customer'),
        items,
        total: grandTotal,
        notes: `${isSalesPortal ? 'Placed from sales manager cart' : 'Placed from customer portal cart'} | subtotal ${subtotal.toFixed(2)} | tax ${taxAmount.toFixed(2)} | taxRate ${taxPercent}%`,
      });
      const response = await orderService.list();
      setMyOrders(response.data.orders || []);
      clearCart();
      setOrderMessage('Order submitted. Status is PENDING_APPROVAL.');
    } catch (error) {
      setOrderMessage(error.response?.data?.message || 'Failed to submit order');
    }
  }
  const cartGrossTotal = cartItems.reduce((sum, item) => sum + getLineGross(item), 0);
  const cartDiscountTotal = cartItems.reduce((sum, item) => sum + getLineDiscount(item), 0);
  const cartSubtotal = cartGrossTotal - cartDiscountTotal;
  const cartTax = cartSubtotal * (Number(taxPercent) / 100);
  const cartTotal = cartSubtotal + cartTax;

  return (
    <div className="customer-home">
      {activeTab === 'account' ? (
        <>
        <section className="customer-account-head">
          <h2 className="portal-section-title">{accountTitle}</h2>
          <p className="dashboard-subtitle">{user?.name || 'Shop account'} <span className="customer-tier-pill">GOLD</span></p>
        </section>
        <section className="panel customer-account-strip">
          <button type="button" className="portal-mini-tab">Pending approvals</button>
          <button type="button" className="portal-mini-tab">Orders</button>
          <button type="button" className="portal-mini-tab">Invoices</button>
          <button type="button" className="portal-mini-tab">Payments</button>
          <button type="button" className="portal-mini-tab">Statement</button>
        </section>
        <section className="customer-balance-grid">
          <article className="customer-balance-card is-primary">
            <p>OUTSTANDING BALANCE</p>
            <h3>BND 483.50</h3>
            <small>6 invoices offline</small>
          </article>
          <article className="customer-balance-card is-secondary">
            <p>PAID IN LAST 30 DAYS</p>
            <h3>BND 731.50</h3>
            <small>4 bill payments recorded</small>
          </article>
        </section>
        <section className="customer-account-stats">
          {accountQuickStats.map((item) => (
            <article key={item.label} className="panel customer-account-stat-card">
              <p>{item.label}</p>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>
        <section className="panel customer-info-panel">
          <h3 className="panel-title">How this portal works</h3>
          <p className="muted" style={{ margin: 0 }}>
            {isSalesPortal
              ? 'Create wholesale orders from catalog and cart, submit for approval, then track status updates in the orders list.'
              : 'Place orders from the catalog, each order goes through admin approval before purchase entry, and fulfilled orders appear in your orders list with payment records.'}
          </p>
        </section>
        </>
      ) : null}
      {activeTab === 'catalog' ? (
        <>
        <section className="panel customer-catalog-top">
          <div className="customer-search-row">
            <input className="input" placeholder="Search products, brands, categories..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="catalog-sort-row">
            <span className="muted">Sort</span>
            <select className="input catalog-sort-select" defaultValue="relevance">
              <option value="relevance">Relevance</option>
              <option value="price-low">Price low to high</option>
              <option value="price-high">Price high to low</option>
            </select>
          </div>
          <button type="button" className="btn btn-secondary catalog-filter-toggle" onClick={() => setIsFilterOpen((state) => !state)}>
            {isFilterOpen ? 'Hide filters' : 'Show filters'}
          </button>
        </section>
        <section className="customer-catalog-layout">
          <aside className={`panel customer-filter-panel is-sticky ${isFilterOpen ? 'is-open' : ''}`}>
            <h4>Filters</h4>
            <p className="muted">Search</p>
            <input className="input" placeholder="Search products..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <p className="muted">Price range</p>
            <div className="stack">
              <input className="input" type="number" min="0" placeholder="Minimum price" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} />
              <input className="input" type="number" min="0" placeholder="Maximum price" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} />
            </div>
            <p className="muted">Quick collections</p>
            <div className="customer-chip-row">
              <button type="button" className={`customer-chip ${selectedTag === 'NEW_ARRIVALS' ? 'is-active' : ''}`} onClick={() => setSelectedTag('NEW_ARRIVALS')}>New arrivals</button>
              <button type="button" className={`customer-chip ${selectedTag === 'HOT_DEALS' ? 'is-active' : ''}`} onClick={() => setSelectedTag('HOT_DEALS')}>Hot deals</button>
              <button type="button" className={`customer-chip ${selectedTag === 'CLEARANCE' ? 'is-active' : ''}`} onClick={() => setSelectedTag('CLEARANCE')}>Clearance</button>
              <button type="button" className={`customer-chip ${selectedTag === 'BESTSELLERS' ? 'is-active' : ''}`} onClick={() => setSelectedTag('BESTSELLERS')}>Bestsellers</button>
              <button type="button" className={`customer-chip ${selectedTag === 'ALL' ? 'is-active' : ''}`} onClick={() => setSelectedTag('ALL')}>All tags</button>
            </div>
            <p className="muted">Departments</p>
            <ul className="mini-list">
              <li className={`mini-item customer-category-item ${selectedCatalogCategory === 'ALL' ? 'is-active' : ''}`}>
                <button type="button" className="customer-category-btn" onClick={() => setSelectedCatalogCategory('ALL')}>
                  All Products
                </button>
              </li>
              {categories.map((category) => (
                <li key={category} className={`mini-item customer-category-item ${selectedCatalogCategory === category ? 'is-active' : ''}`}>
                  <button type="button" className="customer-category-btn" onClick={() => setSelectedCatalogCategory(category)}>
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
          <section className="panel customer-market-panel">
            <h3 className="panel-title">{visibleCatalogProducts.length} products</h3>
            <div className="customer-product-grid">
              {visibleCatalogProducts.map((product) => (
                <article key={product._id} className="customer-product-card">
                  <div className="customer-product-brand">{product.brand || 'Parvati Textiles'}</div>
                  <h4>{product.name}</h4>
                  <p>{product.description || 'Premium quality product for your home and family.'}</p>
                  <div className="customer-product-foot">
                    <strong>BND {Number(product.price).toFixed(2)}</strong>
                    <button type="button" className="btn btn-primary" style={{ padding: '0.4rem 0.7rem', fontSize: 12 }} onClick={() => addToCart(product)}>
                      Add
                    </button>
                  </div>
                </article>
              ))}
              {visibleCatalogProducts.length === 0 ? (
                <article className="customer-product-card">
                  <h4>No matching products</h4>
                  <p>Try changing your search keyword.</p>
                </article>
              ) : null}
            </div>
          </section>
        </section>
        </>
      ) : null}
      {activeTab === 'account' || activeTab === 'catalog' ? (
      <div className="metric-grid">
        <div className="metric-card">
          <div className="metric-label">Available products</div>
          <div className="metric-value">{filteredProducts.length}</div>
        </div>
      </div>
      ) : null}
      {activeTab === 'cart' ? (
        <section className="customer-catalog-layout">
          <div className="panel customer-cart-panel">
            <h3 className="panel-title">{cartTitle}</h3>
            {cartItems.length === 0 ? <p style={{ margin: 0 }} className="muted">Your cart is empty. Browse catalog.</p> : null}
            {cartItems.length > 0 ? (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>UOM</th>
                      <th>Rate / UNIT</th>
                      <th>Rate / UOM</th>
                      <th>Qty</th>
                      <th>Pack Disc %</th>
                      <th>Disc %</th>
                      <th>Base Qty</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div>{item.name}</div>
                          <small className="muted">{item.sku}</small>
                        </td>
                        <td>
                          <select className="input" value={item.uom} onChange={(event) => updateCartItemUom(item.id, event.target.value)}>
                            <option value="UNIT">UNIT</option>
                            <option value="CARTON">CARTON</option>
                          </select>
                        </td>
                        <td>BND {Number(item.price).toFixed(2)}</td>
                        <td>BND {getUomRate(item).toFixed(2)}</td>
                        <td style={{ minWidth: 116 }}>
                          <div className="inline-actions">
                            <input
                              type="number"
                              min="1"
                              className="input"
                              value={item.qty}
                              style={{ width: 76 }}
                              onChange={(event) => updateCartQuantity(item.id, event.target.value)}
                            />
                          </div>
                        </td>
                        <td>{UOM_DISCOUNT_PERCENT[item.uom] || 0}</td>
                        <td style={{ minWidth: 90 }}>
                          <input
                            type="number"
                            min="0"
                            className="input"
                            value={item.discountPercent ?? DEFAULT_DISCOUNT_PERCENT}
                            onChange={(event) => updateCartItemDiscount(item.id, event.target.value)}
                          />
                        </td>
                        <td>{Number(item.qty) * Number(item.conversionFactor || 1)}</td>
                        <td>BND {(getLineTaxable(item) + getLineTax(item, taxPercent)).toFixed(2)}</td>
                        <td>
                          <button type="button" className="link-btn" onClick={() => removeCartItem(item.id)}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            {cartItems.length > 0 ? (
              <div className="inline-actions" style={{ marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={clearCart}>Clear cart</button>
              </div>
            ) : null}
            {orderMessage ? <p className="muted" style={{ marginTop: 8 }}>{orderMessage}</p> : null}
          </div>
          <aside className="panel customer-filter-panel">
            <h3 className="panel-title">Place order</h3>
            <div className="stack">
              <div className="inline-actions" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Gross</span>
                <strong>BND {cartGrossTotal.toFixed(2)}</strong>
              </div>
              <div className="inline-actions" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Discount</span>
                <strong>- BND {cartDiscountTotal.toFixed(2)}</strong>
              </div>
              <div className="inline-actions" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Subtotal</span>
                <strong>BND {cartSubtotal.toFixed(2)}</strong>
              </div>
              <div className="inline-actions" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Tax %</span>
                <input
                  type="number"
                  min="0"
                  className="input"
                  value={taxPercent}
                  style={{ width: 92 }}
                  onChange={(event) => setTaxPercent(Math.max(0, Number(event.target.value) || 0))}
                />
              </div>
              <div className="inline-actions" style={{ justifyContent: 'space-between' }}>
                <span className="muted">Tax</span>
                <strong>BND {cartTax.toFixed(2)}</strong>
              </div>
              <div className="inline-actions" style={{ justifyContent: 'space-between', borderTop: '1px solid var(--border-soft)', paddingTop: 8 }}>
                <span>Total</span>
                <strong>BND {cartTotal.toFixed(2)}</strong>
              </div>
            <button type="button" className="btn btn-primary" disabled={cartItems.length === 0} onClick={() => void placeOrder()}>
              Submit order for approval
            </button>
            <p className="muted" style={{ margin: 0 }}>Orders are reviewed by admin before fulfillment.</p>
            </div>
          </aside>
        </section>
      ) : null}
      {activeTab === 'orders' ? (
        <section className="panel">
          <h3 className="panel-title">{orderListTitle}</h3>
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
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order._id}>
                    <td>PRV-{new Date(order.createdAt || Date.now()).getFullYear()}-{order._id.slice(-5)}</td>
                    <td>{order.customerName || user?.name || 'Shop'}</td>
                    <td>{user?.name || (isSalesPortal ? 'Sales manager' : 'Customer')}</td>
                    <td>{String(order.channel || '').replaceAll('_', ' ') || 'CUSTOMER PORTAL'}</td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td>
                    <td><span className={`status-pill ${getStatusClassName(order.status)}`}>{formatStatusLabel(order.status)}</span></td>
                    <td>{String(order.items || '').split(',').filter(Boolean).length}</td>
                    <td>BND {Number(order.total || 0).toFixed(2)}</td>
                    <td><button type="button" className="link-btn">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
