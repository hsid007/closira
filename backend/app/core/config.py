"""Application configuration using Pydantic Settings.

Loads settings from environment variables and .env file.
Centralizing config here makes the app testable and 12-factor friendly.
"""
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "Closira API"
    app_version: str = "1.0.0"
    app_env: str = "development"
    debug: bool = True

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Database
    database_url: str = "sqlite+aiosqlite:///./closira.db"

    # CORS - accepts JSON list from env, plus permissive defaults for dev
    cors_origins: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://localhost:19006",
            "http://localhost:8081",
            "exp://localhost:19000",
            "*",
        ]
    )

    # Logging
    log_level: str = "INFO"
    log_format: str = "json"

    # Background task simulation delay (seconds) — keeps the "async feel"
    # without slowing down dev iteration too much.
    enquiry_processing_delay_seconds: float = 2.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings instance.

    Using lru_cache avoids re-parsing the .env file on every call and
    makes overriding in tests straightforward (clear the cache).
    """
    return Settings()


settings = get_settings()
