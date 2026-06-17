# ShopEZ Angular Frontend

Angular SPA for ShopEZ e-commerce. The frontend communicates only with the API Gateway.

## Stack

- Angular `18.2.x`
- TypeScript
- Angular Router
- Reactive forms
- RxJS
- Bootstrap-based styling

## API Base URL

Configured in `src/environments/environment.ts`:

```text
window.API_BASE_URL || 'https://localhost:7201'
```

For Docker runtime, `API_BASE_URL` is injected by container startup script.

## Features

- JWT login/register/logout flow
- Product listing and product detail pages
- Cart with user-scoped local persistence + backend sync
- Checkout and order placement
- Orders history
- Admin product management (create/update/delete)
- Route guards:
  - `authGuard`
  - `adminGuard`
  - `customerGuard`

## Current Endpoint Usage

- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products` (Admin)
- `PUT /api/products/{id}` (Admin)
- `DELETE /api/products/{id}` (Admin)
- `GET /api/cart` (Authorized)
- `POST /api/cart/sync` (Authorized)
- `DELETE /api/cart` (Authorized)
- `POST /api/orders` (Authorized)
- `GET /api/orders` (Authorized)
- `GET /api/orders/{id}` (Authorized)

## Recent Fixes

- Checkout address validation strengthened:
  - minimum 10 characters
  - max 160
  - valid address pattern
- Admin route behavior tightened:
  - direct URL/new-tab access by non-admin now redirects to login
- Featured products fallback improved:
  - home page now fills up to 3 cards even if preferred IDs are missing

## Validation Rules

Register:
- Name: required, 2-100
- Email: valid email format
- Password: strong password policy

Checkout:
- First name: required
- Last name: required
- Email: required + valid
- Address: required + minimum length
- City: required
- ZIP: 5-6 digits

## Demo Users

```text
Customer: customer@shopez.com / Pass@123
Admin:    admin@shopez.com / Admin@123
```

## Run (Local Dev)

```powershell
npm install
npm start
```

Open `http://localhost:4200`

## Build

```powershell
npm run build
```

## Run With Backend

1. Start backend stack from repository root:

```powershell
docker compose up --build -d
```

2. Verify gateway:

```text
http://localhost:7201/health
```

3. Run frontend:

```powershell
npm start
```

## Screenshot Labels For Submission

- `Figure F1: Frontend Home Page`
- `Figure F2: Login Form`
- `Figure F3: Register Form`
- `Figure F4: Product Listing`
- `Figure F5: Product Detail`
- `Figure F6: Cart Page`
- `Figure F7: Checkout Success`
- `Figure F8: Orders Page`
- `Figure F9: Admin Product Management`
- `Figure F10: Browser Network Tab With Authorized API Calls`
