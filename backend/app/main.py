from contextlib import asynccontextmanager
from typing import Any, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import dispose_engine, get_session
from app.portfolio_guard import is_portfolio_question
from app.question_events import count_recent_question_events, extract_ip_address, record_question_event
from app.rag import answer_question, reindex_knowledge
from app.schemas import AskRequest, AskResponse, IngestResponse, SourceChunk

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


@asynccontextmanager
async def lifespan(app: FastAPI):
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

        await record_question_event(
            session=session,
            request=http_request,
            question=payload.question,
            client_metadata=payload.client_metadata,
            event_status="accepted",
        )

        try:
            answer, chunks = await answer_question(session, settings, payload.question)
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

    return app


app = create_app()
