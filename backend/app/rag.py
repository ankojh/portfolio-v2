from __future__ import annotations

import hashlib
from dataclasses import dataclass
from pathlib import Path
from typing import AsyncIterator, Optional

from openai import AsyncOpenAI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.schemas import ChatTurn


@dataclass(frozen=True)
class KnowledgeChunk:
    source_path: str
    title: str
    chunk_index: int
    content: str


@dataclass(frozen=True)
class RetrievedChunk:
    id: int
    source_path: str
    title: str
    content: str
    similarity: float


def get_openai_client(settings: Settings) -> AsyncOpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured.")

    return AsyncOpenAI(api_key=settings.openai_api_key)


def load_knowledge_chunks(settings: Settings) -> list[KnowledgeChunk]:
    knowledge_dir = Path(settings.knowledge_dir)
    if not knowledge_dir.is_absolute():
        knowledge_dir = Path.cwd() / knowledge_dir

    chunks: list[KnowledgeChunk] = []
    for markdown_path in sorted(knowledge_dir.glob("*.md")):
        content = markdown_path.read_text(encoding="utf-8").strip()
        if not content:
            continue

        title = _extract_title(content, markdown_path)
        relative_path = str(markdown_path.relative_to(knowledge_dir))
        for chunk_index, chunk_content in enumerate(_chunk_markdown(content)):
            chunks.append(
                KnowledgeChunk(
                    source_path=relative_path,
                    title=title,
                    chunk_index=chunk_index,
                    content=chunk_content,
                )
            )

    return chunks


async def sync_knowledge(
    session: AsyncSession,
    settings: Settings,
    *,
    force: bool = False,
) -> dict[str, int]:
    """Make the indexed chunks match the knowledge files.

    Only embeds chunks whose content changed (keyed by content_hash) and drops
    chunks that no longer exist, so repeated runs with unchanged knowledge make
    zero OpenAI calls. Pass ``force=True`` to re-embed everything from scratch.
    """

    chunks = load_knowledge_chunks(settings)
    current = {_chunk_hash(chunk): chunk for chunk in chunks}

    existing_result = await session.execute(
        text(
            "SELECT content_hash FROM knowledge_chunks WHERE embedding_model = :embedding_model"
        ),
        {"embedding_model": settings.openai_embedding_model},
    )
    existing_hashes = {row.content_hash for row in existing_result}

    if force:
        hashes_to_insert = set(current)
        hashes_to_delete = set(existing_hashes)
    else:
        hashes_to_insert = set(current) - existing_hashes
        hashes_to_delete = existing_hashes - set(current)

    if hashes_to_delete:
        await session.execute(
            text(
                """
                DELETE FROM knowledge_chunks
                WHERE embedding_model = :embedding_model
                  AND content_hash = ANY(:hashes)
                """
            ),
            {
                "embedding_model": settings.openai_embedding_model,
                "hashes": list(hashes_to_delete),
            },
        )

    if hashes_to_insert:
        client = get_openai_client(settings)
        for content_hash in hashes_to_insert:
            chunk = current[content_hash]
            embedding = await create_embedding(client, settings, chunk.content)
            await session.execute(
                text(
                    """
                    INSERT INTO knowledge_chunks (
                        source_path,
                        title,
                        chunk_index,
                        content,
                        content_hash,
                        embedding,
                        embedding_model
                    )
                    VALUES (
                        :source_path,
                        :title,
                        :chunk_index,
                        :content,
                        :content_hash,
                        CAST(:embedding AS vector),
                        :embedding_model
                    )
                    ON CONFLICT (content_hash, embedding_model) DO NOTHING
                    """
                ),
                {
                    "source_path": chunk.source_path,
                    "title": chunk.title,
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "content_hash": content_hash,
                    "embedding": vector_literal(embedding),
                    "embedding_model": settings.openai_embedding_model,
                },
            )

    await session.commit()
    return {
        "files_indexed": len({chunk.source_path for chunk in chunks}),
        "chunks_indexed": len(chunks),
        "chunks_embedded": len(hashes_to_insert),
        "chunks_deleted": len(hashes_to_delete),
    }


async def reindex_knowledge(session: AsyncSession, settings: Settings) -> dict[str, int]:
    """Full rebuild of the index (used by the admin endpoint)."""

    return await sync_knowledge(session, settings, force=True)


async def create_embedding(
    client: AsyncOpenAI,
    settings: Settings,
    text_input: str,
) -> list[float]:
    response = await client.embeddings.create(
        model=settings.openai_embedding_model,
        input=text_input,
        dimensions=settings.openai_embedding_dimensions,
    )
    return response.data[0].embedding


async def retrieve_context(
    session: AsyncSession,
    settings: Settings,
    question: str,
    question_embedding: Optional[list[float]] = None,
) -> list[RetrievedChunk]:
    if question_embedding is None:
        client = get_openai_client(settings)
        question_embedding = await create_embedding(client, settings, question)

    result = await session.execute(
        text(
            """
            SELECT
                id,
                source_path,
                title,
                content,
                1 - (embedding <=> CAST(:embedding AS vector)) AS similarity
            FROM knowledge_chunks
            WHERE embedding_model = :embedding_model
            ORDER BY embedding <=> CAST(:embedding AS vector)
            LIMIT :limit
            """
        ),
        {
            "embedding": vector_literal(question_embedding),
            "embedding_model": settings.openai_embedding_model,
            "limit": settings.rag_top_k,
        },
    )

    return [
        RetrievedChunk(
            id=row.id,
            source_path=row.source_path,
            title=row.title,
            content=row.content,
            similarity=float(row.similarity),
        )
        for row in result
    ]


async def stream_answer(
    settings: Settings,
    question: str,
    chunks: list[RetrievedChunk],
    history: Optional[list[ChatTurn]] = None,
) -> AsyncIterator[str]:
    client = get_openai_client(settings)
    context = "\n\n".join(
        f"Source: {chunk.source_path}\nTitle: {chunk.title}\nContent:\n{chunk.content}"
        for chunk in chunks
    )
    input_messages: list[dict[str, str]] = [
        {"role": turn.role, "content": turn.content} for turn in (history or [])
    ]
    input_messages.append(
        {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {question}"}
    )
    stream = await client.responses.create(
        model=settings.openai_answer_model,
        instructions=(
            "You answer questions about Ankit Ojha's portfolio on his portfolio site. "
            "Visitors may refer to Ankit as 'he', 'him', or 'you'. Use only the provided "
            "context and conversation to answer. If the answer is not in the context, "
            "say that the portfolio knowledge base does not contain that information "
            "yet, and steer the visitor back to Ankit's work, skills, or background. "
            "Keep answers concise."
        ),
        input=input_messages,
        # Minimal reasoning keeps time-to-first-token low so the answer visibly
        # streams; the context is pre-retrieved, so deep reasoning adds nothing.
        reasoning={"effort": "minimal"},
        stream=True,
    )
    async for event in stream:
        if event.type == "response.output_text.delta":
            yield event.delta


def _extract_title(content: str, markdown_path: Path) -> str:
    for line in content.splitlines():
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped.removeprefix("# ").strip()

    return markdown_path.stem.replace("-", " ").title()


def _chunk_markdown(content: str, max_words: int = 260, overlap_words: int = 40) -> list[str]:
    words = content.split()
    if len(words) <= max_words:
        return [content]

    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + max_words, len(words))
        chunks.append(" ".join(words[start:end]))
        if end == len(words):
            break
        start = max(end - overlap_words, start + 1)

    return chunks


def _chunk_hash(chunk: KnowledgeChunk) -> str:
    hash_input = f"{chunk.source_path}:{chunk.chunk_index}:{chunk.content}"
    return hashlib.sha256(hash_input.encode("utf-8")).hexdigest()


def vector_literal(embedding: list[float]) -> str:
    return "[" + ",".join(str(value) for value in embedding) + "]"
