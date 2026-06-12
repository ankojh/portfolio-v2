import logging
from contextlib import asynccontextmanager
from typing import Any, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
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
from app.rag import answer_question, create_embedding, get_openai_client, reindex_knowledge, sync_knowledge
from app.schemas import (
    AskRequest,
    AskResponse,
    IngestResponse,
    SourceChunk,
    TopQuestionResponse,
    TopQuestionsResponse,
)

# Use uvicorn's logger so startup sync output is visible in server logs.
logger = logging.getLogger("uvicorn.error")

RATE_LIMIT_MESSAGE = (
    "Rate limit exceeded. Please wait before asking again. "
    "Limit is 10 questions per IP every 30 minutes."
)
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

    @app.post("/ask", response_model=AskResponse)
    async def ask(
        payload: AskRequest,
        http_request: Request,
        session: AsyncSession = Depends(get_session),
    ) -> AskResponse:
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
                detail=RATE_LIMIT_MESSAGE,
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

        try:
            answer, chunks = await answer_question(
                session,
                settings,
                payload.question,
                question_embedding,
            )
        except LookupError as error:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(error),
            ) from error
        except RuntimeError as error:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(error),
            ) from error

        return AskResponse(
            answer=answer,
            sources=[
                SourceChunk(
                    source_path=chunk.source_path,
                    title=chunk.title,
                    similarity=chunk.similarity,
                    content=chunk.content,
                )
                for chunk in chunks
            ],
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
