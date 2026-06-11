# Deployment

The deployment plan separates responsibilities across managed platforms. Vercel hosts the frontend from the `frontend` directory, builds the Vite app, and serves the static assets. Render hosts the FastAPI backend from the `backend` directory and connects it to a managed Postgres database. The database should have pgvector enabled so portfolio knowledge chunks can be stored with embeddings and searched by similarity.

The frontend needs a `VITE_API_BASE_URL` environment variable pointing at the Render backend or the custom API domain. The backend needs `DATABASE_URL`, `OPENAI_API_KEY`, `APP_VERSION`, `CORS_ORIGINS`, and an admin token for protected ingestion routes. Render provides `PORT` automatically for the web service, so it should not be hard-coded. The backend normalizes Render's Postgres URL into the SQLAlchemy asyncpg format internally.

The preferred public domain shape is simple: `ankojh.com` for the portfolio frontend, `www.ankojh.com` redirecting to the apex domain, and `api.ankojh.com` reserved for the backend if a custom backend domain is desired. This keeps browser requests, CORS rules, and operational debugging easier to reason about. For early testing, the default Render and Vercel URLs are acceptable.
