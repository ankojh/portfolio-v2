from contextlib import asynccontextmanager
from typing import Any

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_settings
from app.db import dispose_engine, get_session


async def ensure_app_version_table(session: AsyncSession, settings: Settings) -> None:
    await session.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    await session.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS app_versions (
                id boolean PRIMARY KEY DEFAULT true,
                version text NOT NULL,
                updated_at timestamptz NOT NULL DEFAULT now(),
                CONSTRAINT app_versions_singleton CHECK (id)
            )
            """
        )
    )
    await session.execute(
        text(
            """
            INSERT INTO app_versions (id, version)
            VALUES (true, :version)
            ON CONFLICT (id) DO NOTHING
            """
        ),
        {"version": settings.app_version},
    )
    await session.commit()


async def fetch_app_version(session: AsyncSession) -> str:
    result = await session.execute(
        text("SELECT version FROM app_versions WHERE id IS true")
    )
    version = result.scalar_one_or_none()
    return version or "unknown"


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    async for session in get_session():
        await ensure_app_version_table(session, settings)
        break

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

    return app


app = create_app()
