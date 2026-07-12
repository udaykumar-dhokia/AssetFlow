"""
Route for the Agentic Action feature (Feature 3).
Mirrors the style of your existing app/api/routes/chat.py - adjust the
import paths below to match your actual project layout if they differ.
"""

from fastapi import APIRouter

from schemas.agent_schemas import AgentActionRequest, AgentActionResponse
from services import agent_service

router = APIRouter()


@router.post("/agent/action", response_model=AgentActionResponse)
def agent_action(request: AgentActionRequest) -> AgentActionResponse:
    result = agent_service.handle_agent_action(request.message)
    return AgentActionResponse(**result)