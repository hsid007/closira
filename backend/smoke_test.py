"""End-to-end smoke test via FastAPI TestClient.

Run with:  python smoke_test.py
This boots the app in-process (no uvicorn), runs through every endpoint,
and prints a summary. Useful for CI and as a sanity check.
"""
import asyncio
import time

from fastapi.testclient import TestClient

from app.main import app


def main() -> None:
    with TestClient(app) as client:
        ok = lambda label, resp, expected=200: print(
            f"  {'✓' if resp.status_code == expected else '✗'} {label}"
            f" → {resp.status_code} (expected {expected})"
        )

        print("\n== Closira API smoke test ==\n")

        print("[1] GET /health")
        r = client.get("/health")
        ok("health", r); print("    ", r.json())

        print("\n[2] POST /enquiry — pricing")
        r = client.post("/enquiry", json={
            "customer_name": "Sarah M.",
            "customer_contact": "+91 98765 43210",
            "channel": "whatsapp",
            "message": "Hi! What's the price for a 2BHK deep cleaning?",
        })
        ok("create pricing", r, 202)
        enq_id = r.json()["id"]
        print("    enquiry_id:", enq_id)

        # Let background task finish
        time.sleep(3)

        print("\n[3] GET /enquiry/{id}/history")
        r = client.get(f"/enquiry/{enq_id}/history")
        ok("history", r)
        d = r.json()
        print("    status:", d["status"])
        print("    matched_sop:", d["matched_sop"])
        print("    messages:", len(d["messages"]))
        print("    timeline events:", len(d["timeline"]))

        print("\n[4] POST /enquiry — complaint (should auto-escalate)")
        r = client.post("/enquiry", json={
            "customer_name": "Angry C.",
            "channel": "email",
            "message": "I want a refund and to speak to the manager NOW. Terrible service.",
        })
        ok("create complaint", r, 202)
        comp_id = r.json()["id"]
        time.sleep(3)

        r = client.get(f"/enquiry/{comp_id}/history")
        d = r.json()
        print("    final status:", d["status"])
        print("    escalation_reason:", d["escalation_reason"])
        print("    urgency:", d["escalation_urgency"])

        print("\n[5] POST /enquiry — gibberish (should auto-escalate, no SOP)")
        r = client.post("/enquiry", json={
            "customer_name": "Random R.",
            "channel": "call",
            "message": "xyz random gibberish nothing matches",
        })
        ok("create unmatched", r, 202)
        gib_id = r.json()["id"]
        time.sleep(3)
        r = client.get(f"/enquiry/{gib_id}/history")
        d = r.json()
        print("    final status:", d["status"])
        print("    matched_sop:", d["matched_sop"])

        print("\n[6] POST /enquiry/{id}/followup")
        r = client.post(f"/enquiry/{enq_id}/followup", json={
            "delay_minutes": 30,
            "message_template": "Just checking in",
        })
        ok("schedule follow-up", r, 201)
        print("    due_at:", r.json()["due_at"])

        print("\n[7] POST /enquiry/{id}/escalate (manual)")
        r = client.post(f"/enquiry/{enq_id}/escalate", json={
            "reason": "Customer needs special pricing approval",
            "urgency": "high",
        })
        ok("manual escalate", r)
        print("    status:", r.json()["status"])
        print("    reason:", r.json()["escalation_reason"])

        print("\n[8] GET /enquiry?status=escalated")
        r = client.get("/enquiry?status=escalated")
        ok("list escalated", r)
        print("    count:", len(r.json()))

        print("\n[9] GET /follow-ups")
        r = client.get("/follow-ups")
        ok("list follow-ups", r)
        print("    count:", len(r.json()))

        print("\n[10] GET /stats")
        r = client.get("/stats")
        ok("stats", r)
        print("    ", r.json())

        print("\n[11] Error paths")
        r = client.get("/enquiry/enq_doesnotexist/history")
        ok("404 not found", r, 404)
        print("    body:", r.json())

        r = client.post("/enquiry", json={
            "customer_name": "", "channel": "invalid", "message": "",
        })
        ok("422 validation", r, 422)
        print("    error code:", r.json()["error"]["code"])

        print("\n== All checks complete ==")


if __name__ == "__main__":
    main()
