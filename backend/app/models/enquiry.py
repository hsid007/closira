"""ORM models for the enquiry-handling pipeline.

Schema rationale (see README for full discussion):
- `enquiries`  one row per inbound customer enquiry. Lifecycle state lives
  here (status, matched SOP, suggested response).
- `messages`   normalized append-only conversation history, FK to enquiry.
- `timeline_events`  audit log of state changes (created, sop_matched,
  escalated, follow_up_scheduled, resolved). Separate from messages so we
  can render a clean "status timeline" in the UI without mixing chat.
- `follow_ups`  scheduled outbound nudges; can be marked done independently.

`tenant_id` is stubbed on every table — single-tenant today but the column
is there so multi-tenant routing can be wired in later without a migration.
"""
import enum
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import (
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def utc_now() -> datetime:
    """Return current UTC time as a timezone-aware datetime."""
    return datetime.now(timezone.utc)


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class Channel(str, enum.Enum):
    WHATSAPP = "whatsapp"
    EMAIL = "email"
    CALL = "call"


class EnquiryStatus(str, enum.Enum):
    NEW = "new"
    PROCESSING = "processing"
    QUALIFIED = "qualified"
    ESCALATED = "escalated"
    RESOLVED = "resolved"


class MessageSender(str, enum.Enum):
    CUSTOMER = "customer"
    SYSTEM = "system"
    AGENT = "agent"
    AI = "ai"


class EventType(str, enum.Enum):
    ENQUIRY_CREATED = "enquiry_created"
    PROCESSING_STARTED = "processing_started"
    SOP_MATCHED = "sop_matched"
    SOP_NOT_MATCHED = "sop_not_matched"
    ESCALATED = "escalated"
    FOLLOW_UP_SCHEDULED = "follow_up_scheduled"
    FOLLOW_UP_COMPLETED = "follow_up_completed"
    RESOLVED = "resolved"
    MESSAGE_ADDED = "message_added"


class FollowUpStatus(str, enum.Enum):
    PENDING = "pending"
    DONE = "done"
    CANCELLED = "cancelled"


# ---------------------------------------------------------------------------
# Tables
# ---------------------------------------------------------------------------

class Enquiry(Base):
    """An inbound customer enquiry across any channel."""

    __tablename__ = "enquiries"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    tenant_id: Mapped[str] = mapped_column(
        String(64), nullable=False, default="default", index=True
    )

    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_contact: Mapped[Optional[str]] = mapped_column(String(255))
    channel: Mapped[Channel] = mapped_column(
        SAEnum(Channel, name="channel_enum"), nullable=False, index=True
    )

    initial_message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[EnquiryStatus] = mapped_column(
        SAEnum(EnquiryStatus, name="enquiry_status_enum"),
        nullable=False,
        default=EnquiryStatus.NEW,
        index=True,
    )

    matched_sop: Mapped[Optional[str]] = mapped_column(String(64))
    sop_label: Mapped[Optional[str]] = mapped_column(String(255))
    suggested_response: Mapped[Optional[str]] = mapped_column(Text)
    ai_summary: Mapped[Optional[str]] = mapped_column(Text)

    # Escalation fields populated when status flips to ESCALATED
    escalation_reason: Mapped[Optional[str]] = mapped_column(Text)
    escalation_urgency: Mapped[Optional[str]] = mapped_column(String(16))

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
        nullable=False,
    )

    messages: Mapped[List["Message"]] = relationship(
        back_populates="enquiry",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
    )
    timeline: Mapped[List["TimelineEvent"]] = relationship(
        back_populates="enquiry",
        cascade="all, delete-orphan",
        order_by="TimelineEvent.created_at",
    )
    follow_ups: Mapped[List["FollowUp"]] = relationship(
        back_populates="enquiry",
        cascade="all, delete-orphan",
        order_by="FollowUp.due_at",
    )


class Message(Base):
    """A single message in an enquiry's conversation thread."""

    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    enquiry_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("enquiries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender: Mapped[MessageSender] = mapped_column(
        SAEnum(MessageSender, name="message_sender_enum"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )

    enquiry: Mapped["Enquiry"] = relationship(back_populates="messages")


class TimelineEvent(Base):
    """Audit log entry for an enquiry state change."""

    __tablename__ = "timeline_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    enquiry_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("enquiries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    event_type: Mapped[EventType] = mapped_column(
        SAEnum(EventType, name="event_type_enum"), nullable=False
    )
    description: Mapped[str] = mapped_column(String(512), nullable=False)
    # Free-form JSON-as-text for event payloads (SOP id, reason, etc.)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False, index=True
    )

    enquiry: Mapped["Enquiry"] = relationship(back_populates="timeline")


class FollowUp(Base):
    """A scheduled follow-up nudge for an enquiry."""

    __tablename__ = "follow_ups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    enquiry_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("enquiries.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    message_template: Mapped[Optional[str]] = mapped_column(Text)
    delay_minutes: Mapped[int] = mapped_column(Integer, nullable=False)
    due_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, index=True
    )
    status: Mapped[FollowUpStatus] = mapped_column(
        SAEnum(FollowUpStatus, name="follow_up_status_enum"),
        nullable=False,
        default=FollowUpStatus.PENDING,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    enquiry: Mapped["Enquiry"] = relationship(back_populates="follow_ups")
