# Photogram

A social application built feature by feature to learn system design.

## Requirements

- Node.js 22.13.1 or a compatible newer Node.js 22 patch
- npm
- Docker Desktop with Docker Compose

## Local setup

Run from the repository root:

```powershell
npm ci
Copy-Item apps/api/.env.example apps/api/.env
docker compose up -d --wait
npm run db:migrate --workspace apps/api
```

Copy the example environment file only on first setup.

Start the API:

```powershell
npm run dev --workspace apps/api
```

In another terminal, start the frontend:

```powershell
npm run dev --workspace apps/web
```

Open http://localhost:5173.

## Verification

```powershell
npm test --workspace apps/api
npm run build --workspace apps/api
npm run build --workspace apps/web
```

## Production rehearsal on Windows

Stop both development servers, build both applications, then run:

```powershell
$env:NODE_ENV = "production"
npm run start --workspace apps/api
```

Open http://localhost:3000.

After stopping the server:

```powershell
Remove-Item Env:NODE_ENV
```

## Health endpoints

- /api/health checks that the API responds.
- /api/ready checks database connectivity.

## Database changes

Create SQL migrations in apps/api/migrations.
Apply pending migrations with:

```powershell
npm run db:migrate --workspace apps/api
```

Keep migrations and package-lock.json in version control.
Never commit real environment files or production credentials.