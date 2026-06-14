from functools import lru_cache
from typing import Any, Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy.engine import make_url


ASYNC_PG_DSN_ONLY_QUERY_KEYS = ("channel_binding", "sslmode")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    app_name: str = "Ankit Ojha's Portfolio"
    app_version: str = "0.1.0"
    database_url: str = "postgresql+asyncpg://portfolio:portfolio@localhost:5432/portfolio"
    openai_api_key: Optional[str] = None
    openai_answer_model: str = "gpt-5-mini"
    openai_embedding_model: str = "text-embedding-3-small"
    openai_embedding_dimensions: int = 1536
    knowledge_dir: str = "knowledge"
    rag_top_k: int = 4
    admin_api_token: Optional[str] = None
    ask_rate_limit_count: int = 12
    ask_rate_limit_window_minutes: int = 30
    cors_origins: str = Field(
        default=(
            "http://localhost:5173,"
            "http://127.0.0.1:5173,"
            "https://ankojh.com,"
            "https://www.ankojh.com"
        ),
        description="Comma-separated list of allowed frontend origins.",
    )

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def sqlalchemy_database_url(self) -> str:
        url = make_url(self.database_url)
        if url.drivername in {"postgres", "postgresql"}:
            url = url.set(drivername="postgresql+asyncpg")

        # Neon/libpq URLs commonly include query params such as sslmode and
        # channel_binding. SQLAlchemy's asyncpg dialect would pass those as
        # keyword args to asyncpg.connect(), where they are not accepted.
        url = url.difference_update_query(ASYNC_PG_DSN_ONLY_QUERY_KEYS)

        return url.render_as_string(hide_password=False)

    @property
    def sqlalchemy_connect_args(self) -> dict[str, Any]:
        url = make_url(self.database_url)
        sslmode = url.query.get("sslmode")
        if isinstance(sslmode, tuple):
            sslmode = sslmode[-1]

        if not sslmode or sslmode == "disable" or "ssl" in url.query:
            return {}

        return {"ssl": sslmode}


@lru_cache
def get_settings() -> Settings:
    return Settings()
