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

