# Account management + RBAC — full-stack POC

Stack: **Node.js + Express**, **MongoDB + Mongoose**, **React (Vite)** + **Axios**.

## Folder layout

```
account-rbac-poc/
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/db.js
│       ├── models/User.js, Product.js, Order.js
│       ├── middleware/authMiddleware.js, roleMiddleware.js
│       ├── controllers/authController.js, adminController.js, productController.js, orderController.js, reportsController.js
│       ├── routes/authRoutes.js, adminRoutes.js, productRoutes.js, orderRoutes.js, reportRoutes.js
│       └── utils/validators.js, seedSuperAdmin.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx, App.jsx, index.css
│       ├── api/client.js, authService.js, adminService.js, productService.js, orderService.js, reportService.js
│       ├── context/AuthContext.jsx
│       ├── components/ProtectedRoute.jsx
│       ├── components/dashboards/SuperAdminDashboard.jsx, SalesManagerDashboard.jsx, CustomerHome.jsx
│       └── pages/LoginPage.jsx, RegisterPage.jsx, OtpVerifyPage.jsx, ForgotPasswordPage.jsx, DashboardPage.jsx
└── README.md
```

## Setup

### 1. MongoDB Atlas

1. In [Atlas](https://cloud.mongodb.com), open your cluster → **Connect** → **Drivers**.
2. Copy the **connection string** (starts with `mongodb+srv://`).
3. Replace `<password>` with your database user’s password and set the database name in the path (e.g. `/account-rbac-poc` before `?`).
4. **Network Access**: add your current IP or `0.0.0.0/0` (dev only) so the driver can reach the cluster.
5. **Database Access**: ensure the user has read/write on the target database.

Local MongoDB (`mongodb://127.0.0.1:27017/...`) also works if you prefer not to use Atlas.

#### `querySrv ECONNREFUSED` or SRV DNS errors

Atlas’s **`mongodb+srv://`** URI needs a DNS **SRV** lookup. On some Windows networks or DNS setups that fails.

**Fix:** In Atlas → **Database** → **Connect** → **Drivers**, copy the **standard** connection string (starts with **`mongodb://`**, lists several `cluster0-shard-00-0x....mongodb.net:27017` hosts and includes `ssl=true` and `replicaSet=...`). Paste that entire value as `MONGODB_URI` in `.env`.

Keep your username/password in that string; URL-encode special characters in the password (`@` → `%40`).

Optional: set your PC DNS to **8.8.8.8** / **1.1.1.1** and retry the `mongodb+srv` URI if you prefer SRV.

### 2. Backend

```bash
cd account-rbac-poc/backend
copy .env.example .env
```

Edit **`backend/.env`** and set at least:

- `MONGODB_URI` — your full Atlas SRV string (see above).
- `JWT_SECRET` — any long random string.

Then:

```bash
npm install
npm run dev
```

API: `http://localhost:4000` (default `PORT=4000`).

### 3. Frontend

```bash
cd account-rbac-poc/frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to the backend.

Optional: point to a remote API:

```env
VITE_API_URL=http://localhost:4000
```

### 4. Seed data

On first start, the backend creates:

- **SUPER_ADMIN** — email / password from `.env` (`SEED_SUPER_ADMIN_EMAIL`, `SEED_SUPER_ADMIN_PASSWORD`) or defaults `admin@example.com` / `Admin@12345`
- One **demo product** (`DEMO-SKU-001`)

Create a **Sales Manager** from the Super Admin dashboard (UI) or Postman: `POST /api/admin/create` with Super Admin JWT.

---

## API summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register/mobile` | — | Send OTP for new mobile user |
| POST | `/api/auth/verify-otp` | — | Verify OTP → JWT (registration) |
| POST | `/api/auth/register/email` | — | Email + password registration |
| POST | `/api/auth/login/email` | — | Email login → JWT |
| POST | `/api/auth/login/otp` | — | Send login OTP |
| POST | `/api/auth/verify-login-otp` | — | Verify login OTP → JWT |
| POST | `/api/auth/forgot-password` | — | Issue reset token (POC returns token) |
| POST | `/api/auth/reset-password` | — | Reset password |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/admin/create` | JWT, **SUPER_ADMIN** | Create admin |
| GET | `/api/admin/users` | JWT, **SUPER_ADMIN** | List users |
| GET | `/api/admin/customers` | JWT, **SUPER_ADMIN**, **SALES_MANAGER** | List customers |
| GET/POST/PUT/DELETE | `/api/products` | JWT, RBAC | Super: full CRUD; Sales/Customer: GET only |
| GET/POST/PUT/DELETE | `/api/orders` | JWT, RBAC | Super + Sales: manage; DELETE super only |
| GET | `/api/reports/summary` | JWT, **SUPER_ADMIN** | Counts summary |

---

## Postman examples

Set variable `baseUrl` = `http://localhost:4000`, `token` = JWT after login.

### Register (email)

```http
POST {{baseUrl}}/api/auth/register/email
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "secret12"
}
```

### Login (email)

```http
POST {{baseUrl}}/api/auth/login/email
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "Admin@12345"
}
```

Copy `token` from response → use as `Authorization: Bearer {{token}}`.

### Register (mobile) + verify

```http
POST {{baseUrl}}/api/auth/register/mobile
Content-Type: application/json

{ "mobile": "919876543210" }
```

Response includes `otpHint` (POC). Then:

```http
POST {{baseUrl}}/api/auth/verify-otp
Content-Type: application/json

{
  "mobile": "919876543210",
  "otp": "<otp from response>"
}
```

### Login OTP

```http
POST {{baseUrl}}/api/auth/login/otp
Content-Type: application/json

{ "mobile": "919876543210" }
```

Then:

```http
POST {{baseUrl}}/api/auth/verify-login-otp
Content-Type: application/json

{
  "mobile": "919876543210",
  "otp": "<otp from previous response>"
}
```

### Forgot / reset password

```http
POST {{baseUrl}}/api/auth/forgot-password
Content-Type: application/json

{ "email": "test@example.com" }
```

```http
POST {{baseUrl}}/api/auth/reset-password
Content-Type: application/json

{
  "email": "test@example.com",
  "resetToken": "<from forgot response>",
  "newPassword": "newsecret12"
}
```

### Create admin (Super Admin only)

```http
POST {{baseUrl}}/api/admin/create
Authorization: Bearer {{superAdminToken}}
Content-Type: application/json

{
  "name": "Sales One",
  "email": "sales@example.com",
  "mobile": "919811122233",
  "role": "SALES_MANAGER"
}
```

### Products

```http
GET {{baseUrl}}/api/products
Authorization: Bearer {{token}}
```

```http
POST {{baseUrl}}/api/products
Authorization: Bearer {{superAdminToken}}
Content-Type: application/json

{
  "name": "Widget",
  "price": 9.99,
  "sku": "W-100"
}
```

### Orders

```http
GET {{baseUrl}}/api/orders
Authorization: Bearer {{token}}
```

```http
POST {{baseUrl}}/api/orders
Authorization: Bearer {{salesToken}}
Content-Type: application/json

{
  "customerName": "Walk-in",
  "items": "Widget x1",
  "total": 9.99,
  "status": "PENDING"
}
```

---

## Frontend behaviour

- **JWT** stored in `localStorage` under `token`.
- **ProtectedRoute** wraps `/dashboard`; unauthenticated users go to `/login`.
- **Dashboard** UI by role:
  - **SUPER_ADMIN** — users, products CRUD, orders, reports.
  - **SALES_MANAGER** — orders, customers, product list; “Try delete” on order shows backend denial for delete-only super rule.
  - **CUSTOMER** — welcome + read-only product list.

---

## Security note

This is a **POC**: OTP and reset tokens are returned in API responses for easy testing. Do not use this pattern in production.
