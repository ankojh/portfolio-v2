# Roadmap

The roadmap begins with backend reliability. The first milestone is a health endpoint that proves FastAPI can connect to Postgres and return a value stored in the database. The next milestone is retrieval augmented generation: markdown knowledge files are chunked, embedded with OpenAI, stored in pgvector, retrieved by question similarity, and passed into an answer model. This gives the frontend a real API to call before the interface becomes highly animated.

After the backend is stable, the frontend can become more expressive. The chat window should feel polished, fast, and deliberate. It can add tasteful motion, keyboard-friendly interactions, loading states, source previews, and eventually streamed answers. The design should stay useful and restrained, because the goal is to help visitors understand Ankit's work rather than distract them with effects.

Future backend work can include proper Alembic migrations, authenticated admin tooling, better chunking, source metadata, project links, contact capture, observability, and rate limiting. The current dummy files should be replaced with real portfolio content before public launch. Until then, the assistant should clearly treat this information as placeholder knowledge and avoid fabricating details beyond the stored markdown files.
