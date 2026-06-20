from typing import Any, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.db import get_session
from app.lifespan import lifespan
from app.rag import reindex_knowledge
from app.question_events import get_top_question_clusters
from app.resume_events import record_resume_download_event
from app.schemas import (
    AskRequest,
    IngestResponse,
    ResumeDownloadRequest,
    ResumeDownloadResponse,
    TopQuestionResponse,
    TopQuestionsResponse,
)
from app.services.ask import handle_ask_request
from app.services.health import get_health_status


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
        return await get_health_status(session)

    @app.post("/knowledge/reindex", response_model=IngestResponse)
    async def reindex(
        x_admin_token: Optional[str] = Header(default=None),
        session: AsyncSession = Depends(get_session),
    ) -> IngestResponse:
        require_admin_token(settings.admin_api_token, x_admin_token)

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
        return await handle_ask_request(
            payload=payload,
            request=http_request,
            session=session,
            settings=settings,
        )

    @app.post("/resume/download", response_model=ResumeDownloadResponse)
    async def resume_download(
        payload: ResumeDownloadRequest,
        http_request: Request,
        session: AsyncSession = Depends(get_session),
    ) -> ResumeDownloadResponse:
        event_id = await record_resume_download_event(
            session=session,
            request=http_request,
            resume_url=payload.resume_url,
            client_metadata=payload.client_metadata,
        )
        return ResumeDownloadResponse(id=event_id)

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


def require_admin_token(
    configured_token: Optional[str],
    provided_token: Optional[str],
) -> None:
    if not configured_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ADMIN_API_TOKEN is not configured.",
        )

    if provided_token != configured_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin token.",
        )


app = create_app()
