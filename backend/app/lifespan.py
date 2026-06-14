import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.config import get_settings
from app.db import AsyncSessionLocal, dispose_engine
from app.rag import sync_knowledge

# Use uvicorn's logger so startup sync output is visible in server logs.
logger = logging.getLogger("uvicorn.error")


async def sync_knowledge_on_startup() -> None:
    """Keep the knowledge index in sync without blocking app startup on failure."""

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
