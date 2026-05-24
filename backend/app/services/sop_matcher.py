"""SOP (Standard Operating Procedure) matching engine.

Pure functions over a static rule table. No AI here — the assignment
calls for "basic keyword logic". Rules are weighted; the highest-scoring
SOP wins, and a minimum threshold avoids spurious matches.

Adding a new SOP = appending to SOPS. No code changes elsewhere.
"""
from dataclasses import dataclass, field
from typing import List, Optional, Tuple


@dataclass(frozen=True)
class SOP:
    """A Standard Operating Procedure rule."""

    id: str
    label: str
    keywords: Tuple[str, ...]
    # Weight per keyword hit (defaults to 1.0). Used to prioritize specific
    # terms over generic ones (e.g. "refund" > "issue").
    weights: dict = field(default_factory=dict)
    suggested_response: str = ""
    requires_escalation: bool = False


SOPS: List[SOP] = [
    SOP(
        id="sop_booking",
        label="Booking Enquiry",
        keywords=(
            "book", "booking", "schedule", "appointment", "slot",
            "availability", "available", "reserve", "reservation",
            "tomorrow", "next week", "this weekend",
        ),
        weights={"book": 2.0, "booking": 2.0, "appointment": 2.0},
        suggested_response=(
            "Thanks for reaching out! I'd love to help you book a slot. "
            "Could you share your preferred date and time, and the service "
            "you're interested in?"
        ),
    ),
    SOP(
        id="sop_pricing",
        label="Pricing Question",
        keywords=(
            "price", "pricing", "cost", "rate", "rates", "quote",
            "quotation", "how much", "charge", "charges", "fee", "fees",
            "estimate", "budget",
        ),
        weights={"price": 2.0, "pricing": 2.0, "quote": 2.0, "cost": 1.5},
        suggested_response=(
            "Happy to share pricing details. Our packages start from a base "
            "rate depending on scope and size. Could you share a few more "
            "details so I can send you an accurate quote?"
        ),
    ),
    SOP(
        id="sop_complaint",
        label="Complaint",
        keywords=(
            "complaint", "complain", "unhappy", "disappointed", "refund",
            "terrible", "worst", "bad service", "issue", "problem",
            "not working", "broken", "damaged", "angry", "frustrated",
            "manager",
        ),
        weights={
            "complaint": 2.5, "refund": 2.5, "manager": 2.5,
            "unhappy": 2.0, "angry": 2.0,
        },
        suggested_response=(
            "I'm really sorry to hear about your experience. I'm escalating "
            "this to our team lead so we can resolve it as quickly as possible."
        ),
        requires_escalation=True,
    ),
    SOP(
        id="sop_after_hours",
        label="After-Hours Message",
        keywords=(
            "tonight", "midnight", "late", "after hours", "weekend",
            "sunday", "holiday", "closed", "open hours", "opening hours",
            "when do you open", "what time",
        ),
        weights={"after hours": 2.0, "closed": 1.5, "opening hours": 2.0},
        suggested_response=(
            "Thanks for your message! Our team is currently offline. "
            "We'll get back to you first thing during business hours "
            "(Mon–Sat, 9am–7pm)."
        ),
    ),
    SOP(
        id="sop_general_info",
        label="General Information",
        keywords=(
            "info", "information", "details", "tell me about", "what is",
            "how does", "services", "service", "offer", "offerings",
            "more about",
        ),
        weights={"information": 1.5, "services": 1.5},
        suggested_response=(
            "Thanks for getting in touch! Here's a quick overview of what we "
            "offer. Let me know which service you'd like to learn more about."
        ),
    ),
]


# Minimum score required for a match. Below this we treat the enquiry as
# unmatched and flag for escalation.
MIN_SCORE_THRESHOLD: float = 1.0


def _score(message: str, sop: SOP) -> float:
    """Score a message against a single SOP using weighted keyword matching."""
    text = message.lower()
    total = 0.0
    for kw in sop.keywords:
        if kw in text:
            total += sop.weights.get(kw, 1.0)
    return total


def match_sop(message: str) -> Optional[SOP]:
    """Return the highest-scoring SOP for a message, or None if below threshold.

    Ties are broken by the order rules are declared in SOPS (stable max).
    """
    if not message or not message.strip():
        return None

    scored = [(sop, _score(message, sop)) for sop in SOPS]
    best_sop, best_score = max(scored, key=lambda x: x[1])

    if best_score < MIN_SCORE_THRESHOLD:
        return None
    return best_sop


def generate_summary(message: str, sop: Optional[SOP]) -> str:
    """Generate a short AI-style summary (mocked).

    A real implementation would call an LLM. For the prototype we produce
    a deterministic two-sentence summary derived from the SOP label and the
    first ~80 characters of the message.
    """
    snippet = message.strip().replace("\n", " ")
    if len(snippet) > 80:
        snippet = snippet[:77] + "..."

    if sop is None:
        return (
            f"Inbound message could not be matched to a known SOP. "
            f"Original: \"{snippet}\""
        )
    return (
        f"Customer enquiry classified as '{sop.label}'. "
        f"Summary: \"{snippet}\""
    )
