---
title: Ask Ankit RAG Design
summary: How the portfolio Q&A system should use this knowledge base.
tags: rag, ask_ankit, ai, architecture, portfolio
audience: Engineers, recruiters curious about the project
privacy: public_portfolio_safe
---

# Ask Ankit RAG Design

## Product idea

`Ask Ankit` is a portfolio assistant that helps visitors ask questions about Ankit's work, background, projects, skills, and direction.

The assistant should not make up facts. It should retrieve from this Markdown knowledge base and answer with grounded citations.

## Why this is useful

Recruiters and founders often skim resumes quickly. A RAG assistant can answer targeted questions like:

- What is Ankit's strongest project?
- Is Ankit a full-stack engineer?
- What did he do at Pulley?
- What kind of startup is he a fit for?
- Is he actually experienced with AI?
- What is his current career direction?

## Product principle

The website should still be easy to follow without asking visitors to type. The chat should be secondary and helpful, not the only way to understand Ankit.

Recommended structure:

- Home page with clear story.
- Experience section.
- Projects section.
- Skills section.
- `Ask Ankit` assistant as an optional interactive layer.

## Suggested architecture

Frontend:

- React.
- Vercel.

Backend:

- Python FastAPI.
- Render.

Database:

- PostgreSQL.
- pgvector for embeddings.

Knowledge:

- Markdown files in `/knowledge`.

LLM:

- OpenAI API.
- Use a cost-effective model for normal Q&A.

## Retrieval behavior

For every user question:

1. Rewrite the question into a clean search query.
2. Search relevant chunks from Markdown files.
3. Use only retrieved content for factual claims.
4. Answer directly.
5. Cite source file names and headings.
6. Say when information is not available.

## Good answer style

Answers should be:

- Short.
- Clear.
- Recruiter-friendly.
- Honest.
- Not overhyped.
- Written in first person only if the website style wants it.

## Bad answer behavior

The assistant should not:

- Invent metrics.
- Claim Ankit is a machine learning researcher.
- Reveal private information.
- Overstate AI experience.
- Say he worked at companies or projects not in the knowledge base.
- Mention uncertainty as fact.

## Example question

Question:

> Is Ankit a good fit for an early-stage startup?

Good answer:

> Yes. Ankit has early-stage startup experience from Pulley, where he worked as an early engineer and owned product workflows such as valuation tools and the Offer Letter Builder. He is strongest in product engineering roles where ambiguous workflows need to become shipped software.

## Example question

Question:

> Is Ankit an AI engineer?

Good answer:

> Ankit is not positioning himself as a deep ML researcher. He is a senior product engineer building practical AI-enabled systems, including a RAG-based portfolio assistant. His AI focus is applied: retrieval, tool calling, agents, LLM evaluation, and AI-assisted workflows.
