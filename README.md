# portfolio-v2

Portfolio app scaffold with a React/Vite frontend, FastAPI backend, Postgres, and pgvector.

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
VITE_API_BASE_URL=https://<your-backend-domain>
```

Do not set `VITE_DEV_PROXY_TARGET` in Vercel. That variable is only for local Vite/Compose proxying.

Recommended Vercel domains:

```text
Primary:  <your-frontend-domain>
Redirect: www.<your-frontend-domain> -> <your-frontend-domain>
```

### Render Backend

[render.yaml](/Users/ankojh/b12/portfolio-v2/render.yaml) defines a Python web service rooted at `backend/` and a managed Postgres database. The backend accepts Render's plain `postgresql://...` connection string and converts it to SQLAlchemy's asyncpg URL internally.

Render environment variables:

```bash
APP_VERSION=0.1.0
DATABASE_URL=<Render Postgres connection string>
CORS_ORIGINS=https://<your-frontend-domain>,https://www.<your-frontend-domain>
OPENAI_API_KEY=<your OpenAI API key>
OPENAI_ANSWER_MODEL=gpt-5-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536
KNOWLEDGE_DIR=knowledge
RAG_TOP_K=4
ADMIN_API_TOKEN=<long random secret>
ASK_RATE_LIMIT_COUNT=10
ASK_RATE_LIMIT_WINDOW_MINUTES=30
```

The initial Alembic migration runs `CREATE EXTENSION IF NOT EXISTS vector`, so the database is ready for pgvector-backed tables.

Schema is managed with Alembic migrations in `backend/migrations`. The backend start command runs:

```bash
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
```

The first migration creates and seeds this table when it is missing:

```sql
CREATE TABLE app_versions (
    id boolean PRIMARY KEY DEFAULT true,
    version text NOT NULL,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT app_versions_singleton CHECK (id)
);
```

`APP_VERSION` is only used as the initial migration seed value. After the row exists, `/health` reads the version from Postgres and does not overwrite it on startup.

For local Docker, `infra/postgres/init/001-vector.sql` only enables the `vector` extension on a fresh Postgres volume. Application tables are still created by Alembic when the backend starts.

## RAG API

The backend includes placeholder portfolio knowledge in `backend/knowledge/*.md`.

Index or reindex the markdown files into Postgres/pgvector:

```bash
curl -X POST https://<backend-host>/knowledge/reindex \
  -H "X-Admin-Token: <ADMIN_API_TOKEN>"
```

Ask a question:

```bash
curl -X POST https://<backend-host>/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"What is this portfolio built with?"}'
```

The ask flow embeds the question with `text-embedding-3-small`, retrieves the nearest `knowledge_chunks` rows from pgvector, and sends that context to `gpt-5-mini` through the OpenAI Responses API.

The `/ask` endpoint is intentionally scoped to portfolio questions about Ankit Ojha's work, projects, skills, background, and contact details. Unrelated questions are rejected before embeddings or answer-model calls run. The backend also enforces a default app-level rate limit of 10 accepted or unrelated-question attempts per IP address every 30 minutes.
