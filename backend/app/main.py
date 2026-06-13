import json
import logging
from contextlib import asynccontextmanager
from typing import Any, AsyncIterator, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import AsyncSessionLocal, dispose_engine, get_session
from app.portfolio_guard import is_portfolio_question
from app.question_events import (
    count_recent_question_events,
    extract_ip_address,
    get_top_question_clusters,
    record_question_event,
)
from app.rag import (
    create_embedding,
    get_openai_client,
    reindex_knowledge,
    retrieve_context,
    stream_answer,
    sync_knowledge,
)
from app.schemas import (
    AskRequest,
    IngestResponse,
    TopQuestionResponse,
    TopQuestionsResponse,
)

# Use uvicorn's logger so startup sync output is visible in server logs.
logger = logging.getLogger("uvicorn.error")

UNRELATED_QUESTION_MESSAGE = (
    "This chat only answers questions about Ankit Ojha's portfolio, work, projects, "
    "skills, background, or contact details."
)


async def fetch_app_version(session: AsyncSession) -> str:
    result = await session.execute(
        text("SELECT version FROM app_versions WHERE id IS true")
    )
    version = result.scalar_one_or_none()
    return version or "unknown"


async def sync_knowledge_on_startup() -> None:
    """Keep the knowledge index in sync with the shipped knowledge files.

    Runs on every boot but only embeds chunks whose content changed, so steady
    restarts are a no-op. Failures (e.g. missing OPENAI_API_KEY or OpenAI being
    unreachable) are logged but never block the app from starting.
    """

    settings = get_settings()
    try:
        async with AsyncSessionLocal() as session:
            result = await sync_knowledge(session, settings)
        logger.info("Knowledge sync on startup: %s", result)
    except Exception:  # noqa: BLE001 - startup must not crash on sync failure
        logger.exception("Knowledge sync on startup failed; serving with existing index")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await sync_knowledge_on_startup()

    yield

    await dispose_engine()


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version=settings.app_version, lifespan=lifespan)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health(session: AsyncSession = Depends(get_session)) -> dict[str, Any]:
        result = await session.execute(text("SELECT 1"))
        db_ok = result.scalar_one() == 1
        app_version = await fetch_app_version(session)

        return {
            "status": "ok" if db_ok else "degraded",
            "database": "ok" if db_ok else "unavailable",
            "app_version": app_version,
        }

    @app.post("/knowledge/reindex", response_model=IngestResponse)
    async def reindex(
        x_admin_token: Optional[str] = Header(default=None),
        session: AsyncSession = Depends(get_session),
    ) -> IngestResponse:
        if not settings.admin_api_token:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="ADMIN_API_TOKEN is not configured.",
            )

        if x_admin_token != settings.admin_api_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid admin token.",
            )

        try:
            result = await reindex_knowledge(session, settings)
        except RuntimeError as error:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(error),
            ) from error

        return IngestResponse(**result)

    @app.post("/ask")
    async def ask(
        payload: AskRequest,
        http_request: Request,
        session: AsyncSession = Depends(get_session),
    ) -> StreamingResponse:
        ip_address = extract_ip_address(http_request)
        recent_question_count = await count_recent_question_events(
            session=session,
            ip_address=ip_address,
            window_minutes=settings.ask_rate_limit_window_minutes,
        )

        if recent_question_count >= settings.ask_rate_limit_count:
            await record_question_event(
                session=session,
                request=http_request,
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

        if not is_portfolio_question(payload.question):
            await record_question_event(
                session=session,
                request=http_request,
                question=payload.question,
                client_metadata=payload.client_metadata,
                event_status="blocked_unrelated",
                rejection_reason="unrelated_question",
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=UNRELATED_QUESTION_MESSAGE,
            )

        try:
            client = get_openai_client(settings)
            question_embedding = await create_embedding(client, settings, payload.question)
        except RuntimeError as error:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(error),
            ) from error

        await record_question_event(
            session=session,
            request=http_request,
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

        # All DB work is done above; the generator must not touch the session
        # because it runs after this handler returns.
        async def event_stream() -> AsyncIterator[str]:
            try:
                async for delta in stream_answer(
                    settings, payload.question, chunks, payload.history
                ):
                    yield f"data: {json.dumps({'delta': delta})}\n\n"
                yield 'data: {"done": true}\n\n'
            except Exception:  # noqa: BLE001 - surface a generic error to the client
                logger.exception("Answer streaming failed")
                yield 'data: {"error": "Answer generation failed. Please try again."}\n\n'

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
        )

    @app.get("/questions/top", response_model=TopQuestionsResponse)
    async def top_questions(session: AsyncSession = Depends(get_session)) -> TopQuestionsResponse:
        try:
            questions = await get_top_question_clusters(session, settings)
        except RuntimeError as error:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(error),
            ) from error

        return TopQuestionsResponse(
            questions=[
                TopQuestionResponse(
                    question=question.question,
                    asked_count=question.asked_count,
                )
                for question in questions
            ]
        )

    return app


app = create_app()
