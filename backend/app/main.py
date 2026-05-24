"""FastAPI application entrypoint.

Wires together:
  - structured logging (configured before anything else)
  - DB lifecycle (init on startup, dispose on shutdown)
  - CORS so the React Native client can call us during dev
  - request logging middleware
  - global exception handlers that map domain errors → HTTP responses
  - the versioned API router under /api/v1
  - thin /health, /enquiry, /follow-ups, /stats aliases at the root for the
    exact paths the assignment PDF lists
"""
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import AsyncIterator

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1 import api_router
from app.core.config import settings
from app.core.exceptions import ClosiraException
from app.core.logging import get_logger, log_event, setup_logging
from app.db.session import close_db, init_db
from app.utils.middleware import RequestLoggingMiddleware

# Initialize logging *before* anything else writes a log line
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Initialize and tear down resources around the app's lifetime."""
    log_event(logger, "app_starting", version=settings.app_version)
    await init_db()
    log_event(logger, "app_started")
    try:
        yield
    finally:
        log_event(logger, "app_stopping")
        await close_db()
        log_event(logger, "app_stopped")


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Closira's customer enquiry-handling backend. Handles inbound "
        "enquiries from WhatsApp, email, and phone; matches messages to "
        "SOPs; schedules follow-ups; and escalates to human agents."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-request-id"],
)
app.add_middleware(RequestLoggingMiddleware)


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(ClosiraException)
async def closira_exception_handler(
    request: Request, exc: ClosiraException
) -> JSONResponse:
    """Map every domain exception to a clean JSON error response."""
    logger.warning(
        "domain_exception",
        extra={
            "event": "domain_exception",
            "error_code": exc.error_code,
            "error_message": exc.message,
            "path": request.url.path,
        },
    )
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.message,
                "details": exc.details,
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Pydantic validation errors → 422 with a uniform error envelope."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": {
                "code": "validation_error",
                "message": "Request payload failed validation.",
                "details": {"errors": exc.errors()},
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    """Last-resort catcher — log the traceback, return generic 500."""
    logger.exception(
        "unhandled_exception",
        extra={
            "event": "unhandled_exception",
            "path": request.url.path,
            "error": str(exc),
        },
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": {
                "code": "internal_error",
                "message": "An unexpected error occurred.",
                "details": {},
            }
        },
    )


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

# Mount the same router twice: once under the versioned /api/v1 prefix and
# once at the root so the exact paths from the assignment PDF
# (/enquiry, /health, etc.) work without /api/v1 in front of them.
app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router)


@app.get("/", include_in_schema=False)
async def root() -> dict:
    """Tiny landing JSON so hitting / in a browser is informative."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
