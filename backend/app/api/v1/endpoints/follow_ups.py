"""Follow-up endpoints — list pending, mark done."""
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.enquiry import FollowUpStatus
from app.schemas.enquiry import FollowUpResponse
from app.services import enquiry_service

router = APIRouter()


@router.get(
    "",
    response_model=List[FollowUpResponse],
    summary="List follow-ups",
    description="List follow-ups, defaulting to PENDING only. Ordered by due time ascending.",
)
async def list_follow_ups(
    status_filter: Optional[FollowUpStatus] = Query(
        default=FollowUpStatus.PENDING, alias="status",
    ),
    db: AsyncSession = Depends(get_db),
) -> List[FollowUpResponse]:
    items = await enquiry_service.list_follow_ups(db, status=status_filter)
    return [FollowUpResponse.model_validate(item) for item in items]


@router.post(
    "/{enquiry_id}/{follow_up_id}/complete",
    response_model=FollowUpResponse,
    summary="Mark a follow-up as done",
)
async def complete_follow_up(
    enquiry_id: str,
    follow_up_id: int,
    db: AsyncSession = Depends(get_db),
) -> FollowUpResponse:
    follow_up = await enquiry_service.complete_follow_up(
        db, enquiry_id, follow_up_id
    )
    return FollowUpResponse.model_validate(follow_up)
