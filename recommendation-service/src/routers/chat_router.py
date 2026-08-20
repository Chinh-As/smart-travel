"""Chat API Router — POST /api/v1/chat endpoint."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException
from src.models import ChatRequest, ChatResponse, PlaceModel
from src.services.gemini_chat import get_gemini_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["chat"])


@router.post("/api/v1/chat", response_model=ChatResponse)
def chat(req: ChatRequest) -> ChatResponse:
    """Process a chat message through Gemini AI with function calling.

    The endpoint receives the user's message and conversation history,
    forwards it to Gemini API which may call internal tools (search_places,
    search_places_by_name, etc.) to fetch real data, then returns a
    synthesized response.
    """
    try:
        service = get_gemini_service()
    except ValueError as exc:
        raise HTTPException(
            status_code=503,
            detail=f"Chat service unavailable: {exc}",
        )

    # Extract optional user location
    user_lat = None
    user_lng = None
    if req.location:
        user_lat = req.location.lat
        user_lng = req.location.lng

    # Convert history to dicts
    history = [{"role": m.role, "content": m.content} for m in req.history]

    # Call Gemini
    result = service.chat(
        message=req.message,
        history=history,
        user_lat=user_lat,
        user_lng=user_lng,
    )

    # Convert place dicts to PlaceModel
    places_out = []
    for p in result.places:
        try:
            places_out.append(PlaceModel(**p))
        except Exception:
            logger.warning("Skipping malformed place: %s", p.get("name"))

    return ChatResponse(reply=result.reply, places=places_out)
