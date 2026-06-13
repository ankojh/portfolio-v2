from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Optional

from fastapi import Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.rag import create_embedding, get_openai_client, vector_literal


TRACKED_HEADERS = (
    "accept",
    "accept-language",
    "cf-connecting-ip",
    "cf-ipcountry",
    "forwarded",
    "host",
    "origin",
    "referer",
    "user-agent",
    "x-country-code",
    "x-forwarded-for",
    "x-real-ip",
    "x-render-forwarded-for",
    "x-vercel-ip-city",
    "x-vercel-ip-country",
    "x-vercel-ip-country-region",
    "x-vercel-ip-latitude",
    "x-vercel-ip-longitude",
    "x-vercel-ip-timezone",
)


@dataclass(frozen=True)
class TopQuestion:
    question: str
    asked_count: int


async def record_question_event(
    session: AsyncSession,
    request: Request,
    question: str,
    client_metadata: Optional[dict[str, Any]],
    event_status: str = "accepted",
    rejection_reason: Optional[str] = None,
    question_embedding: Optional[list[float]] = None,
    embedding_model: Optional[str] = None,
) -> None:
    user_agent = request.headers.get("user-agent")
    request_metadata = build_request_metadata(request)

    await session.execute(
        text(
            """
            INSERT INTO question_events (
                question,
                ip_address,
                country,
                device_type,
                browser,
                operating_system,
                user_agent,
                request_metadata,
                client_metadata,
                status,
                rejection_reason,
                question_embedding,
                embedding_model
            )
            VALUES (
                :question,
                :ip_address,
                :country,
                :device_type,
                :browser,
                :operating_system,
                :user_agent,
                CAST(:request_metadata AS jsonb),
                CAST(:client_metadata AS jsonb),
                :event_status,
                :rejection_reason,
                CAST(:question_embedding AS vector),
                :embedding_model
            )
            """
        ),
        {
            "question": question,
            "ip_address": extract_ip_address(request),
            "country": extract_country(request),
            "device_type": infer_device_type(user_agent),
            "browser": infer_browser(user_agent),
            "operating_system": infer_operating_system(user_agent),
            "user_agent": user_agent,
            "request_metadata": json.dumps(request_metadata),
            "client_metadata": json.dumps(client_metadata or {}),
            "event_status": event_status,
            "rejection_reason": rejection_reason,
            "question_embedding": (
                vector_literal(question_embedding) if question_embedding is not None else None
            ),
            "embedding_model": embedding_model,
        },
    )
    await session.commit()


async def backfill_question_embeddings(
    session: AsyncSession,
    settings: Settings,
    *,
    max_rows: int = 100,
) -> int:
    if not settings.openai_api_key:
        return 0

    result = await session.execute(
        text(
            """
            SELECT id, question
            FROM question_events
            WHERE status = 'accepted'
              AND question_embedding IS NULL
            ORDER BY created_at DESC
            LIMIT :limit
            """
        ),
        {"limit": max_rows},
    )
    rows = list(result)
    if not rows:
        return 0

    client = get_openai_client(settings)
    for row in rows:
        embedding = await create_embedding(client, settings, row.question)
        await session.execute(
            text(
                """
                UPDATE question_events
                SET
                    question_embedding = CAST(:question_embedding AS vector),
                    embedding_model = :embedding_model
                WHERE id = :id
                """
            ),
            {
                "id": row.id,
                "question_embedding": vector_literal(embedding),
                "embedding_model": settings.openai_embedding_model,
            },
        )

    await session.commit()
    return len(rows)


async def get_top_question_clusters(
    session: AsyncSession,
    settings: Settings,
    *,
    limit: int = 3,
    candidate_limit: int = 24,
    similarity_threshold: float = 0.84,
) -> list[TopQuestion]:
    await backfill_question_embeddings(session, settings)

    result = await session.execute(
        text(
            """
            WITH accepted AS (
                SELECT id, question, question_embedding, created_at
                FROM question_events
                WHERE status = 'accepted'
                  AND question_embedding IS NOT NULL
                  AND embedding_model = :embedding_model
            )
            SELECT
                center.id,
                center.question,
                center.created_at,
                count(neighbor.id) AS asked_count
            FROM accepted center
            JOIN accepted neighbor
              ON 1 - (center.question_embedding <=> neighbor.question_embedding) >= :threshold
            GROUP BY center.id, center.question, center.created_at
            ORDER BY asked_count DESC, center.created_at DESC
            LIMIT :candidate_limit
            """
        ),
        {
            "embedding_model": settings.openai_embedding_model,
            "threshold": similarity_threshold,
            "candidate_limit": candidate_limit,
        },
    )
    candidates = list(result)

    selected: list[TopQuestion] = []
    selected_ids: list[int] = []
    for candidate in candidates:
        if len(selected) >= limit:
            break

        if selected_ids:
            duplicate_result = await session.execute(
                text(
                    """
                    SELECT bool_or(
                        1 - (candidate.question_embedding <=> selected.question_embedding)
                            >= :threshold
                    )
                    FROM question_events candidate
                    CROSS JOIN question_events selected
                    WHERE candidate.id = :candidate_id
                      AND selected.id = ANY(:selected_ids)
                    """
                ),
                {
                    "candidate_id": candidate.id,
                    "selected_ids": selected_ids,
                    "threshold": similarity_threshold,
                },
            )
            if duplicate_result.scalar_one():
                continue

        selected.append(
            TopQuestion(
                question=candidate.question,
                asked_count=int(candidate.asked_count),
            )
        )
        selected_ids.append(int(candidate.id))

    return selected


async def count_recent_question_events(
    session: AsyncSession,
    ip_address: Optional[str],
    window_minutes: int,
) -> int:
    result = await session.execute(
        text(
            """
            SELECT count(*)
            FROM question_events
            WHERE ip_address IS NOT DISTINCT FROM :ip_address
              AND created_at >= now() - (:window_minutes * interval '1 minute')
              AND status <> 'rate_limited'
            """
        ),
        {
            "ip_address": ip_address,
            "window_minutes": window_minutes,
        },
    )
    return int(result.scalar_one())


def build_request_metadata(request: Request) -> dict[str, Any]:
    headers = {
        header: request.headers[header]
        for header in TRACKED_HEADERS
        if header in request.headers
    }
    return {
        "headers": headers,
        "method": request.method,
        "url_path": request.url.path,
        "query": str(request.url.query),
        "client_host": request.client.host if request.client else None,
        "client_port": request.client.port if request.client else None,
    }


def extract_ip_address(request: Request) -> Optional[str]:
    for header in (
        "cf-connecting-ip",
        "x-real-ip",
        "x-render-forwarded-for",
        "x-forwarded-for",
    ):
        value = request.headers.get(header)
        if value:
            return value.split(",")[0].strip()

    if request.client:
        return request.client.host

    return None


def extract_country(request: Request) -> Optional[str]:
    for header in ("x-vercel-ip-country", "cf-ipcountry", "x-country-code"):
        value = request.headers.get(header)
        if value:
            return value

    return None


def infer_device_type(user_agent: Optional[str]) -> Optional[str]:
    if not user_agent:
        return None

    normalized = user_agent.lower()
    if any(token in normalized for token in ("bot", "crawler", "spider", "preview")):
        return "bot"
    if any(token in normalized for token in ("ipad", "tablet")):
        return "tablet"
    if any(token in normalized for token in ("mobile", "iphone", "android")):
        return "mobile"

    return "desktop"


def infer_browser(user_agent: Optional[str]) -> Optional[str]:
    if not user_agent:
        return None

    if "Edg/" in user_agent:
        return "Edge"
    if "Chrome/" in user_agent and "Chromium/" not in user_agent:
        return "Chrome"
    if "Safari/" in user_agent and "Chrome/" not in user_agent:
        return "Safari"
    if "Firefox/" in user_agent:
        return "Firefox"

    return "Other"


def infer_operating_system(user_agent: Optional[str]) -> Optional[str]:
    if not user_agent:
        return None

    normalized = user_agent.lower()
    if "iphone" in normalized or "ipad" in normalized:
        return "iOS"
    if "android" in normalized:
        return "Android"
    if "mac os x" in normalized or "macintosh" in normalized:
        return "macOS"
    if "windows" in normalized:
        return "Windows"
    if "linux" in normalized:
        return "Linux"

    return "Other"
