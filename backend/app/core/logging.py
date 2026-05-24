"""Structured JSON logging configuration.

Emits one JSON object per log line so logs are machine-parseable by
tools like Datadog / Loki / CloudWatch out of the box.
"""
import logging
import sys
from typing import Any, Dict

from pythonjsonlogger import jsonlogger

from app.core.config import settings


class ContextFilter(logging.Filter):
    """Inject static context fields (service name, env) into every record."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.service = settings.app_name
        record.env = settings.app_env
        return True


def setup_logging() -> None:
    """Configure root logger for structured JSON output.

    Idempotent — safe to call multiple times (handlers are cleared first).
    """
    root = logging.getLogger()
    root.setLevel(settings.log_level.upper())

    # Remove any pre-existing handlers (uvicorn adds some by default)
    for handler in list(root.handlers):
        root.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)

    if settings.log_format == "json":
        formatter = jsonlogger.JsonFormatter(
            fmt="%(asctime)s %(levelname)s %(name)s %(message)s "
            "%(service)s %(env)s",
            rename_fields={"asctime": "timestamp", "levelname": "level"},
        )
    else:
        formatter = logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        )

    handler.setFormatter(formatter)
    handler.addFilter(ContextFilter())
    root.addHandler(handler)

    # Quiet down noisy third-party libs
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger. Use module __name__ as the convention."""
    return logging.getLogger(name)


# Python's logging module reserves these attribute names on LogRecord.
# Passing them through `extra=` raises KeyError, so we rename or drop them.
_RESERVED_LOG_FIELDS = {
    "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
    "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
    "created", "msecs", "relativeCreated", "thread", "threadName",
    "processName", "process", "message", "asctime",
}


def log_event(logger: logging.Logger, event: str, **fields: Any) -> None:
    """Log a structured event with arbitrary extra fields.

    Usage:
        log_event(logger, "enquiry_created", enquiry_id=..., channel=...)

    Any field whose name collides with a reserved LogRecord attribute is
    transparently prefixed with `ctx_` so callers don't have to remember
    the full list.
    """
    safe: Dict[str, Any] = {"event": event}
    for key, value in fields.items():
        if key in _RESERVED_LOG_FIELDS:
            safe[f"ctx_{key}"] = value
        else:
            safe[key] = value
    logger.info(event, extra=safe)
