"""GET /health - basic liveness check for the AI microservice."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}