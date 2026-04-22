# Client Demo Pack - Parvati Wholesale POC

## 1) Demo Credentials

- Super Admin
  - Email: `admin@example.com`
  - Password: `Admin@12345`
- Sales Manager (create from Super Admin -> Users)
  - Example Email: `sales.manager@parvati.biz`
  - Example Password: `Sales@12345`
- Customer (example seeded shops)
  - `albarakah@parvati.biz`
  - `gadong@parvati.biz`
  - `kiulap@parvati.biz`

Note: If login fails, restart backend once so seed runs and enforces Super Admin.

## 2) Pre-Demo Technical Checklist (2 minutes)

- Start backend:
  - `cd account-rbac-poc/backend`
  - `npm start`
- Start frontend:
  - `cd account-rbac-poc/frontend`
  - `npm run dev`
- Open:
  - `http://localhost:5173/store`
- Browser:
  - `Ctrl + F5` hard refresh

## 3) 2-Minute Demo Script (Click Path)

### A. Brand + Storefront (20s)

- Open `/store`
- Say: "This is the branded Parvati wholesale storefront with premium visual system."
- Show category sections and product cards.

### B. Super Admin Journey (45s)

- Login as Super Admin
- Dashboard:
  - Show KPI cards
  - Show pending approvals
  - Show low stock alerts
- Users tab:
  - Create one Sales Manager
  - Show generated temporary password card
- Orders tab:
  - Show pipeline status visibility
- Approvals tab:
  - Approve/reject controls

### C. Sales Manager Journey (35s)

- Login as Sales Manager
- Go to Catalog -> Cart
- Add product, switch `UNIT` to `CARTON`, change Qty
- Show calculation difference
- Submit order

### D. Customer Journey (20s)

- Login as Customer
- Show My Account -> Catalog -> Cart -> My Orders
- Show order status badges and order history

## 4) Wholesale Calculation Explanation (Client-Friendly)

- `Base Qty = Qty x UOM factor`
- `Gross = Rate/UNIT x Base Qty`
- `Discount = Gross x (Manual Disc% + Pack Disc%)`
- `Taxable = Gross - Discount`
- `Tax = Taxable x Tax%`
- `Final Total = Taxable + Tax`

Current UOM factors:
- `UNIT = 1`
- `CARTON = 12`

## 5) Key Value Points to Say

- Role-based separation is clean: Super Admin, Sales Manager, Customer.
- End-to-end wholesale flow is complete:
  - Catalog -> Cart -> Order -> Approval -> Fulfillment -> Invoice/Payment
- UI is client-facing, premium, and readable.
- Demo data is realistic and supports decision-making view.

## 6) Backup Plan (If Anything Breaks in Meeting)

- If page looks stale:
  - Hard refresh (`Ctrl + F5`)
- If credentials fail:
  - Restart backend and retry `admin@example.com / Admin@12345`
- If Atlas/network fails:
  - Continue UI flow with already loaded data and explain this is POC environment connectivity.

## 7) Client Q&A Quick Answers

- "Is this role-secure?"
  - Yes, JWT + backend role middleware enforces endpoint access.
- "Can we add more roles?"
  - Yes, role model is extensible (new role + route policy + UI menu mapping).
- "Can this connect to ERP/Zoho?"
  - Yes, sync module is already prepared in stub mode and can be wired to live APIs.
- "Can pricing rules become more advanced?"
  - Yes, slab pricing, customer-specific price lists, and tax splits are next-phase ready.

## 8) Post-Demo Immediate Next Steps

- Freeze UI for pilot feedback.
- Add audit logs for status transitions.
- Add downloadable order/invoice exports.
- Add customer-specific pricing tiers and credit rule engine.
