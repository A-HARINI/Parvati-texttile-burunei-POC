import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../api/productService.js';
import BrandLogo from '../components/BrandLogo.jsx';

export default function StorefrontPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [cartItems, setCartItems] = useState([]);
  useEffect(() => {
    productService
      .list()
      .then((response) => setProducts(response.data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);
  const grouped = useMemo(() => {
    return products.reduce((acc, product) => {
      const key = product.category || 'All Products';
      if (!acc[key]) acc[key] = [];
      acc[key].push(product);
      return acc;
    }, {});
  }, [products]);
  const categoryChips = useMemo(() => ['All Products', ...Object.keys(grouped)], [grouped]);
  const visibleEntries = useMemo(() => {
    if (selectedCategory === 'All Products') {
      return Object.entries(grouped);
    }
    return Object.entries(grouped).filter(([category]) => category === selectedCategory);
  }, [grouped, selectedCategory]);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
  const cartItemCount = cartItems.length;
  const heroCategories = [
    { key: 'Food Consumer Goods', emoji: '🍫', desc: 'Delicious snacks, beverages & everyday food essentials from top brands' },
    { key: 'NON Food Consumer Goods', emoji: '🧴', desc: 'Personal care, stationery & household essentials you can count on' },
    { key: 'Pet Care Brands', emoji: '🐾', desc: 'Premium nutrition & care products for your furry friends' },
  ];
  function addToShowcaseCart(product) {
    const nextItems = [...cartItems, { id: product._id, name: product.name, price: Number(product.price) }];
    setCartItems(nextItems);
  }
  function getBadgeForProduct(product, index) {
    if (Number(product.stock || 0) <= 10) return 'Low Stock';
    if (index < 2) return 'Best Seller';
    return 'New Arrival';
  }
  return (
    <div className="parvati-store atelier-theme">
      <header className="parvati-topbar portal-blue">
        <div className="parvati-shell parvati-nav">
          <BrandLogo />
          <nav className="parvati-links">
            <Link to="/login">Account</Link>
            <Link to="/register">Create Account</Link>
            <a href="#products">Products</a>
          </nav>
        </div>
      </header>
      <main className="parvati-shell atelier-main-shell">
        <section className="parvati-tab-strip atelier-tab-strip">
          <button type="button" className="parvati-tab active">All Products</button>
          <button type="button" className="parvati-tab hot">🔥 Hot Sales</button>
          <button type="button" className="parvati-tab new">✨ New Arrivals</button>
        </section>
        <section className="parvati-hero atelier-hero">
          <h2>Premium Selection for Every Home</h2>
          <p>Shop food, non-food essentials, and pet care from trusted brands. New products added by admin are saved to DB and shown live here.</p>
          <div className="atelier-trust-row">
            <div className="atelier-trust-item">
              <strong>{products.length || 30}+</strong>
              <span>Live SKUs</span>
            </div>
            <div className="atelier-trust-item">
              <strong>12 hrs</strong>
              <span>Fast approvals</span>
            </div>
            <div className="atelier-trust-item">
              <strong>99.5%</strong>
              <span>Order accuracy</span>
            </div>
          </div>
        </section>
        <section className="parvati-feature-grid atelier-feature-grid">
          {heroCategories.map((entry) => (
            <article key={entry.key} className="parvati-feature">
              <div className="parvati-feature-emoji">{entry.emoji}</div>
              <h3>{entry.key}</h3>
              <p>{entry.desc}</p>
            </article>
          ))}
        </section>
        <section id="products" className="parvati-products-wrap atelier-products-wrap">
          <div className="parvati-products-header">
            <h2>Featured Products</h2>
            <p>Handpicked items from your live MongoDB data</p>
          </div>
          <div className="atelier-chip-row">
            {categoryChips.map((category) => (
              <button
                key={category}
                type="button"
                className={`atelier-chip ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </section>
        {loading ? <p style={{ color: '#64748b' }}>Loading products...</p> : null}
        {visibleEntries.map(([category, items]) => (
          <section key={category} className="parvati-category atelier-category">
            <h3>{category}</h3>
            <div className="parvati-product-grid atelier-product-grid">
              {items.map((product, index) => (
                <article key={product._id} className="parvati-product-card atelier-product-card">
                  <span className="atelier-product-badge">{getBadgeForProduct(product, index)}</span>
                  <div className="parvati-product-brand">{product.brand || 'Parvati Textiles'}</div>
                  <h4>{product.name}</h4>
                  <p>{product.description || 'Premium quality product for your everyday needs.'}</p>
                  <p className="atelier-product-meta">SKU: {product.sku || 'SKU-NA'} | MOQ: 1 CARTON</p>
                  <p className="atelier-product-meta">1 CARTON = 12 UNIT</p>
                  <div className="parvati-product-foot">
                    <strong>BND {Number(product.price).toFixed(2)}</strong>
                    <span className={product.stock > 0 ? 'in-stock' : 'out-stock'}>
                      {product.stock > 0 ? 'In Stock' : 'Unavailable'}
                    </span>
                  </div>
                  <button type="button" className="btn btn-primary atelier-card-cta" onClick={() => addToShowcaseCart(product)}>
                    Add to Cart
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
        {!loading && products.length === 0 ? (
          <section className="parvati-empty">
            <p>No products yet. Add products from Super Admin dashboard and they will appear here instantly.</p>
          </section>
        ) : null}
        <footer className="parvati-footer">
          <p>Parvati Textiles © 2026. All rights reserved.</p>
        </footer>
      </main>
      <aside className="atelier-mini-cart">
        <p className="atelier-mini-cart-title">Quick Cart</p>
        <p className="atelier-mini-cart-count">{cartItemCount} items</p>
        <p className="atelier-mini-cart-total">BND {cartSubtotal.toFixed(2)}</p>
        <Link to="/login" className="btn btn-primary atelier-mini-cart-btn">Checkout</Link>
      </aside>
    </div>
  );
}
