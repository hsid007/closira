"""Custom exception hierarchy for the application.

A small hierarchy means routes can raise domain errors without caring
about HTTP status codes — the exception handler in main.py maps them.
"""
from typing import Any, Dict, Optional


class ClosiraException(Exception):
    """Base exception for all application-specific errors."""

    status_code: int = 500
    error_code: str = "internal_error"

    def __init__(
        self,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.details = details or {}


class NotFoundError(ClosiraException):
    """Raised when an entity is not found in the database."""

    status_code = 404
    error_code = "not_found"


class ValidationError(ClosiraException):
    """Raised when input data fails business-level validation."""

    status_code = 422
    error_code = "validation_error"


class ConflictError(ClosiraException):
    """Raised when an action conflicts with current state.

    Example: trying to escalate an enquiry that is already escalated.
    """

    status_code = 409
    error_code = "conflict"


class DatabaseError(ClosiraException):
    """Raised when a database operation fails unexpectedly."""

    status_code = 503
    error_code = "database_error"
