# Closira

Full-stack prototype for an AI-powered customer-communication platform for SMBs.
Handles inbound enquiries from **WhatsApp, email, and phone**, matches them to **business-defined SOPs**, schedules **follow-ups**, and **escalates to human agents** when needed.

> Built as a take-home assignment. Both backend and frontend tracks are completed.

---

## Monorepo layout

```
closira/
├── backend/      FastAPI + async SQLAlchemy + SQLite + structured logging
└── frontend/    Expo + React Native + TypeScript + NativeWind
```

Each folder has its own README with detailed setup instructions, architecture
notes, and trade-off rationale:

- 📂 **[backend/README.md](./backend/README.md)** — API design, schema, SOP engine, BackgroundTasks-vs-Celery decision
- 📂 **[frontend/README.md](./frontend/README.md)** — Screen list, styling choice (NativeWind), mock API design

---

## What's been built

### Backend ✅

A **FastAPI** REST API + async background worker that mirrors a production startup intake pipeline.

- **All 5 endpoints from the brief** — `POST /enquiry`, `POST /enquiry/{id}/followup`, `POST /enquiry/{id}/escalate`, `GET /enquiry/{id}/history`, `GET /health` — plus bonus `list / stats / resolve / follow-up-complete` routes.
- **Async SOP-matching** via FastAPI `BackgroundTasks` over **5 weighted-keyword SOPs** (booking, pricing, complaint, after-hours, general info). Complaints + unmatched messages auto-escalate.
- **Layered architecture** — routes → services → models. Routes stay thin; services own all DB-touching code; workers reuse the service layer with their own session.
- **Structured JSON logging** with auto-prefixing of reserved `LogRecord` field names (caught a real bug during testing).
- **Domain exception hierarchy** → uniform `{ error: { code, message, details } }` envelope across all error paths.
- **Auto-generated `/docs`** with request/response examples on every endpoint.
- **SQLAlchemy 2.0 async** with 4 tables (`enquiries`, `messages`, `timeline_events`, `follow_ups`); `tenant_id` column on every table stubbed for future multi-tenancy.
- **Docker support**, **seed script**, **smoke test**, **pytest unit tests**, **.env.example**, and a **13-request `api.http`** file.

**Verified:** 12 unit tests + 13 end-to-end smoke checks all pass. Server returns 202 → background task fires → status flips → AI reply attached → timeline events recorded.

### Frontend ✅

A **React Native** mobile dashboard with **bottom-tab navigation + stack detail screen**, designed to feel like a polished modern SaaS product.

- **All 5 required screens** — Dashboard (Home), Leads, Escalations, Follow-ups, Conversation Detail.
- **Bottom-tab navigator** with icons + labels (Home / Leads / Escalations / Follow-ups). Conversation Detail opens as a stack screen above the tabs.
- **20+ reusable components** organized into `badges/`, `cards/`, `common/`, `layout/`, `timeline/`. No screen file exceeds 250 lines.
- **Realistic mock data** in `src/mock/` shaped identically to backend responses — 10 enquiries, 10 full conversation threads, 4 follow-ups, dashboard stats, activity feed.
- **Mocked API client** with the same surface as a real `fetch` wrapper — swap-in for the real backend is a function-body change.
- **Strict design system** — channel/status/urgency colors match the brief exactly (WhatsApp green, Email blue, Call amber, New blue, Qualified green, Escalated red).
- **Empty states, skeleton loaders, pull-to-refresh** on every list screen.

**Verified:** `tsc --noEmit` passes with zero errors; `expo export --platform web` produces a working production bundle.

---

## Quick start (both tracks)

```bash
# 1. Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
python -m app.utils.seed              # optional: seed sample data
uvicorn app.main:app --reload --port 8000
# → API at http://localhost:8000, docs at http://localhost:8000/docs

# 2. Frontend (in a new terminal)
cd frontend
npm install
cp .env.example .env
npm start
# Press i / a / w for iOS / Android / Web
```

---

## How the two halves fit together

The frontend's `src/types/index.ts` mirrors the backend's `app/schemas/enquiry.py`
field-for-field, and the frontend's `src/api/client.ts` is shaped to match the
backend's REST surface. The mock layer is the only thing standing between them
— removing it is a per-endpoint edit, not a refactor.

If you wired them together right now:

```ts
// src/api/client.ts
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";

export const enquiryApi = {
  list: async (filters?: { status?: EnquiryStatus }) => {
    const url = new URL(`${API_URL}/enquiry`);
    if (filters?.status) url.searchParams.set("status", filters.status);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<Enquiry[]>;
  },
  // ... same pattern for getHistory / listEscalated / etc.
};
```

That's it — every screen would keep working because the rendered shape doesn't change.

---

## What I'd do next given more time

- **Wire frontend ↔ backend live.** Replace mock client with `fetch`, add a small error toast, and run the whole flow on a phone.
- **Switch to Celery + Redis Beat** for follow-up dispatch — store templates in DB, fire them on schedule, mark complete with delivery receipts.
- **JWT auth + multi-tenant routing.** The `tenant_id` columns are ready; need a middleware that pulls it from the JWT and scopes every query.
- **Postgres + Alembic migrations.** Drop-in DSN change in `.env`; `create_all()` → `alembic upgrade head` on startup.
- **Real LLM integration** in place of the keyword matcher, with a feature flag so SOP rules remain the fallback.
- **OpenAPI → frontend types.** Generate `src/types/api.ts` from the backend's `openapi.json` so they can never drift.
- **Component tests** (Testing Library) and a Playwright smoke test for the web build.

---

## Honest trade-offs

These are deliberate scope cuts for a 48-hour prototype:

- No auth, no migrations, no real-time delivery — see each track's README for the per-track list and the rationale behind each one.
- SQLite over Postgres for zero-setup reviewability.
- BackgroundTasks over Celery for the same reason (writeup in `backend/README.md`).
- Mocked frontend data because the brief explicitly forbids spending time on integration.

If you make a trade-off, own it.
