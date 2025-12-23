# Ecom Agora (Vite + PHP + MySQL)

Quick start for local development.

## Backend (PHP + Apache + MySQL)

1) Place the backend under your Apache web root.
- Example: `C:\Apache24\htdocs\ecom-api` should contain the contents of `backend/`

2) Build the MySQL database.
From the repo root:
```
mysql -u root -p < backend\db\CreateDatabase.sql
mysql -u root -p ecommerce < backend\db\Views.sql
mysql -u root -p ecommerce < backend\db\Triggers.sql
mysql -u root -p ecommerce < backend\db\MockData.sql
```
MockData.sql inserts sample records (users, products, categories, carts, and orders) for local testing.

3) Start your Apache and MySQL services.
- Start-Service -Name "Apache2.4", "MySQL80"

4) Verify the API:
- `http://localhost/ecom-api` should return JSON.
- Routes live under `http://localhost/ecom-api/routes/*.php`.

## Setup checks (common gotchas)

- Apache: `mod_rewrite` enabled and `AllowOverride All` for the `ecom-api` directory (required for `.htaccess`).
- PHP: `mysqli` extension enabled; `file_uploads` enabled if using uploads.
- MySQL: DB/user/password match `backend/config/MySQLDatabase.php`.
- Filesystem: `backend/uploads/` is writable by Apache.
- Frontend proxy: update `frontend/vite.config.ts` if your backend URL is not `http://localhost/ecom-api`.
- Dev-only tool: remove or restrict `backend/tools/rehash_demo_passwords.php` outside local dev.

## Frontend (Vite)

1) Install deps:
```
cd frontend
npm install
```

2) Run Vite:
```
npm run dev
```

The frontend proxies `/api` to `http://localhost/ecom-api/routes` (see `frontend/vite.config.ts`).
