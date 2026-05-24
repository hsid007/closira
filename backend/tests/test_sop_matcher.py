"""Smoke tests for the SOP matcher.

Run with:  pytest tests/
"""
import pytest

from app.services.sop_matcher import SOPS, match_sop


def test_sops_loaded():
    """We always want at least the 4 SOPs the brief asks for."""
    assert len(SOPS) >= 4


@pytest.mark.parametrize("message,expected_sop_id", [
    ("What's the price for a 2BHK?", "sop_pricing"),
    ("How much do you charge for a quote?", "sop_pricing"),
    ("I want to book an appointment for Saturday", "sop_booking"),
    ("Can I schedule a slot tomorrow?", "sop_booking"),
    ("I'm very unhappy and want a refund", "sop_complaint"),
    ("This is terrible, I want to speak to a manager", "sop_complaint"),
    ("What are your opening hours on Sundays?", "sop_after_hours"),
    ("Tell me more about your services", "sop_general_info"),
])
def test_match_sop_known_messages(message: str, expected_sop_id: str):
    sop = match_sop(message)
    assert sop is not None, f"Expected match for: {message}"
    assert sop.id == expected_sop_id


def test_match_sop_returns_none_for_unmatched():
    assert match_sop("xyz random gibberish text") is None
    assert match_sop("") is None
    assert match_sop("   ") is None


def test_complaint_sop_requires_escalation():
    sop = match_sop("I want to file a complaint about my refund")
    assert sop is not None
    assert sop.id == "sop_complaint"
    assert sop.requires_escalation is True


def test_booking_sop_does_not_require_escalation():
    sop = match_sop("I want to book an appointment")
    assert sop is not None
    assert sop.requires_escalation is False
