from uuid import UUID
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class CoordinatesLocation(BaseModel):
    type: str = Field("COORDINATES", description="Type of location")
    lat: float = Field(..., description="Latitude")
    lng: float = Field(..., description="Longitude")

class RecommendConstraints(BaseModel):
    budget: str = Field(..., min_length=1, description="low|medium|high")
    radius_km: float = Field(..., gt=0, description="Radius in kilometers")
    category: str = Field(..., min_length=1, description="Category of the place")

class RecommendRequest(BaseModel):
    location: CoordinatesLocation
    constraints: RecommendConstraints
    top_k: int = Field(10, ge=1, le=50, description="Number of results to return")
    offset: int = Field(0, ge=0, description="Pagination offset")

class PlaceModel(BaseModel):
    place_id: Optional[UUID] = None
    name: Optional[str] = None
    category: Optional[str] = None
    price_level: Optional[str] = None
    rating: Optional[float] = None
    distance_km: Optional[float] = None
    score: Optional[float] = None
    match_reason: Optional[str] = None
    image_url: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None
    opening_hours: Optional[str] = None
    review_count: Optional[int] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    wheelchair_access: Optional[bool] = None

class RecommendResponse(BaseModel):
    places: List[PlaceModel]
    total_count: int
    radius_used: float = Field(..., description="The actual radius used after fallbacks")

class ItineraryRequest(BaseModel):
    location: CoordinatesLocation
    preferences: List[str] = Field(..., min_items=1)
    budget: str = Field(..., description="low|medium|high")
    radius_km: float = Field(..., gt=0)

class ItinerarySlot(BaseModel):
    time_slot: str
    label: str
    place: Optional[PlaceModel] = None
    reason: str

class ItineraryResponse(BaseModel):
    itinerary: List[ItinerarySlot]


# ── Chat Models ────────────────────────────────────────────────────────────────


class ChatMessage(BaseModel):
    """A single message in the conversation history."""
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message text content")


class ChatRequest(BaseModel):
    """Request body for POST /api/v1/chat."""
    message: str = Field(..., min_length=1, description="The user's new message")
    history: List[ChatMessage] = Field(
        default_factory=list,
        description="Previous conversation messages",
    )
    location: Optional[CoordinatesLocation] = Field(
        None,
        description="Optional user location for location-aware searches",
    )


class ChatResponse(BaseModel):
    """Response body for POST /api/v1/chat."""
    reply: str = Field(..., description="AI-generated reply text")
    places: List[PlaceModel] = Field(
        default_factory=list,
        description="List of recommended places (if any were found via function calling)",
    )

