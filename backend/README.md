# Closira — Backend

REST API + async worker that powers Closira's customer enquiry-handling pipeline.

Built with **FastAPI + async SQLAlchemy 2.0 + SQLite + Pydantic v2**, with structured JSON logging, layered architecture, and a thin background-task layer that simulates SOP matching.

---

## Quick start

```bash
# from /backend
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env

# seed the DB with 10 realistic sample enquiries (optional but recommended)
python -m app.utils.seed

# run the API
uvicorn app.main:app --reload --port 8000
```

Open:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:**     http://localhost:8000/redoc
- **Health:**    http://localhost:8000/health

### Docker

```bash
docker compose up --build
```

### Tests + smoke check

```bash
pytest tests/                 # unit tests (SOP matcher)
python smoke_test.py          # full end-to-end via FastAPI TestClient
```

---

## API endpoints

| Method | Path                                   | Description                                         |
|--------|----------------------------------------|-----------------------------------------------------|
| GET    | `/health`                              | Liveness + DB connectivity                          |
| POST   | `/enquiry`                             | Create enquiry, returns 202 + job ID immediately    |
| GET    | `/enquiry`                             | List enquiries (filter by `status`, `channel`)      |
| GET    | `/enquiry/{id}`                        | Get a single enquiry                                |
| GET    | `/enquiry/{id}/history`                | Full conversation + timeline + follow-ups           |
| POST   | `/enquiry/{id}/followup`               | Schedule a follow-up                                |
| POST   | `/enquiry/{id}/escalate`               | Manually escalate to a human agent                  |
| POST   | `/enquiry/{id}/resolve`                | Mark enquiry as resolved                            |
| GET    | `/follow-ups`                          | List follow-ups (default: pending)                  |
| POST   | `/follow-ups/{enq_id}/{fid}/complete`  | Mark a follow-up as done                            |
| GET    | `/stats`                               | Dashboard aggregate counters                        |

All endpoints are also available under `/api/v1/...` for forward-compatibility with future versions. Full request/response examples live in `api.http` and on `/docs`.

---

## Architecture

```
app/
├── main.py                  # FastAPI app, middleware, exception handlers, lifespan
├── core/
│   ├── config.py            # Pydantic Settings (env-driven)
│   ├── logging.py           # Structured JSON logging
│   └── exceptions.py        # Domain exception hierarchy → HTTP responses
├── db/
│   └── session.py           # Async engine + sessionmaker + get_db dependency
├── models/
│   └── enquiry.py           # SQLAlchemy ORM models (4 tables)
├── schemas/
│   └── enquiry.py           # Pydantic v2 request/response schemas
├── services/
│   ├── enquiry_service.py   # All business logic, DB-touching code
│   └── sop_matcher.py       # Keyword-based SOP matching engine
├── api/v1/
│   ├── __init__.py          # Aggregates routers
│   └── endpoints/
│       ├── enquiries.py     # Enquiry CRUD + actions
│       ├── follow_ups.py    # Follow-up list + complete
│       ├── health.py        # Health check
│       └── stats.py         # Dashboard stats
├── workers/
│   └── enquiry_worker.py    # BackgroundTask entrypoint
└── utils/
    ├── middleware.py        # Request logging middleware
    └── seed.py              # Sample data generator
```

The **layered split** is deliberate:
- **Routes** parse requests and serialize responses. No business logic.
- **Services** own all DB-touching behaviour and state transitions.
- **Models** define the storage shape; **Schemas** define the wire shape. Never mixed.
- **Workers** wrap services in fresh DB sessions for fire-and-forget execution.

---

## Database schema

Four tables, all owned by the same `tenant_id` (stubbed at `"default"` today; the column is reserved so multi-tenant routing can be wired in without a migration).

| Table             | Purpose                                                                        |
|-------------------|--------------------------------------------------------------------------------|
| `enquiries`       | One row per inbound enquiry. Owns status, matched SOP, escalation fields.      |
| `messages`        | Append-only conversation thread, FK to enquiry. Sender ∈ customer/ai/agent/system. |
| `timeline_events` | Append-only audit log of state changes — separate from messages so the UI can render a clean status timeline without mixing in chat. |
| `follow_ups`      | Scheduled nudges with due time and completion status.                          |

Why split `messages` and `timeline_events`? Because the Conversation Detail screen in the spec needs to render both a **message thread** (chat-style, customer/AI bubbles) and a **status timeline** (created → SOP matched → escalated). Mixing them into one table makes both queries awkward and forces clients to filter.

**Why SQLite?** Single-file, zero-setup, perfect for a take-home prototype where the reviewer wants to clone-and-run. SQLAlchemy 2.0 + the async driver `aiosqlite` means swapping to Postgres later is a one-line change in `.env` (the assignment explicitly allowed either).

---

## SOP matching

`app/services/sop_matcher.py` defines 5 SOPs as immutable dataclasses with weighted keywords:

1. **Booking Enquiry** — `book`, `appointment`, `schedule`, `slot` …
2. **Pricing Question** — `price`, `quote`, `cost`, `how much` …
3. **Complaint** — `refund`, `unhappy`, `manager`, `terrible` … *(auto-escalates)*
4. **After-Hours Message** — `tonight`, `weekend`, `closed`, `opening hours` …
5. **General Information** — `info`, `services`, `tell me about` …

For each enquiry, every SOP gets a score (sum of weighted keyword hits). The highest scorer above the threshold (`MIN_SCORE_THRESHOLD = 1.0`) wins. No match → escalate. Match on a SOP with `requires_escalation=True` → still attach the AI suggested response, but flip status to ESCALATED.

Adding a new SOP is a one-tuple append to `SOPS`. No code changes elsewhere.

---

## Background tasks: why FastAPI BackgroundTasks (not Celery)?

I used FastAPI's built-in `BackgroundTasks` rather than Celery. Reasoning:

1. **No new infrastructure.** Celery requires a broker (Redis or RabbitMQ) and at least one worker process. For a single-file SQLite prototype the operational overhead would dwarf the actual code.
2. **The task is short-lived and idempotent.** SOP matching is a sub-second pure function. There's no retry policy worth engineering — if the process dies mid-task, the enquiry just stays in `processing` and a reviewer can replay it.
3. **The hand-off pattern is identical.** The worker module (`app/workers/enquiry_worker.py`) opens its own DB session and calls a service function. Swapping `background_tasks.add_task(...)` for `process_enquiry_task.delay(...)` (Celery) is a one-line change at the call site.

**When I'd switch to Celery:**
- the SOP matcher becomes a real LLM call (10-30s, needs concurrency control + rate limits),
- we want scheduled / cron-style follow-up dispatch (Celery Beat),
- we need durable retries across process restarts.

For this prototype, BackgroundTasks is the right call.

---

## Logging

All logs are emitted as one JSON object per line via `python-json-logger`. Standard fields: `timestamp`, `level`, `name`, `message`, `service`, `env`. Plus per-event fields injected via `log_event(...)`.

Sample log line:
```json
{
  "timestamp": "2026-05-23 15:22:30,118",
  "level": "INFO",
  "name": "app.services.enquiry_service",
  "message": "sop_matched",
  "service": "Closira API",
  "env": "development",
  "event": "sop_matched",
  "enquiry_id": "enq_8f3a2b1c",
  "sop_id": "sop_pricing",
  "sop_label": "Pricing Question"
}
```

Reserved `LogRecord` attribute names (`message`, `name`, etc.) are auto-prefixed with `ctx_` so callers don't have to remember Python's logging internals.

Events logged: `enquiry_created`, `background_task_started`, `processing_started`, `sop_matched`, `sop_not_matched`, `escalation_triggered`, `follow_up_scheduled`, `follow_up_completed`, `enquiry_resolved`, `request_completed`, `request_failed`, `domain_exception`, `unhandled_exception`.

---

## Error handling

A small domain exception hierarchy (`app/core/exceptions.py`) — `NotFoundError`, `ValidationError`, `ConflictError`, `DatabaseError` — each with a fixed HTTP status and machine-readable error code. The global handler in `main.py` maps every domain exception to a uniform envelope:

```json
{
  "error": {
    "code": "not_found",
    "message": "Enquiry 'enq_xyz' not found",
    "details": { "enquiry_id": "enq_xyz" }
  }
}
```

Pydantic validation errors get the same envelope with `code: validation_error`. Unhandled exceptions are caught at the top level, logged with a full traceback, and returned as a generic 500 — the client never sees a stack trace.

---

## Trade-offs & known limitations

These are deliberate scope cuts for a 48-hour prototype, not oversights:

- **No auth.** The assignment didn't ask for it and adding JWT/session would have eaten a meaningful chunk of time. The `tenant_id` column on every table is the hook point for future auth.
- **No migrations.** `Base.metadata.create_all()` runs on startup. For production I'd switch to Alembic.
- **Follow-up dispatch is not implemented.** Follow-ups are scheduled and stored, but no scheduler actually fires the templated message when due. That's a Celery Beat job in real life; I called it out rather than hand-waving a `time.sleep(...)` thread.
- **Single-tenant.** Enforced by always writing `tenant_id="default"`.
- **No rate limiting / no idempotency keys.** A real intake API would dedupe on `(customer_contact, message, < 60s window)` to swallow webhook retries.
- **SQLite, not Postgres.** Trivial to swap — change `DATABASE_URL` to a Postgres async DSN and `pip install asyncpg`. Schema is portable; I'm not using any SQLite-specific features.
- **No tracing.** Request IDs are included on every log line and returned as `x-request-id`, but I didn't wire OpenTelemetry.

---

## Manual API exercise

`api.http` contains 13 example requests covering every endpoint, viewable in VS Code's REST Client extension. Or use `/docs` directly — every request/response model has an `example` payload populated.

Quick curl:

```bash
curl -X POST http://localhost:8000/enquiry \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Sarah M.",
    "channel": "whatsapp",
    "message": "What is the price for a 2BHK clean?"
  }'
```
