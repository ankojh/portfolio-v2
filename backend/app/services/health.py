from typing import Any

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


async def fetch_app_version(session: AsyncSession) -> str:
    result = await session.execute(
        text("SELECT version FROM app_versions WHERE id IS true")
    )
    version = result.scalar_one_or_none()
    return version or "unknown"


async def get_health_status(session: AsyncSession) -> dict[str, Any]:
    result = await session.execute(text("SELECT 1"))
    db_ok = result.scalar_one() == 1
    app_version = await fetch_app_version(session)

    return {
        "status": "ok" if db_ok else "degraded",
        "database": "ok" if db_ok else "unavailable",
        "app_version": app_version,
    }
