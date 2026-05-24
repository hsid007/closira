"""Async SQLAlchemy engine, session factory, and FastAPI dependency.

Using async SQLAlchemy 2.0 with aiosqlite. The engine and sessionmaker
are module-level singletons; the dependency yields a fresh session per
request and guarantees cleanup.
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


class Base(DeclarativeBase):
    """Declarative base class for all ORM models."""

    pass


# echo=False because we use our own structured logger; turn on for SQL debug.
engine = create_async_engine(
    settings.database_url,
    echo=False,
    future=True,
    # SQLite needs check_same_thread=False when used across async tasks
    connect_args=(
        {"check_same_thread": False}
        if settings.database_url.startswith("sqlite")
        else {}
    ),
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that yields an async DB session per request.

    Commits are explicit in the service layer; this just ensures the
    session is closed even when the route raises.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """Create all tables. Called on application startup.

    For a real product this would be replaced by Alembic migrations,
    but for a take-home prototype create_all keeps onboarding to one command.
    """
    # Import models so they're registered on Base.metadata before create_all.
    # Local import avoids circular imports at module load time.
    from app.models import enquiry  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def close_db() -> None:
    """Dispose the engine. Called on shutdown."""
    await engine.dispose()
