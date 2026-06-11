from __future__ import annotations

import json
from typing import Any, Optional

from fastapi import Request
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


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


async def record_question_event(
    session: AsyncSession,
    request: Request,
    question: str,
    client_metadata: Optional[dict[str, Any]],
    event_status: str = "accepted",
    rejection_reason: Optional[str] = None,
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
                rejection_reason
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
                :rejection_reason
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
        },
    )
    await session.commit()


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
