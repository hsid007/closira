"""HTTP request/response logging middleware.

Emits one structured log line per request with method, path, status,
duration, and a short correlation ID so we can grep an entire trace.
"""
import time
import uuid
from typing import Awaitable, Callable

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import get_logger

logger = get_logger("http")


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Logs each request once it's been served (or failed)."""

    async def dispatch(
        self,
        request: Request,
        call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        request_id = request.headers.get("x-request-id", str(uuid.uuid4())[:8])
        start = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception as exc:  # noqa: BLE001 — log and re-raise
            duration_ms = (time.perf_counter() - start) * 1000
            logger.exception(
                "request_failed",
                extra={
                    "event": "request_failed",
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": round(duration_ms, 2),
                    "error": str(exc),
                },
            )
            raise

        duration_ms = (time.perf_counter() - start) * 1000
        response.headers["x-request-id"] = request_id

        logger.info(
            "request_completed",
            extra={
                "event": "request_completed",
                "request_id": request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
            },
        )
        return response
