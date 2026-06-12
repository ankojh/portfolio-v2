# Deployment

The current portfolio is deployed as a monorepo with separate frontend and backend responsibilities.

The frontend lives in `frontend/` and is designed for Vercel. It uses React, Vite, TypeScript, Tailwind CSS, shadcn-style components, and TanStack Query. The public GitHub repository metadata lists a deployed portfolio URL at https://portfolio-v2-ten-ebon.vercel.app. The frontend should set `VITE_API_BASE_URL` to the backend URL in deployed environments. Locally, Vite can proxy API requests to the FastAPI backend.

The backend lives in `backend/` and is designed for Render. It uses FastAPI, async SQLAlchemy, asyncpg, Postgres, pgvector, Alembic migrations, and OpenAI APIs. The backend start command runs Alembic migrations before starting Uvicorn. Render provides `PORT`, so the app should not hard-code the port in production.

The database is Postgres 16 with pgvector enabled. The initial migration creates the app version table, knowledge chunks table, and question event storage. Knowledge chunks store source path, title, chunk index, content, content hash, embedding vector, embedding model, and timestamps. Question events store accepted, blocked, rate-limited, and failed ask attempts with metadata that can help improve the portfolio later.

Important environment variables include `DATABASE_URL`, `OPENAI_API_KEY`, `APP_VERSION`, `CORS_ORIGINS`, `ADMIN_API_TOKEN`, `OPENAI_ANSWER_MODEL`, `OPENAI_EMBEDDING_MODEL`, `OPENAI_EMBEDDING_DIMENSIONS`, `KNOWLEDGE_DIR`, `RAG_TOP_K`, `ASK_RATE_LIMIT_COUNT`, and `ASK_RATE_LIMIT_WINDOW_MINUTES`.

The preferred public domain shape remains simple: `ankojh.com` for the portfolio frontend, `www.ankojh.com` redirecting to the apex domain, and `api.ankojh.com` for the backend if a custom backend domain is used. This domain plan is an implementation preference from the local repository, not a confirmed public deployment fact.
