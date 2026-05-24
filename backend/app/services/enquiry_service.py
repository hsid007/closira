"""Enquiry service — all DB-touching business logic lives here.

Keeping this layer separate from the routes means:
- routes stay thin (parse request → call service → serialize),
- the same logic can be reused from the background worker without
  duplicating commit/rollback boilerplate.
"""
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.core.logging import get_logger, log_event
from app.models.enquiry import (
    Channel,
    Enquiry,
    EnquiryStatus,
    EventType,
    FollowUp,
    FollowUpStatus,
    Message,
    MessageSender,
    TimelineEvent,
    utc_now,
)
from app.schemas.enquiry import EnquiryCreate, EscalateRequest, FollowUpCreate
from app.services.sop_matcher import generate_summary, match_sop

logger = get_logger(__name__)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _generate_enquiry_id() -> str:
    """Generate a short, URL-safe enquiry ID like 'enq_8f3a2b1c'."""
    return f"enq_{secrets.token_hex(4)}"


async def _add_timeline(
    db: AsyncSession,
    enquiry_id: str,
    event_type: EventType,
    description: str,
    metadata: Optional[dict] = None,
) -> TimelineEvent:
    """Append a timeline event. Caller is responsible for commit."""
    event = TimelineEvent(
        enquiry_id=enquiry_id,
        event_type=event_type,
        description=description,
        metadata_json=json.dumps(metadata) if metadata else None,
    )
    db.add(event)
    return event


async def _add_message(
    db: AsyncSession,
    enquiry_id: str,
    sender: MessageSender,
    content: str,
) -> Message:
    """Append a message to a conversation. Caller is responsible for commit."""
    msg = Message(enquiry_id=enquiry_id, sender=sender, content=content)
    db.add(msg)
    return msg


# ---------------------------------------------------------------------------
# Create
# ---------------------------------------------------------------------------

async def create_enquiry(
    db: AsyncSession, payload: EnquiryCreate
) -> Enquiry:
    """Persist a brand-new enquiry in NEW state.

    Also seeds the conversation with the customer's first message and an
    'enquiry_created' timeline event. The background task picks it up from
    here.
    """
    enquiry = Enquiry(
        id=_generate_enquiry_id(),
        customer_name=payload.customer_name,
        customer_contact=payload.customer_contact,
        channel=payload.channel,
        initial_message=payload.message,
        status=EnquiryStatus.NEW,
    )
    db.add(enquiry)

    await _add_message(
        db, enquiry.id, MessageSender.CUSTOMER, payload.message
    )
    await _add_timeline(
        db,
        enquiry.id,
        EventType.ENQUIRY_CREATED,
        f"Enquiry received via {payload.channel.value}",
        metadata={"channel": payload.channel.value},
    )

    await db.commit()
    await db.refresh(enquiry)

    log_event(
        logger, "enquiry_created",
        enquiry_id=enquiry.id,
        channel=payload.channel.value,
        customer=payload.customer_name,
    )
    return enquiry


# ---------------------------------------------------------------------------
# Background processing
# ---------------------------------------------------------------------------

async def process_enquiry(db: AsyncSession, enquiry_id: str) -> None:
    """Background-task entrypoint.

    Runs SOP matching, updates the enquiry status, appends a suggested
    response from the AI, and writes the appropriate timeline events.
    Escalates automatically when no SOP matches OR when the SOP itself
    is marked as requiring escalation (e.g. complaints).
    """
    enquiry = await db.get(Enquiry, enquiry_id)
    if enquiry is None:
        logger.warning(
            "process_enquiry: id not found",
            extra={"enquiry_id": enquiry_id},
        )
        return

    enquiry.status = EnquiryStatus.PROCESSING
    await _add_timeline(
        db,
        enquiry_id,
        EventType.PROCESSING_STARTED,
        "Background processing started",
    )
    await db.commit()

    sop = match_sop(enquiry.initial_message)
    summary = generate_summary(enquiry.initial_message, sop)
    enquiry.ai_summary = summary

    if sop is None:
        # No match → flag for human review
        enquiry.status = EnquiryStatus.ESCALATED
        enquiry.escalation_reason = (
            "No matching SOP found for inbound message — needs human review."
        )
        enquiry.escalation_urgency = "medium"

        await _add_timeline(
            db, enquiry_id, EventType.SOP_NOT_MATCHED,
            "No SOP matched the message content",
        )
        await _add_timeline(
            db, enquiry_id, EventType.ESCALATED,
            "Auto-escalated: no SOP match",
            metadata={"reason": enquiry.escalation_reason, "auto": True},
        )
        log_event(
            logger, "escalation_triggered",
            enquiry_id=enquiry_id, reason="no_sop_match",
        )
    else:
        enquiry.matched_sop = sop.id
        enquiry.sop_label = sop.label
        enquiry.suggested_response = sop.suggested_response

        await _add_message(
            db, enquiry_id, MessageSender.AI, sop.suggested_response,
        )
        await _add_timeline(
            db, enquiry_id, EventType.SOP_MATCHED,
            f"Matched SOP: {sop.label}",
            metadata={"sop_id": sop.id, "sop_label": sop.label},
        )
        log_event(
            logger, "sop_matched",
            enquiry_id=enquiry_id, sop_id=sop.id, sop_label=sop.label,
        )

        if sop.requires_escalation:
            enquiry.status = EnquiryStatus.ESCALATED
            enquiry.escalation_reason = (
                f"SOP '{sop.label}' requires human attention."
            )
            enquiry.escalation_urgency = "high"
            await _add_timeline(
                db, enquiry_id, EventType.ESCALATED,
                f"Auto-escalated: SOP '{sop.label}' requires human handling",
                metadata={"sop_id": sop.id, "auto": True},
            )
            log_event(
                logger, "escalation_triggered",
                enquiry_id=enquiry_id, reason="sop_required_escalation",
                sop_id=sop.id,
            )
        else:
            enquiry.status = EnquiryStatus.QUALIFIED

    await db.commit()
    log_event(
        logger, "task_processed",
        enquiry_id=enquiry_id, final_status=enquiry.status.value,
    )


# ---------------------------------------------------------------------------
# Reads
# ---------------------------------------------------------------------------

async def get_enquiry(db: AsyncSession, enquiry_id: str) -> Enquiry:
    """Fetch an enquiry by ID or raise NotFoundError."""
    enquiry = await db.get(Enquiry, enquiry_id)
    if enquiry is None:
        raise NotFoundError(
            f"Enquiry '{enquiry_id}' not found",
            details={"enquiry_id": enquiry_id},
        )
    return enquiry


async def get_enquiry_with_details(
    db: AsyncSession, enquiry_id: str
) -> Enquiry:
    """Fetch an enquiry with messages, timeline, and follow-ups eagerly loaded."""
    stmt = (
        select(Enquiry)
        .where(Enquiry.id == enquiry_id)
        .options(
            selectinload(Enquiry.messages),
            selectinload(Enquiry.timeline),
            selectinload(Enquiry.follow_ups),
        )
    )
    result = await db.execute(stmt)
    enquiry = result.scalar_one_or_none()
    if enquiry is None:
        raise NotFoundError(
            f"Enquiry '{enquiry_id}' not found",
            details={"enquiry_id": enquiry_id},
        )
    return enquiry


async def list_enquiries(
    db: AsyncSession,
    status: Optional[EnquiryStatus] = None,
    channel: Optional[Channel] = None,
    limit: int = 100,
    offset: int = 0,
) -> List[Enquiry]:
    """List enquiries with optional filters, newest first."""
    stmt = select(Enquiry).order_by(Enquiry.created_at.desc())
    if status:
        stmt = stmt.where(Enquiry.status == status)
    if channel:
        stmt = stmt.where(Enquiry.channel == channel)
    stmt = stmt.limit(limit).offset(offset)
    result = await db.execute(stmt)
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Escalation
# ---------------------------------------------------------------------------

async def escalate_enquiry(
    db: AsyncSession, enquiry_id: str, payload: EscalateRequest
) -> Enquiry:
    """Manually escalate an enquiry to a human agent."""
    enquiry = await get_enquiry(db, enquiry_id)

    if enquiry.status == EnquiryStatus.RESOLVED:
        raise ConflictError(
            "Cannot escalate a resolved enquiry.",
            details={"enquiry_id": enquiry_id, "status": enquiry.status.value},
        )

    enquiry.status = EnquiryStatus.ESCALATED
    enquiry.escalation_reason = payload.reason
    enquiry.escalation_urgency = payload.urgency or "medium"

    await _add_timeline(
        db, enquiry_id, EventType.ESCALATED,
        f"Manually escalated: {payload.reason}",
        metadata={
            "reason": payload.reason,
            "urgency": enquiry.escalation_urgency,
            "auto": False,
        },
    )
    await db.commit()
    await db.refresh(enquiry)

    log_event(
        logger, "escalation_triggered",
        enquiry_id=enquiry_id,
        reason=payload.reason,
        urgency=enquiry.escalation_urgency,
        manual=True,
    )
    return enquiry


async def resolve_enquiry(db: AsyncSession, enquiry_id: str) -> Enquiry:
    """Mark an enquiry as resolved."""
    enquiry = await get_enquiry(db, enquiry_id)
    enquiry.status = EnquiryStatus.RESOLVED
    await _add_timeline(
        db, enquiry_id, EventType.RESOLVED,
        "Enquiry marked as resolved",
    )
    await db.commit()
    await db.refresh(enquiry)
    log_event(logger, "enquiry_resolved", enquiry_id=enquiry_id)
    return enquiry


# ---------------------------------------------------------------------------
# Follow-ups
# ---------------------------------------------------------------------------

async def schedule_follow_up(
    db: AsyncSession, enquiry_id: str, payload: FollowUpCreate
) -> FollowUp:
    """Schedule a follow-up for an open enquiry."""
    enquiry = await get_enquiry(db, enquiry_id)

    if enquiry.status == EnquiryStatus.RESOLVED:
        raise ConflictError(
            "Cannot schedule a follow-up on a resolved enquiry.",
            details={"enquiry_id": enquiry_id, "status": enquiry.status.value},
        )

    due_at = utc_now() + timedelta(minutes=payload.delay_minutes)
    follow_up = FollowUp(
        enquiry_id=enquiry_id,
        message_template=payload.message_template,
        delay_minutes=payload.delay_minutes,
        due_at=due_at,
        status=FollowUpStatus.PENDING,
    )
    db.add(follow_up)

    await _add_timeline(
        db, enquiry_id, EventType.FOLLOW_UP_SCHEDULED,
        f"Follow-up scheduled in {payload.delay_minutes} min",
        metadata={
            "delay_minutes": payload.delay_minutes,
            "due_at": due_at.isoformat(),
        },
    )
    await db.commit()
    await db.refresh(follow_up)

    log_event(
        logger, "follow_up_scheduled",
        enquiry_id=enquiry_id,
        delay_minutes=payload.delay_minutes,
        due_at=due_at.isoformat(),
    )
    return follow_up


async def complete_follow_up(
    db: AsyncSession, enquiry_id: str, follow_up_id: int
) -> FollowUp:
    """Mark a follow-up as done."""
    follow_up = await db.get(FollowUp, follow_up_id)
    if follow_up is None or follow_up.enquiry_id != enquiry_id:
        raise NotFoundError(
            f"Follow-up '{follow_up_id}' not found for enquiry '{enquiry_id}'.",
            details={"enquiry_id": enquiry_id, "follow_up_id": follow_up_id},
        )

    if follow_up.status == FollowUpStatus.DONE:
        raise ConflictError(
            "Follow-up is already marked as done.",
            details={"follow_up_id": follow_up_id},
        )

    follow_up.status = FollowUpStatus.DONE
    follow_up.completed_at = utc_now()

    await _add_timeline(
        db, enquiry_id, EventType.FOLLOW_UP_COMPLETED,
        "Follow-up marked as complete",
        metadata={"follow_up_id": follow_up_id},
    )
    await db.commit()
    await db.refresh(follow_up)

    log_event(
        logger, "follow_up_completed",
        enquiry_id=enquiry_id, follow_up_id=follow_up_id,
    )
    return follow_up


async def list_follow_ups(
    db: AsyncSession,
    status: Optional[FollowUpStatus] = FollowUpStatus.PENDING,
) -> List[FollowUp]:
    """List follow-ups, defaulting to pending only."""
    stmt = select(FollowUp).order_by(FollowUp.due_at.asc())
    if status:
        stmt = stmt.where(FollowUp.status == status)
    result = await db.execute(stmt)
    return list(result.scalars().all())


# ---------------------------------------------------------------------------
# Stats
# ---------------------------------------------------------------------------

async def get_stats(db: AsyncSession) -> dict:
    """Aggregate counters for the dashboard home screen."""
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )

    total_today_q = select(func.count(Enquiry.id)).where(
        Enquiry.created_at >= today_start
    )
    missed_q = select(func.count(Enquiry.id)).where(
        Enquiry.matched_sop.is_(None),
        Enquiry.status == EnquiryStatus.ESCALATED,
    )
    open_escalations_q = select(func.count(Enquiry.id)).where(
        Enquiry.status == EnquiryStatus.ESCALATED
    )
    follow_ups_due_q = select(func.count(FollowUp.id)).where(
        FollowUp.status == FollowUpStatus.PENDING
    )

    by_channel_q = select(Enquiry.channel, func.count(Enquiry.id)).group_by(
        Enquiry.channel
    )
    by_status_q = select(Enquiry.status, func.count(Enquiry.id)).group_by(
        Enquiry.status
    )

    total_today = (await db.execute(total_today_q)).scalar_one()
    missed = (await db.execute(missed_q)).scalar_one()
    open_escalations = (await db.execute(open_escalations_q)).scalar_one()
    follow_ups_due = (await db.execute(follow_ups_due_q)).scalar_one()

    by_channel_rows = (await db.execute(by_channel_q)).all()
    by_status_rows = (await db.execute(by_status_q)).all()

    return {
        "total_today": total_today,
        "missed": missed,
        "open_escalations": open_escalations,
        "follow_ups_due": follow_ups_due,
        "by_channel": {row[0].value: row[1] for row in by_channel_rows},
        "by_status": {row[0].value: row[1] for row in by_status_rows},
    }
