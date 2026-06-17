# ShopEZ Microservices Backend

ShopEZ is a microservices-based e-commerce backend built with ASP.NET Core, SQL Server, Ocelot API Gateway, Docker Compose, and an Angular frontend client.

## Architecture

- `ShopEZ.UserService` - registration, login, JWT issue (EF Core)
- `ShopEZ.ProductService` - product catalog and stock (Dapper + SQL)
- `ShopEZ.CartService` - user cart sync and storage (EF Core)
- `ShopEZ.OrderService` - order placement/history + ProductService stock call (EF Core)
- `ShopEZ.API Gateway` - unified external API entry (`localhost:7201`)
- `Frontend Angular` - client app (`localhost:4200`)

## Key Security

- JWT-based auth across gateway and backend services
- Role-based authorization (`Admin`/`Customer`)
- Internal service key for stock mutation:
  - `OrderService` -> `ProductService /api/products/reduce-stock`
  - Header: `X-Internal-Key`

## Run Modes

1. Local mode:
- Run services from Visual Studio / `dotnet run`
- Typically uses SQL Express connection strings from `appsettings.json`

2. Docker mode (recommended for demo/submission):
- Full stack via `docker compose`
- SQL Server container + service-to-service Docker DNS

## Quick Start (Docker)

1. Copy `.env.example` to `.env` and set values.
2. Start services:

```powershell
docker compose up --build -d
```

3. Verify:

```powershell
docker compose ps
```

4. Check endpoints:
- Frontend: `http://localhost:4200`
- Gateway health: `http://localhost:7201/health`
- Products: `http://localhost:7201/api/products`
- Login: `POST http://localhost:7201/api/auth/login`

## Important API Endpoints

Auth:
- `POST /api/auth/register`
- `POST /api/auth/login`

Products:
- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products` (Admin)
- `PUT /api/products/{id}` (Admin)
- `DELETE /api/products/{id}` (Admin; blocked if purchased in past orders)

Cart:
- `GET /api/cart` (Authorized)
- `POST /api/cart/sync` (Authorized)
- `DELETE /api/cart` (Authorized)

Orders:
- `POST /api/orders` (Authorized)
- `GET /api/orders` (Authorized)
- `GET /api/orders/{id}` (Authorized)

## Recent Stability Fixes

- Fixed cart sync/clear concurrency exceptions by using SQL-side delete strategy.
- Added per-user cart sync locking to prevent duplicate `(UserId, ProductId)` insert races.
- Prevented product deletion when product already exists in `OrderItems` history.

## Backend Build and Tests

Build:

```powershell
dotnet build
```

Run tests:

```powershell
dotnet test tests\ShopEZ.ProductService.Tests\ShopEZ.ProductService.Tests.csproj
dotnet test tests\ShopEZ.CartService.Tests\ShopEZ.CartService.Tests.csproj
dotnet test tests\ShopEZ.OrderService.Tests\ShopEZ.OrderService.Tests.csproj
dotnet test tests\ShopEZ.UserService.Tests\ShopEZ.UserService.Tests.csproj
```

## Submission Checklist

- `docker compose ps` screenshot (all services up)
- Gateway `/health` success screenshot
- Login JWT response screenshot
- Products response screenshot
- Cart + checkout + orders flow screenshots
- Admin product management screenshots
- Backend test run screenshot (`dotnet test`)

## Notes

- Gateway in Docker uses `ShopEZ.API Gateway/ocelot.Docker.json`.
- Host should call APIs via gateway (`localhost:7201`), not individual service ports.
- `docker compose down -v` wipes SQL volume data.
