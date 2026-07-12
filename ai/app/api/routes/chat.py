"""
POST /chat - the main Feature 1 endpoint (Natural Language to SQL).

Per coding standards: this file ONLY handles HTTP concerns (request
validation, response shaping). All logic lives in services/chat_service.py.
"""

from fastapi import APIRouter

from schemas.request import ChatRequest
from schemas.response import ChatResponse
from services.chat_service import handle_chat_message

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    result = handle_chat_message(request.message)
    return ChatResponse(**result)