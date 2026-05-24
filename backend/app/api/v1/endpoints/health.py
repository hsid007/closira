"""Health check endpoint."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_db
from app.schemas.enquiry import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Service health check",
    description=(
        "Returns API status and database connectivity. Use this for "
        "uptime monitoring, load-balancer health checks, and deploy gates."
    ),
)
async def health(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """Quick liveness + DB check.

    Issues a trivial `SELECT 1` against the database; if that succeeds we
    report `database: connected`, otherwise `database: disconnected` but
    still 200 so the endpoint itself stays observable.
    """
    db_status = "connected"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:  # noqa: BLE001
        db_status = "disconnected"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        api=settings.app_version,
        database=db_status,
        timestamp=datetime.now(timezone.utc),
    )
