from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


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
    ask_rate_limit_count: int = 10
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
        if self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)

        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

        return self.database_url


@lru_cache
def get_settings() -> Settings:
    return Settings()
