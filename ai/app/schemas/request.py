"""Request schemas for the AI microservice API."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Natural language question")

    class Config:
        json_schema_extra = {
            "example": {"message": "Which laptops are available?"}
        }