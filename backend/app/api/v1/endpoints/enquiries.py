"""Enquiry endpoints — the primary API surface.

Routes here are deliberately thin: parse the request, hand to the service
layer, serialize the response. Anything more complex belongs in services/.
"""
from typing import List, Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.enquiry import Channel, EnquiryStatus
from app.schemas.enquiry import (
    EnquiryAcceptedResponse,
    EnquiryCreate,
    EnquiryDetailResponse,
    EnquiryListItem,
    EnquiryResponse,
    EscalateRequest,
    FollowUpCreate,
    FollowUpResponse,
)
from app.services import enquiry_service
from app.workers.enquiry_worker import process_enquiry_task

router = APIRouter()


# ---------------------------------------------------------------------------
# Create + list
# ---------------------------------------------------------------------------

@router.post(
    "",
    response_model=EnquiryAcceptedResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Create a new inbound enquiry",
    description=(
        "Accepts a new customer enquiry, persists it, and **immediately** "
        "returns a job ID. The actual SOP matching runs in a background "
        "task; poll `GET /enquiry/{id}/history` for the resolved state."
    ),
    responses={
        202: {
            "description": "Enquiry accepted and queued for processing.",
            "content": {
                "application/json": {
                    "example": {
                        "id": "enq_8f3a2b1c",
                        "status": "new",
                        "message": "Enquiry accepted and queued for processing.",
                    }
                }
            },
        }
    },
)
async def create_enquiry(
    payload: EnquiryCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> EnquiryAcceptedResponse:
    enquiry = await enquiry_service.create_enquiry(db, payload)
    background_tasks.add_task(process_enquiry_task, enquiry.id)
    return EnquiryAcceptedResponse(id=enquiry.id, status=enquiry.status)


@router.get(
    "",
    response_model=List[EnquiryListItem],
    summary="List enquiries",
    description="List enquiries with optional status/channel filters, newest first.",
)
async def list_enquiries(
    status_filter: Optional[EnquiryStatus] = Query(
        default=None, alias="status",
        description="Filter by enquiry status.",
    ),
    channel: Optional[Channel] = Query(
        default=None, description="Filter by channel.",
    ),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
) -> List[EnquiryListItem]:
    items = await enquiry_service.list_enquiries(
        db, status=status_filter, channel=channel, limit=limit, offset=offset
    )
    return [EnquiryListItem.model_validate(item) for item in items]


# ---------------------------------------------------------------------------
# Read
# ---------------------------------------------------------------------------

@router.get(
    "/{enquiry_id}",
    response_model=EnquiryResponse,
    summary="Get an enquiry by ID",
)
async def get_enquiry(
    enquiry_id: str,
    db: AsyncSession = Depends(get_db),
) -> EnquiryResponse:
    enquiry = await enquiry_service.get_enquiry(db, enquiry_id)
    return EnquiryResponse.model_validate(enquiry)


@router.get(
    "/{enquiry_id}/history",
    response_model=EnquiryDetailResponse,
    summary="Full conversation + status timeline",
    description=(
        "Returns the enquiry record plus its complete message thread, "
        "audit timeline, and all scheduled follow-ups. This is the "
        "endpoint the Conversation Detail screen consumes."
    ),
)
async def get_enquiry_history(
    enquiry_id: str,
    db: AsyncSession = Depends(get_db),
) -> EnquiryDetailResponse:
    enquiry = await enquiry_service.get_enquiry_with_details(db, enquiry_id)
    return EnquiryDetailResponse.model_validate(enquiry)


# ---------------------------------------------------------------------------
# Follow-up & escalate
# ---------------------------------------------------------------------------

@router.post(
    "/{enquiry_id}/followup",
    response_model=FollowUpResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule a follow-up",
)
async def schedule_follow_up(
    enquiry_id: str,
    payload: FollowUpCreate,
    db: AsyncSession = Depends(get_db),
) -> FollowUpResponse:
    follow_up = await enquiry_service.schedule_follow_up(db, enquiry_id, payload)
    return FollowUpResponse.model_validate(follow_up)


@router.post(
    "/{enquiry_id}/escalate",
    response_model=EnquiryResponse,
    summary="Escalate to a human agent",
)
async def escalate_enquiry(
    enquiry_id: str,
    payload: EscalateRequest,
    db: AsyncSession = Depends(get_db),
) -> EnquiryResponse:
    enquiry = await enquiry_service.escalate_enquiry(db, enquiry_id, payload)
    return EnquiryResponse.model_validate(enquiry)


@router.post(
    "/{enquiry_id}/resolve",
    response_model=EnquiryResponse,
    summary="Mark enquiry as resolved",
)
async def resolve_enquiry(
    enquiry_id: str,
    db: AsyncSession = Depends(get_db),
) -> EnquiryResponse:
    enquiry = await enquiry_service.resolve_enquiry(db, enquiry_id)
    return EnquiryResponse.model_validate(enquiry)
