"""
Schemas for the Agentic Action feature (Feature 3).
Add these to your existing app/schemas/request.py and response.py, or keep
as a separate agent_schemas.py and import from there - whichever matches
your existing schema file conventions.
"""

from typing import Optional

from pydantic import BaseModel


class AgentActionRequest(BaseModel):
    message: str  # e.g. "Mark the Dell XPS 15 as under maintenance"


class AgentActionDetails(BaseModel):
    asset_id: str
    asset_name: str
    asset_tag: str
    previous_status: str
    new_status: str


class AgentActionResponse(BaseModel):
    success: bool
    message: str
    action: Optional[str] = None
    details: Optional[AgentActionDetails] = None