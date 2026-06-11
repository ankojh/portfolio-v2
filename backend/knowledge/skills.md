# Skills

This placeholder knowledge base frames Ankit's skills around full-stack product engineering. On the backend, the relevant themes are API design, relational data modeling, Postgres, Python services, async request handling, and deployment on managed platforms. The current scaffold uses FastAPI, SQLAlchemy's async engine, asyncpg, Render, and pgvector. That combination is intentionally conventional, which makes it easier to operate and extend.

On the frontend, the portfolio uses React, Vite, TypeScript, Tailwind CSS, shadcn-style components, and TanStack Query. The eventual design goal is an elegant chat-first interface with animation, but the first backend milestone is correctness. The frontend should remain thin while the backend establishes reliable health checks, retrieval, and question-answering behavior.

For AI work, this project should use OpenAI APIs rather than local models. Embeddings are generated with a current text embedding model and stored in Postgres. Questions are embedded, matched against portfolio knowledge chunks using vector similarity, and the retrieved context is passed to an OpenAI response model. The assistant should ground answers in retrieved text and avoid pretending it knows facts that have not been added to the knowledge base.
