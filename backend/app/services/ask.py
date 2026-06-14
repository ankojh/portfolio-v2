import json
import logging
from typing import AsyncIterator

from fastapi import HTTPException, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings
from app.db import AsyncSessionLocal
from app.portfolio_guard import is_portfolio_question
from app.question_events import (
    count_recent_question_events,
    extract_ip_address,
    record_question_event,
    update_question_event_answer,
)
from app.rag import (
    RetrievedChunk,
    create_embedding,
    get_openai_client,
    retrieve_context,
    stream_answer,
)
from app.schemas import AskRequest

logger = logging.getLogger("uvicorn.error")

UNRELATED_QUESTION_MESSAGE = (
    "This chat only answers questions about Ankit Ojha's portfolio, work, projects, "
    "skills, background, or contact details."
)


async def handle_ask_request(
    *,
    payload: AskRequest,
    request: Request,
    session: AsyncSession,
    settings: Settings,
) -> StreamingResponse:
    await enforce_rate_limit(
        payload=payload,
        request=request,
        session=session,
        settings=settings,
    )
    await ensure_portfolio_question(payload=payload, request=request, session=session)

    question_embedding = await embed_question(payload.question, settings)
    question_event_id = await record_question_event(
        session=session,
        request=request,
        question=payload.question,
        client_metadata=payload.client_metadata,
        event_status="accepted",
        question_embedding=question_embedding,
        embedding_model=settings.openai_embedding_model,
    )

    chunks = await retrieve_context(session, settings, payload.question, question_embedding)
    if not chunks:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No knowledge chunks are indexed yet.",
        )

    return StreamingResponse(
        stream_answer_events(
            payload=payload,
            settings=settings,
            chunks=chunks,
            question_event_id=question_event_id,
        ),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


async def enforce_rate_limit(
    *,
    payload: AskRequest,
    request: Request,
    session: AsyncSession,
    settings: Settings,
) -> None:
    recent_question_count = await count_recent_question_events(
        session=session,
        ip_address=extract_ip_address(request),
        window_minutes=settings.ask_rate_limit_window_minutes,
    )

    if recent_question_count < settings.ask_rate_limit_count:
        return

    await record_question_event(
        session=session,
        request=request,
        question=payload.question,
        client_metadata=payload.client_metadata,
        event_status="rate_limited",
        rejection_reason="rate_limit",
    )
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=(
            "Rate limit exceeded. Please wait before asking again. "
            f"Limit is {settings.ask_rate_limit_count} questions per IP "
            f"every {settings.ask_rate_limit_window_minutes} minutes."
        ),
    )


async def ensure_portfolio_question(
    *,
    payload: AskRequest,
    request: Request,
    session: AsyncSession,
) -> None:
    if is_portfolio_question(payload.question):
        return

    await record_question_event(
        session=session,
        request=request,
        question=payload.question,
        client_metadata=payload.client_metadata,
        event_status="blocked_unrelated",
        rejection_reason="unrelated_question",
    )
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=UNRELATED_QUESTION_MESSAGE,
    )


async def embed_question(question: str, settings: Settings) -> list[float]:
    try:
        client = get_openai_client(settings)
        return await create_embedding(client, settings, question)
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from error


async def stream_answer_events(
    *,
    payload: AskRequest,
    settings: Settings,
    chunks: list[RetrievedChunk],
    question_event_id: int,
) -> AsyncIterator[str]:
    answer_parts: list[str] = []
    try:
        async for delta in stream_answer(
            settings, payload.question, chunks, payload.history
        ):
            answer_parts.append(delta)
            yield f"data: {json.dumps({'delta': delta})}\n\n"

        await store_answer(question_event_id, "".join(answer_parts).strip())
        yield 'data: {"done": true}\n\n'
    except Exception:  # noqa: BLE001 - surface a generic error to the client
        logger.exception("Answer streaming failed")
        yield 'data: {"error": "Answer generation failed. Please try again."}\n\n'


async def store_answer(event_id: int, assistant_answer: str) -> None:
    if not assistant_answer:
        return

    try:
        async with AsyncSessionLocal() as session:
            await update_question_event_answer(
                session,
                event_id=event_id,
                assistant_answer=assistant_answer,
            )
    except Exception:  # noqa: BLE001 - analytics must not break chat
        logger.exception("Failed to store assistant answer")
