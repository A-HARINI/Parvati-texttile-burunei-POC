import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import SuperAdminDashboard from '../components/dashboards/SuperAdminDashboard.jsx';
import CustomerHome from '../components/dashboards/CustomerHome.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [adminTab, setAdminTab] = useState('dashboard');
  const [customerTab, setCustomerTab] = useState('account');

  let body;
  let pageTitle = 'Admin Dashboard';
  let pageSubtitle = 'Manage catalog, orders, users, and reports.';
  if (user.role === 'SUPER_ADMIN') {
    body = <SuperAdminDashboard activeTab={adminTab} onChangeTab={setAdminTab} />;
    pageTitle = 'Super Admin Dashboard';
    pageSubtitle = 'Manage users, products, orders, and reports.';
  } else if (user.role === 'SALES_MANAGER') {
    body = <CustomerHome user={user} activeTab={customerTab} onChangeTab={setCustomerTab} isSalesPortal />;
    pageTitle = 'Sales Portal';
    pageSubtitle = 'Create and submit wholesale orders from catalog and cart.';
  } else {
    body = <CustomerHome user={user} activeTab={customerTab} onChangeTab={setCustomerTab} />;
    pageTitle = 'My Account';
    pageSubtitle = 'Track your account and explore curated products.';
  }
  const roleClass = user.role === 'SUPER_ADMIN' ? 'badge-super' : user.role === 'SALES_MANAGER' ? 'badge-sales' : 'badge-customer';
  const adminTabs = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'orders', label: 'Orders' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'products', label: 'Products' },
    { key: 'customers', label: 'Customers' },
    { key: 'users', label: 'Users' },
    { key: 'reports', label: 'Reports' },
    { key: 'sync', label: 'Zoho sync' },
  ];
  const customerTabs = [
    { key: 'account', label: 'My account' },
    { key: 'catalog', label: 'Catalog' },
    { key: 'cart', label: 'Cart' },
    { key: 'orders', label: 'My orders' },
  ];

  return (
    <div className="parvati-store atelier-theme">
      <header className={`parvati-topbar ${user.role === 'CUSTOMER' ? 'portal-blue' : 'portal-blue'}`}>
        <div className="parvati-shell parvati-nav portal-main-nav">
          <BrandLogo />
          <div className="auth-top-actions">
            {user.role === 'CUSTOMER' || user.role === 'SALES_MANAGER' ? (
              <>
                <button type="button" className="portal-ghost-btn" onClick={() => setCustomerTab('account')}>My account</button>
                <span className="portal-user">{user.name || (user.role === 'SALES_MANAGER' ? 'Sales manager' : 'Customer')}</span>
                <button type="button" className="portal-ghost-btn" onClick={logout}>Sign out</button>
              </>
            ) : (
              <>
                <span className={`badge ${roleClass}`}>{user.role}</span>
                <button type="button" className="portal-ghost-btn" onClick={logout}>Sign out</button>
              </>
            )}
          </div>
        </div>
        <div className="portal-subnav-wrap">
          <div className="parvati-shell">
            {user.role === 'SUPER_ADMIN' ? (
              <nav className="portal-subnav">
                {adminTabs.map((tab) => (
                  <button key={tab.key} type="button" className={`portal-subnav-item ${adminTab === tab.key ? 'active' : ''}`} onClick={() => setAdminTab(tab.key)}>
                    {tab.label}
                  </button>
                ))}
              </nav>
            ) : null}
            {user.role === 'CUSTOMER' || user.role === 'SALES_MANAGER' ? (
              <nav className="portal-subnav">
                {customerTabs.map((tab) => (
                  <button key={tab.key} type="button" className={`portal-subnav-item ${customerTab === tab.key ? 'active' : ''}`} onClick={() => setCustomerTab(tab.key)}>
                    {tab.label}
                  </button>
                ))}
                {user.role === 'CUSTOMER' ? <Link className="portal-subnav-item as-link" to="/store">Browse catalog</Link> : null}
              </nav>
            ) : null}
          </div>
        </div>
      </header>
      <div className="dashboard-shell customer-role-shell portal-dashboard-shell">
      <div className={`surface couture-surface ${user.role === 'CUSTOMER' || user.role === 'SALES_MANAGER' ? 'customer-surface' : ''}`}>
        <div style={{ marginBottom: 12 }}>
          <h2 className="dashboard-title" style={{ marginBottom: 0 }}>{pageTitle}</h2>
          <p className="dashboard-subtitle">{pageSubtitle} <span className={`badge ${roleClass}`}>{user.role}</span></p>
        </div>
        {body}
      </div>
      </div>
    </div>
  );
}
