# Roadmap

The immediate roadmap is to replace placeholder portfolio content with verified facts while keeping the assistant honest. The assistant should answer from the knowledge base, show source titles in the UI, and say when details are missing. Missing details currently include verified resume content, employment history, education, contact preferences, non-public social profiles, project outcomes, and screenshots.

The current backend already supports health checks, Alembic migrations, knowledge reindexing, startup knowledge sync, RAG over Markdown files, portfolio-question filtering, saved question events, client metadata capture, and IP-based rate limiting. The next backend improvements should focus on better observability, safer admin tooling, clearer privacy controls for saved chat history, source previews, and easier knowledge updates.

The frontend roadmap should keep the chat-first direction. Useful next steps include source previews under answers, streaming responses, better empty/loading/error states, keyboard-friendly navigation, improved mobile layout, and concise project cards generated from the same verified knowledge base.

The content roadmap should add a real profile photo, resume details, verified role history, education, contact links, selected project screenshots, project problem statements, constraints, technical decisions, and outcomes. Until those facts are added, the site should avoid invented seniority, employer names, client names, production metrics, revenue claims, or confidential work.

The privacy roadmap should make chat-history saving explicit and user-friendly. The current chat notice says saved history is not a GDPR force field. Future work should add a real privacy explanation, retention policy, deletion process, and controls for what metadata is collected.
