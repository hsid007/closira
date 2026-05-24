"""v1 API routers."""
from fastapi import APIRouter

from app.api.v1.endpoints import enquiries, follow_ups, health, stats

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(
    enquiries.router, prefix="/enquiry", tags=["enquiries"]
)
api_router.include_router(
    follow_ups.router, prefix="/follow-ups", tags=["follow-ups"]
)
api_router.include_router(stats.router, prefix="/stats", tags=["stats"])
