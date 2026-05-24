"""Seed the database with realistic sample data.

Run with:  python -m app.utils.seed

Generates a spread of enquiries across channels and statuses so the
dashboard has something to render on first boot.
"""
import asyncio
import json
import random
from datetime import datetime, timedelta, timezone

from app.core.logging import get_logger, setup_logging
from app.db.session import AsyncSessionLocal, close_db, init_db
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
from app.services.sop_matcher import SOPS

logger = get_logger(__name__)


SAMPLE_ENQUIRIES = [
    {
        "customer_name": "Sarah Mehta",
        "contact": "+91 98201 23456",
        "channel": Channel.WHATSAPP,
        "message": "Hi, what's the price for a 2BHK deep cleaning? "
                   "Looking to book next weekend.",
    },
    {
        "customer_name": "Rohan Kapoor",
        "contact": "rohan.k@example.com",
        "channel": Channel.EMAIL,
        "message": "I'm really unhappy with the service yesterday. "
                   "I want a refund and to speak to a manager immediately.",
    },
    {
        "customer_name": "Priya Iyer",
        "contact": "+91 99887 11223",
        "channel": Channel.WHATSAPP,
        "message": "Can I book an appointment for Saturday morning? "
                   "Need to check availability for kitchen deep clean.",
    },
    {
        "customer_name": "Aditya Sharma",
        "contact": "aditya@example.com",
        "channel": Channel.EMAIL,
        "message": "What are your opening hours on Sundays? "
                   "Need to know if you're available tonight.",
    },
    {
        "customer_name": "Neha Banerjee",
        "contact": "+91 98765 43210",
        "channel": Channel.CALL,
        "message": "Could you share more information about your services? "
                   "I want to know what packages you offer.",
    },
    {
        "customer_name": "Vikram Reddy",
        "contact": "+91 91234 56789",
        "channel": Channel.WHATSAPP,
        "message": "Just exploring options, not sure what I need yet.",
    },
    {
        "customer_name": "Anita Desai",
        "contact": "anita.d@example.com",
        "channel": Channel.EMAIL,
        "message": "Pricing question — can you send me a quote for monthly "
                   "office cleaning, about 1500 sqft?",
    },
    {
        "customer_name": "Karan Malhotra",
        "contact": "+91 88776 65544",
        "channel": Channel.CALL,
        "message": "The technician didn't show up today and no one is "
                   "answering. This is terrible service, please respond.",
    },
    {
        "customer_name": "Meera Krishnan",
        "contact": "+91 90876 54321",
        "channel": Channel.WHATSAPP,
        "message": "Hi! Want to schedule a regular booking every two weeks. "
                   "What's the rate?",
    },
    {
        "customer_name": "Arjun Nair",
        "contact": "arjun.n@example.com",
        "channel": Channel.EMAIL,
        "message": "Is your service available on holidays? Need it for "
                   "next Monday which is a public holiday.",
    },
]


def _seed_id(index: int) -> str:
    return f"enq_seed{index:04d}"


def _match_sop(message: str):
    """Local copy of matcher logic — avoids importing service mid-seed."""
    from app.services.sop_matcher import match_sop
    return match_sop(message)


async def seed() -> None:
    setup_logging()
    logger.info("Seeding database with sample data...")

    await init_db()

    async with AsyncSessionLocal() as db:
        now = utc_now()

        for idx, sample in enumerate(SAMPLE_ENQUIRIES):
            # Stagger creation times over the last 24h
            created_at = now - timedelta(hours=random.uniform(0.5, 23.5))
            enquiry_id = _seed_id(idx)

            sop = _match_sop(sample["message"])

            if sop is None:
                final_status = EnquiryStatus.ESCALATED
                escalation_reason = "No matching SOP — needs human review."
                escalation_urgency = "medium"
                matched_sop = None
                sop_label = None
                suggested_response = None
            elif sop.requires_escalation:
                final_status = EnquiryStatus.ESCALATED
                escalation_reason = f"SOP '{sop.label}' requires human attention."
                escalation_urgency = "high"
                matched_sop = sop.id
                sop_label = sop.label
                suggested_response = sop.suggested_response
            else:
                final_status = EnquiryStatus.QUALIFIED
                escalation_reason = None
                escalation_urgency = None
                matched_sop = sop.id
                sop_label = sop.label
                suggested_response = sop.suggested_response

            ai_summary = (
                f"Customer enquiry classified as '{sop.label}'."
                if sop else
                "No matching SOP found — flagged for review."
            )

            enquiry = Enquiry(
                id=enquiry_id,
                customer_name=sample["customer_name"],
                customer_contact=sample["contact"],
                channel=sample["channel"],
                initial_message=sample["message"],
                status=final_status,
                matched_sop=matched_sop,
                sop_label=sop_label,
                suggested_response=suggested_response,
                ai_summary=ai_summary,
                escalation_reason=escalation_reason,
                escalation_urgency=escalation_urgency,
                created_at=created_at,
                updated_at=created_at + timedelta(seconds=4),
            )
            db.add(enquiry)

            # Customer's original message
            db.add(Message(
                enquiry_id=enquiry_id,
                sender=MessageSender.CUSTOMER,
                content=sample["message"],
                created_at=created_at,
            ))

            # Timeline: created
            db.add(TimelineEvent(
                enquiry_id=enquiry_id,
                event_type=EventType.ENQUIRY_CREATED,
                description=f"Enquiry received via {sample['channel'].value}",
                metadata_json=json.dumps({"channel": sample["channel"].value}),
                created_at=created_at,
            ))

            # Timeline: processing
            db.add(TimelineEvent(
                enquiry_id=enquiry_id,
                event_type=EventType.PROCESSING_STARTED,
                description="Background processing started",
                created_at=created_at + timedelta(seconds=1),
            ))

            if sop is not None:
                # AI reply
                db.add(Message(
                    enquiry_id=enquiry_id,
                    sender=MessageSender.AI,
                    content=sop.suggested_response,
                    created_at=created_at + timedelta(seconds=3),
                ))
                db.add(TimelineEvent(
                    enquiry_id=enquiry_id,
                    event_type=EventType.SOP_MATCHED,
                    description=f"Matched SOP: {sop.label}",
                    metadata_json=json.dumps({
                        "sop_id": sop.id, "sop_label": sop.label,
                    }),
                    created_at=created_at + timedelta(seconds=2),
                ))
            else:
                db.add(TimelineEvent(
                    enquiry_id=enquiry_id,
                    event_type=EventType.SOP_NOT_MATCHED,
                    description="No SOP matched the message content",
                    created_at=created_at + timedelta(seconds=2),
                ))

            if final_status == EnquiryStatus.ESCALATED:
                db.add(TimelineEvent(
                    enquiry_id=enquiry_id,
                    event_type=EventType.ESCALATED,
                    description=(
                        f"Auto-escalated: {escalation_reason}"
                        if sop is None or sop.requires_escalation
                        else "Escalated"
                    ),
                    metadata_json=json.dumps({
                        "reason": escalation_reason,
                        "urgency": escalation_urgency,
                        "auto": True,
                    }),
                    created_at=created_at + timedelta(seconds=4),
                ))

            # Add a follow-up for ~40% of qualified enquiries
            if final_status == EnquiryStatus.QUALIFIED and random.random() < 0.5:
                delay = random.choice([30, 60, 120, 240])
                due_at = created_at + timedelta(minutes=delay)
                # Some due in the future, some past-due for visual variety
                if random.random() < 0.4:
                    due_at = now + timedelta(minutes=random.randint(10, 240))

                db.add(FollowUp(
                    enquiry_id=enquiry_id,
                    message_template=(
                        f"Hi {sample['customer_name'].split()[0]}, "
                        "just checking in on your enquiry — let me know "
                        "if you'd like to proceed."
                    ),
                    delay_minutes=delay,
                    due_at=due_at,
                    status=FollowUpStatus.PENDING,
                    created_at=created_at + timedelta(seconds=5),
                ))
                db.add(TimelineEvent(
                    enquiry_id=enquiry_id,
                    event_type=EventType.FOLLOW_UP_SCHEDULED,
                    description=f"Follow-up scheduled in {delay} min",
                    metadata_json=json.dumps({
                        "delay_minutes": delay,
                        "due_at": due_at.isoformat(),
                    }),
                    created_at=created_at + timedelta(seconds=5),
                ))

        await db.commit()
        logger.info(f"Seeded {len(SAMPLE_ENQUIRIES)} enquiries.")

    await close_db()


if __name__ == "__main__":
    asyncio.run(seed())
