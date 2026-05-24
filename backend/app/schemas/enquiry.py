"""Pydantic v2 schemas for request validation and response serialization.

Every schema carries `json_schema_extra` examples so the FastAPI /docs page
shows realistic payloads and a new dev can hit the API immediately.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.enquiry import (
    Channel,
    EnquiryStatus,
    EventType,
    FollowUpStatus,
    MessageSender,
)


# ---------------------------------------------------------------------------
# Enquiry — create / response
# ---------------------------------------------------------------------------

class EnquiryCreate(BaseModel):
    """Payload to create a new inbound enquiry."""

    customer_name: str = Field(
        ..., min_length=1, max_length=255,
        description="Display name of the customer who sent the enquiry.",
    )
    customer_contact: Optional[str] = Field(
        default=None, max_length=255,
        description="Phone, email, or other identifier (optional).",
    )
    channel: Channel = Field(
        ..., description="Channel the enquiry arrived on."
    )
    message: str = Field(
        ..., min_length=1, max_length=5000,
        description="The raw inbound message text.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "customer_name": "Sarah M.",
                    "customer_contact": "+91 98xxxxxx12",
                    "channel": "whatsapp",
                    "message": "Hi, what's the price for a 2BHK cleaning service?",
                }
            ]
        }
    )


class EnquiryAcceptedResponse(BaseModel):
    """Returned immediately from POST /enquiry (202 Accepted).

    The actual processing happens in the background — the client polls
    /enquiry/{id}/history for the resolved state.
    """

    id: str = Field(..., description="Unique enquiry job ID.")
    status: EnquiryStatus = Field(..., description="Initial status.")
    message: str = Field(
        default="Enquiry accepted and queued for processing.",
        description="Human-readable acknowledgement.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "id": "enq_8f3a2b1c",
                    "status": "new",
                    "message": "Enquiry accepted and queued for processing.",
                }
            ]
        }
    )


# ---------------------------------------------------------------------------
# Messages & timeline
# ---------------------------------------------------------------------------

class MessageResponse(BaseModel):
    """A single message in a conversation thread."""

    id: int
    sender: MessageSender
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TimelineEventResponse(BaseModel):
    """A single state-change event in an enquiry's lifecycle."""

    id: int
    event_type: EventType
    description: str
    metadata_json: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Follow-ups
# ---------------------------------------------------------------------------

class FollowUpCreate(BaseModel):
    """Payload to schedule a follow-up against an open enquiry."""

    delay_minutes: int = Field(
        ..., ge=1, le=60 * 24 * 30,
        description="Minutes from now until the follow-up is due.",
    )
    message_template: Optional[str] = Field(
        default=None, max_length=2000,
        description="Optional message body to send when the follow-up fires.",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "delay_minutes": 60,
                    "message_template": "Hi Sarah, just checking in on your enquiry — happy to share more details if you're still interested.",
                }
            ]
        }
    )


class FollowUpResponse(BaseModel):
    id: int
    enquiry_id: str
    message_template: Optional[str] = None
    delay_minutes: int
    due_at: datetime
    status: FollowUpStatus
    created_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------------------------
# Escalation
# ---------------------------------------------------------------------------

class EscalateRequest(BaseModel):
    """Payload to mark an enquiry as escalated to a human agent."""

    reason: str = Field(
        ..., min_length=1, max_length=1000,
        description="Why the enquiry is being escalated.",
    )
    urgency: Optional[str] = Field(
        default="medium",
        description="Urgency level: low, medium, or high.",
        pattern="^(low|medium|high)$",
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "reason": "Customer requested a manager after pricing complaint.",
                    "urgency": "high",
                }
            ]
        }
    )


# ---------------------------------------------------------------------------
# Enquiry — read shapes
# ---------------------------------------------------------------------------

class EnquiryResponse(BaseModel):
    """Top-level enquiry record, no nested messages/timeline."""

    id: str
    customer_name: str
    customer_contact: Optional[str] = None
    channel: Channel
    initial_message: str
    status: EnquiryStatus
    matched_sop: Optional[str] = None
    sop_label: Optional[str] = None
    suggested_response: Optional[str] = None
    ai_summary: Optional[str] = None
    escalation_reason: Optional[str] = None
    escalation_urgency: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EnquiryListItem(EnquiryResponse):
    """Same as EnquiryResponse — kept distinct so list shape can evolve."""

    pass


class EnquiryDetailResponse(EnquiryResponse):
    """Full conversation + timeline for GET /enquiry/{id}/history."""

    messages: List[MessageResponse] = Field(default_factory=list)
    timeline: List[TimelineEventResponse] = Field(default_factory=list)
    follow_ups: List[FollowUpResponse] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Health & stats
# ---------------------------------------------------------------------------

class HealthResponse(BaseModel):
    status: str = Field(..., description="'ok' if all systems nominal.")
    api: str = Field(..., description="API version.")
    database: str = Field(..., description="Database connectivity status.")
    timestamp: datetime

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "status": "ok",
                    "api": "1.0.0",
                    "database": "connected",
                    "timestamp": "2026-05-23T10:00:00Z",
                }
            ]
        }
    )


class StatsResponse(BaseModel):
    """Aggregated counters for the dashboard home screen."""

    total_today: int = Field(..., description="Enquiries created today.")
    missed: int = Field(..., description="Enquiries with no SOP match.")
    open_escalations: int = Field(..., description="Active escalations.")
    follow_ups_due: int = Field(..., description="Pending follow-ups.")
    by_channel: dict = Field(default_factory=dict)
    by_status: dict = Field(default_factory=dict)
