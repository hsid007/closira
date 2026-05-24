"""Dashboard stats endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.schemas.enquiry import StatsResponse
from app.services import enquiry_service

router = APIRouter()


@router.get(
    "",
    response_model=StatsResponse,
    summary="Dashboard aggregate stats",
    description=(
        "Returns the counters powering the Home dashboard: enquiries today, "
        "missed (no SOP), open escalations, pending follow-ups, plus "
        "breakdowns by channel and status."
    ),
)
async def get_stats(db: AsyncSession = Depends(get_db)) -> StatsResponse:
    data = await enquiry_service.get_stats(db)
    return StatsResponse(**data)
