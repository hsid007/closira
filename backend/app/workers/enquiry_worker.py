"""Background task for processing newly-created enquiries.

This runs via FastAPI's BackgroundTasks (see README for the
Celery-vs-BackgroundTasks rationale). The function opens its own DB
session because the original request's session has been closed by the
time the task runs.
"""
import asyncio

from app.core.config import settings
from app.core.logging import get_logger, log_event
from app.db.session import AsyncSessionLocal
from app.services.enquiry_service import process_enquiry

logger = get_logger(__name__)


async def process_enquiry_task(enquiry_id: str) -> None:
    """Process an enquiry in the background.

    Steps:
      1. Sleep a short interval to simulate the latency of a real worker
         (LLM call, external lookups, etc.). Configurable via env.
      2. Open a fresh DB session and run SOP matching + state transitions.
      3. Swallow exceptions so a failed task doesn't blow up the event loop;
         errors are logged with full context.
    """
    log_event(
        logger, "background_task_started",
        enquiry_id=enquiry_id,
        delay_seconds=settings.enquiry_processing_delay_seconds,
    )

    try:
        await asyncio.sleep(settings.enquiry_processing_delay_seconds)

        async with AsyncSessionLocal() as db:
            await process_enquiry(db, enquiry_id)

        log_event(logger, "background_task_completed", enquiry_id=enquiry_id)

    except Exception as exc:  # noqa: BLE001 — we want broad capture here
        logger.exception(
            "background_task_failed",
            extra={"enquiry_id": enquiry_id, "error": str(exc)},
        )
