from __future__ import annotations

import math
import os
from dataclasses import dataclass
from typing import Any, Mapping, MutableMapping, Optional

import pandas as pd

from src.core.recommender import recommend_places


@dataclass(frozen=True, slots=True)
class NormalizedLocation:
    type: str  # "COORDINATES" | "CITY"
    lat: Optional[float] = None
    lng: Optional[float] = None
    city_name: Optional[str] = None


@dataclass(frozen=True, slots=True)
class NormalizedConstraints:
    budget_amount: Optional[float]
    budget_currency: str
    radius_km: float
    number_of_people: Optional[int]
    transport_type: Optional[str]
    needs_wheelchair: bool
    main_category: Optional[str]
    sub_category: Optional[str]


@dataclass(frozen=True, slots=True)
class NormalizedRecommendationRequest:
    location: NormalizedLocation
    constraints: NormalizedConstraints
    prompt_text: str


def _as_mapping(value: Any, *, field: str) -> Mapping[str, Any]:
    if isinstance(value, Mapping):
        return value
    raise ValueError(f"{field} must be an object")


def _as_str(value: Any, *, default: str | None = None) -> str | None:
    if value is None:
        return default
    if isinstance(value, str):
        text = value.strip()
        return text if text else default
    return str(value).strip() or default


def _as_float(value: Any, *, default: float | None = None) -> float | None:
    if value is None:
        return default
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return default
        try:
            return float(text)
        except ValueError:
            return default
    return default


def _as_int(value: Any, *, default: int | None = None) -> int | None:
    if value is None:
        return default
    if isinstance(value, int) and not isinstance(value, bool):
        return int(value)
    if isinstance(value, float) and not isinstance(value, bool):
        return int(value)
    if isinstance(value, str):
        text = value.strip()
        if not text:
            return default
        try:
            return int(float(text))
        except ValueError:
            return default
    return default


def _as_bool(value: Any, *, default: bool = False) -> bool:
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        text = value.strip().lower()
        if text in {"true", "1", "yes", "y", "on"}:
            return True
        if text in {"false", "0", "no", "n", "off"}:
            return False
    return default


def normalize_recommendation_payload(payload: Mapping[str, Any]) -> NormalizedRecommendationRequest:
    """Normalize request body of POST /api/v1/recommendation.

    - Field mapping: keep names aligned with the contract.
    - Null handling: tolerate missing optional fields with defaults.
    - Coercion: convert strings/numbers to expected Python types.
    """

    payload = _as_mapping(payload, field="payload")

    location_raw = _as_mapping(payload.get("location"), field="location")
    location_type = _as_str(location_raw.get("type"))
    if location_type not in {"COORDINATES", "CITY"}:
        raise ValueError("location.type must be 'COORDINATES' or 'CITY'")

    if location_type == "COORDINATES":
        lat = _as_float(location_raw.get("lat"))
        lng = _as_float(location_raw.get("lng"))
        if lat is None or lng is None:
            raise ValueError("location.lat and location.lng are required for COORDINATES")
        location = NormalizedLocation(type=location_type, lat=lat, lng=lng)
    else:
        city_name = _as_str(location_raw.get("city_name"))
        if not city_name:
            raise ValueError("location.city_name is required for CITY")
        location = NormalizedLocation(type=location_type, city_name=city_name)

    constraints_raw = _as_mapping(payload.get("constraints"), field="constraints")
    budget_raw = constraints_raw.get("budget") or {}
    budget_raw = _as_mapping(budget_raw, field="constraints.budget")

    budget_amount = _as_float(budget_raw.get("amount"), default=None)
    budget_currency = _as_str(budget_raw.get("currency"), default="VND") or "VND"

    radius_km = _as_float(constraints_raw.get("radius_km"), default=3.0)
    if radius_km is None or radius_km <= 0:
        radius_km = 3.0

    constraints = NormalizedConstraints(
        budget_amount=budget_amount,
        budget_currency=budget_currency,
        radius_km=float(radius_km),
        number_of_people=_as_int(constraints_raw.get("number_of_people"), default=None),
        transport_type=_as_str(constraints_raw.get("transport_type"), default=None),
        needs_wheelchair=_as_bool(constraints_raw.get("needs_wheelchair"), default=False),
        main_category=_as_str(constraints_raw.get("main_category"), default=None),
        sub_category=_as_str(constraints_raw.get("sub_category"), default=None),
    )

    prompt_text = _as_str(payload.get("prompt_text"), default="") or ""
    return NormalizedRecommendationRequest(location=location, constraints=constraints, prompt_text=prompt_text)


def _budget_amount_to_bucket(amount: float | None, *, currency: str) -> str:
    """Map numeric budget to internal buckets used by v0 recommender."""

    if amount is None:
        return "high"

    low_max = float(os.getenv("APP_BUDGET_LOW_MAX", "200000"))
    medium_max = float(os.getenv("APP_BUDGET_MEDIUM_MAX", "1000000"))

    # If currency isn't VND, still apply thresholds as heuristic.
    _ = currency

    if amount <= low_max:
        return "low"
    if amount <= medium_max:
        return "medium"
    return "high"


def _category_from_constraints(constraints: NormalizedConstraints) -> str | None:
    category = constraints.sub_category or constraints.main_category
    if not category:
        return None
    return category.strip().lower()


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Great-circle distance in kilometers."""

    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lng2 - lng1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def _coerce_places_v2(df: pd.DataFrame) -> pd.DataFrame:
    working = df.copy()
    for col in ("lat", "lng", "rating"):
        if col in working.columns:
            working[col] = pd.to_numeric(working[col], errors="coerce")

    if "wheelchair_access" in working.columns:
        working["wheelchair_access"] = working["wheelchair_access"].map(lambda v: _as_bool(v, default=False))

    # Provide a unified "category" column for the existing recommender.
    if "category" not in working.columns:
        cat_series = None
        if "sub_category" in working.columns:
            cat_series = working["sub_category"]
        elif "main_category" in working.columns:
            cat_series = working["main_category"]
        if cat_series is not None:
            working["category"] = cat_series.astype(str)

    working["category"] = working["category"].astype(str).str.lower().str.strip()
    working["price_level"] = working["price_level"].astype(str).str.lower().str.strip()

    return working


def apply_contract_request_to_places_v2(
    places_v2: pd.DataFrame,
    request: NormalizedRecommendationRequest,
    *,
    top_k: int = 5,
) -> pd.DataFrame:
    """End-to-end adapter: contract payload -> dataframe suitable for v0 recommender.

    This function is intentionally small and deterministic so it can be tested
    independently from any web framework.
    """

    working = _coerce_places_v2(places_v2)

    if request.constraints.needs_wheelchair and "wheelchair_access" in working.columns:
        working = working[working["wheelchair_access"] == True].copy()  # noqa: E712

    # Resolve user coordinates.
    user_lat: float
    user_lng: float
    if request.location.type == "COORDINATES":
        if request.location.lat is None or request.location.lng is None:
            raise ValueError("COORDINATES request must contain lat/lng")
        user_lat = float(request.location.lat)
        user_lng = float(request.location.lng)
    else:
        if "city_name" not in working.columns:
            raise ValueError("places dataset must include city_name for CITY requests")
        if not request.location.city_name:
            raise ValueError("CITY request must contain city_name")

        city = request.location.city_name.strip().lower()
        city_places = working[working["city_name"].astype(str).str.lower().str.strip() == city]
        if city_places.empty:
            raise ValueError(f"Unknown city_name '{request.location.city_name}' for current dataset")

        # Heuristic: use mean coordinate of places in that city as user's location.
        user_lat = float(city_places["lat"].mean())
        user_lng = float(city_places["lng"].mean())
        working = city_places.copy()

    # Distance computation (required by current recommender).
    if "lat" not in working.columns or "lng" not in working.columns:
        raise ValueError("places dataset must include lat/lng columns")

    working["distance_km"] = working.apply(
        lambda row: _haversine_km(user_lat, user_lng, float(row["lat"]), float(row["lng"])), axis=1
    )

    category = _category_from_constraints(request.constraints)
    if category:
        working = working[working["category"] == category].copy()

    max_budget_bucket = _budget_amount_to_bucket(request.constraints.budget_amount, currency=request.constraints.budget_currency)

    # Feed into existing v0 algorithm.
    return recommend_places(
        data=working,
        category=category or "",
        max_budget=max_budget_bucket,
        max_distance_km=float(request.constraints.radius_km),
        top_k=int(top_k),
    )


def adapt_payload_to_internal_inputs(payload: Mapping[str, Any]) -> MutableMapping[str, Any]:
    """Return a compact dict the service can log/store or pass downstream."""

    req = normalize_recommendation_payload(payload)
    category = _category_from_constraints(req.constraints)
    return {
        "location_type": req.location.type,
        "lat": req.location.lat,
        "lng": req.location.lng,
        "city_name": req.location.city_name,
        "radius_km": req.constraints.radius_km,
        "budget_amount": req.constraints.budget_amount,
        "budget_currency": req.constraints.budget_currency,
        "max_budget_bucket": _budget_amount_to_bucket(req.constraints.budget_amount, currency=req.constraints.budget_currency),
        "needs_wheelchair": req.constraints.needs_wheelchair,
        "transport_type": req.constraints.transport_type,
        "number_of_people": req.constraints.number_of_people,
        "main_category": req.constraints.main_category,
        "sub_category": req.constraints.sub_category,
        "category": category,
        "prompt_text": req.prompt_text,
    }
