from __future__ import annotations

import json
from typing import Any, Optional

from fastapi import Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.question_events import (
    build_request_metadata,
    extract_country,
    extract_ip_address,
    infer_browser,
    infer_device_type,
    infer_operating_system,
)


async def record_resume_download_event(
    session: AsyncSession,
    request: Request,
    resume_url: str,
    client_metadata: Optional[dict[str, Any]],
) -> int:
    user_agent = request.headers.get("user-agent")
    request_metadata = build_request_metadata(request)

    result = await session.execute(
        text(
            """
            INSERT INTO resume_download_events (
                resume_url,
                ip_address,
                country,
                device_type,
                browser,
                operating_system,
                user_agent,
                request_metadata,
                client_metadata
            )
            VALUES (
                :resume_url,
                :ip_address,
                :country,
                :device_type,
                :browser,
                :operating_system,
                :user_agent,
                CAST(:request_metadata AS jsonb),
                CAST(:client_metadata AS jsonb)
            )
            RETURNING id
            """
        ),
        {
            "resume_url": resume_url,
            "ip_address": extract_ip_address(request),
            "country": extract_country(request),
            "device_type": infer_device_type(user_agent),
            "browser": infer_browser(user_agent),
            "operating_system": infer_operating_system(user_agent),
            "user_agent": user_agent,
            "request_metadata": json.dumps(request_metadata),
            "client_metadata": json.dumps(client_metadata or {}),
        },
    )
    await session.commit()
    return int(result.scalar_one())
