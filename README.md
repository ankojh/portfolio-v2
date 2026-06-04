# portfolio-v2

Portfolio app scaffold for https://ankojh.com with a React/Vite frontend, FastAPI backend, Postgres, and pgvector.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, shadcn-style UI components, TanStack Query
- Backend: FastAPI, async SQLAlchemy, asyncpg
- Database: Postgres 16 with pgvector

## Local Development

Start Postgres:

```bash
docker compose up -d postgres
```

Run the backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:5173.

The frontend calls `GET /api/health`, which is proxied to the FastAPI backend. The backend confirms database connectivity and returns the `app_version` value from the singleton `app_versions` Postgres table.

## Docker Compose

To run the full stack:

```bash
docker compose up --build
```

Services:

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Health: http://localhost:8000/health

## Deployment

The repo stays as a monorepo, but each host builds only its own app.

### Vercel Frontend

Use `frontend/` as the Vercel project root directory. Vercel should run from inside `frontend/`, so the commands are:

```bash
npm install
npm run build
```

The output directory is:

```bash
dist
```

Set this Vercel environment variable:

```bash
VITE_API_BASE_URL=https://<your-render-backend>.onrender.com
```

Do not set `VITE_DEV_PROXY_TARGET` in Vercel. That variable is only for local Vite/Compose proxying.

### Render Backend

[render.yaml](/Users/ankojh/b12/portfolio-v2/render.yaml) defines a Python web service rooted at `backend/` and a managed Postgres database. The backend accepts Render's plain `postgresql://...` connection string and converts it to SQLAlchemy's asyncpg URL internally.

Render environment variables:

```bash
APP_VERSION=0.1.0
DATABASE_URL=<Render Postgres connection string>
CORS_ORIGINS=https://ankojh.com,https://www.ankojh.com
```

The backend runs `CREATE EXTENSION IF NOT EXISTS vector` on startup, so the database is ready for pgvector-backed tables later.

The backend also creates and seeds this table when it is missing:

```sql
CREATE TABLE app_versions (
    id boolean PRIMARY KEY DEFAULT true,
    version text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT app_versions_singleton CHECK (id)
);
```

`APP_VERSION` is only used as the initial seed value. After the row exists, `/health` reads the version from Postgres and does not overwrite it on startup.
