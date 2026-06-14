# Ankit Ojha Portfolio Knowledge Base

This folder is designed for the `Ask Ankit` portfolio assistant on ankojh.com.

Each Markdown file covers one clean topic. The content is written for recruiters, founders, engineers, and hiring managers who want to understand Ankit quickly.

Recommended RAG usage:

- Treat each file as a document.
- Chunk by headings first.
- Keep `frontmatter` metadata with each chunk.
- Prefer answers that cite the source file name and heading.
- Do not expose private details unless the website owner chooses to publish them.
- Keep public-facing versions concise and professional.

Suggested chunking:

- Split on `##` headings.
- Target 400-800 tokens per chunk.
- Preserve file title, summary, tags, and intended audience as metadata.

Suggested retrieval behavior:

- Career questions: search experience, impact, skills, work style, AI Product Engineer positioning.
- Founder questions: search startup_fit, product_engineering, ownership, leadership.
- Recruiter questions: search resume_summary, skills, role_fit, AI Product Engineer positioning, education.
- Personal questions: search personal_story, interests, communication_style.
