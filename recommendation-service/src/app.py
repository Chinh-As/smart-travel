from __future__ import annotations

from uuid import UUID
from functools import lru_cache
import math
import os
import json
import ast
from typing import Any, Mapping

import pandas as pd
from fastapi import Body, FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from src.config import DEFAULT_TOP_K, PLACES_V2_PATH, GEMINI_API_KEY, GEMINI_MODEL
from src.models import (
    RecommendRequest, RecommendResponse, PlaceModel,
    ItineraryRequest, ItineraryResponse, CoordinatesLocation
)
from src.utils import normalize_text
from src.core.recommender import recommend_places
from src.services.data_adapter_v1 import normalize_recommendation_payload
from src.routers.chat_router import router as chat_router
import logging

logger = logging.getLogger(__name__)


APP_VERSION = "0.1.0"
app = FastAPI(title="Smart Travel Recommendation Service", version=APP_VERSION)
app.include_router(chat_router)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    body = await request.body()
    print(f"[FASTAPI VALIDATION ERROR] Path: {request.url.path}, body: {body.decode('utf-8', errors='ignore')}, error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body.decode('utf-8', errors='ignore')},
    )


@app.on_event("startup")
def startup_event():
    import os
    import psycopg2
    import urllib.parse
    
    db_url = os.getenv("SPRING_DATASOURCE_URL")
    db_user = os.getenv("SPRING_DATASOURCE_USERNAME")
    db_password = os.getenv("SPRING_DATASOURCE_PASSWORD")
    
    if not db_url or not db_user or not db_password:
        print("--- [Smart Travel] WARNING: Missing database environment variables. Running in CSV fallback mode. ---")
        return
        
    try:
        dsn = db_url[5:] if db_url.startswith("jdbc:") else db_url
        parsed = urllib.parse.urlparse(dsn)
        
        conn = psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port or 5432,
            database=parsed.path.lstrip('/'),
            user=db_user,
            password=db_password,
            sslmode=os.getenv("DB_SSLMODE", "require"),
            connect_timeout=10
        )
        conn.close()
        print("--- [Smart Travel] Supabase PostgreSQL Connection verified successfully! ---")
    except Exception as e:
        print(f"--- [Smart Travel] WARNING: Database connection failed ({e}). Running in CSV fallback mode. ---")


origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
]

cors_env = os.getenv("CORS_ALLOWED_ORIGINS")
allow_origin_regex = "https://.*\\.vercel\\.app|http://localhost:.*|http://127\\.0\\.0\\.1:.*"
if cors_env:
    static_origins = []
    regex_patterns = [allow_origin_regex]
    for o in cors_env.split(","):
        o = o.strip().replace('"', '').replace("'", "")
        if not o:
            continue
        if "*" in o:
            regex_patterns.append("^" + re.escape(o).replace(r"\*", ".*") + "$")
        else:
            static_origins.append(o)
    origins.extend(static_origins)
    allow_origin_regex = "|".join(regex_patterns)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





SIGHTSEEING_CATEGORIES = {"museum", "park", "walking", "wildlife", "sightseeing"}


def _success(data: Any, *, message: str | None = None) -> Mapping[str, Any]:
    return {"status": "success", "message": message or "", "data": data}


def _error(message: str, *, data: Any | None = None) -> Mapping[str, Any]:
    return {"status": "error", "message": message, "data": data}


def _match_reason(row: Mapping[str, Any]) -> str:
    rating = row.get("rating")
    distance_km = row.get("distance_km")
    price_level = row.get("price_level")

    rating_part = ""
    if rating is not None:
        try:
            rating_part = f"rating {float(rating):.1f}⭐"
        except Exception:
            rating_part = f"rating {rating}⭐"

    distance_part = ""
    if distance_km is not None:
        try:
            distance_part = f"Gần bạn {float(distance_km):.1f}km"
        except Exception:
            distance_part = f"Gần bạn {distance_km}km"

    budget_part = ""
    if price_level:
        budget_part = "phù hợp ngân sách"

    parts = [p for p in [distance_part, rating_part, budget_part] if p]
    return ", ".join(parts) if parts else "Phù hợp với tiêu chí của bạn"


def _haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
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
    
    # Filter out non-travel related places (clinics, spas, dentists, etc.) that pollute search results
    unwanted_keywords = ["nha khoa", "thẩm mỹ", "clinic", "dental", "dentist", "dentistry", "spa", "phòng khám", "bệnh viện", "salon", "massage"]
    mask = working["name"].str.lower().apply(
        lambda x: not any(kw in x for kw in unwanted_keywords) if pd.notna(x) else True
    )
    working = working[mask].copy()

    for col in ("lat", "lng", "rating"):
        if col in working.columns:
            working[col] = pd.to_numeric(working[col], errors="coerce")

    if "review_count" in working.columns:
        working["review_count"] = pd.to_numeric(working["review_count"], errors="coerce").fillna(0).astype(int)

    if "category" in working.columns:
        working["category"] = working["category"].astype(str).str.lower().str.strip()
    if "price_level" in working.columns:
        working["price_level"] = working["price_level"].astype(str).str.lower().str.strip()

    def _make_search_text(row):
        parts = []
        if pd.notna(row.get('name')): parts.append(str(row['name']))
        if pd.notna(row.get('address')): parts.append(str(row['address']))
        if pd.notna(row.get('description')): parts.append(str(row['description']))
        return normalize_text(" ".join(parts))
        
    working["_search_text"] = working.apply(_make_search_text, axis=1)

    return working


def _category_aliases(category: str) -> set[str]:
    category = category.strip().lower()
    if not category or category in ("all", "tất cả", "tất cả chủ đề"):
        return {"cafe", "restaurant", "hotel", "sightseeing", "shopping", "entertainment", "nature", "history", "nightlife"}
    mapping = {
        "sightseeing": {"cafe", "restaurant"},
        "culture": {"cafe", "restaurant"},
        "food": {"restaurant"},
        "relax": {"cafe"},
        "stay": {"hotel"},
        "beach": {"hotel", "cafe"},
        "cafe": {"cafe"},
        "restaurant": {"restaurant"},
        "hotel": {"hotel"},
        "entertainment": {"cafe", "restaurant"},
        "nature": {"cafe", "restaurant"},
        "shopping": {"cafe"},
        "history": {"cafe"},
        "nightlife": {"restaurant"}
    }
    if category not in mapping:
        # Fallback to a default instead of 400 so UI doesn't break
        return {"cafe", "restaurant", "sightseeing"}
    return mapping[category]


def _recommend_from_places(
    *,
    places: pd.DataFrame,
    category: str,
    budget: str,
    radius_km: float,
    top_k: int,
) -> pd.DataFrame:
    cats = _category_aliases(category)
    if not cats:
        return places.head(0)

    # Use existing v0 recommender per-category then merge.
    frames: list[pd.DataFrame] = []
    for c in sorted(cats):
        frames.append(
            recommend_places(
                data=places,
                category=c,
                max_budget=budget,
                max_distance_km=radius_km,
                top_k=top_k,
            )
        )

    if not frames:
        return places.head(0)

    merged = pd.concat(frames, ignore_index=True) if len(frames) > 1 else frames[0]
    if merged.empty:
        return merged

    # De-duplicate by place_id/name if present.
    if "place_id" in merged.columns:
        merged = merged.drop_duplicates(subset=["place_id"], keep="first")
    elif "name" in merged.columns:
        merged = merged.drop_duplicates(subset=["name"], keep="first")

    if "score" in merged.columns and "rating" in merged.columns and "distance_km" in merged.columns:
        merged = merged.sort_values(by=["score", "rating", "distance_km"], ascending=[False, False, True])

    return merged.head(top_k)


@lru_cache(maxsize=1)
def _places_v2() -> pd.DataFrame:
    return pd.read_csv(PLACES_V2_PATH)





def _row_to_place(row: Mapping[str, Any]) -> Mapping[str, Any]:
    image_url = row.get("image_url")
    if not image_url:
        images_url_str = row.get("images_url")
        if isinstance(images_url_str, str) and images_url_str.strip().startswith("["):
            try:
                images_list = ast.literal_eval(images_url_str)
                if images_list and len(images_list) > 0:
                    image_url = images_list[0]
            except Exception:
                image_url = images_url_str
        elif images_url_str:
            image_url = images_url_str

    return {
        "place_id": _to_uuid_string(row.get("place_id")),
        "name": row.get("name"),
        "category": row.get("category"),
        "price_level": row.get("price_level"),
        "rating": row.get("rating"),
        "distance_km": row.get("distance_km"),
        "score": row.get("score"),
        "match_reason": _match_reason(row),
        "image_url": image_url,
        "address": row.get("address"),
        "description": row.get("description"),
        "opening_hours": row.get("opening_hours"),
        "review_count": row.get("review_count"),
        "lat": row.get("lat"),
        "lng": row.get("lng"),
        "wheelchair_access": row.get("wheelchair_access"),
    }

def _to_uuid_string(value: Any) -> str | None:
    if value is None:
        return None

    try:
        return str(UUID(str(value)))
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid place_id UUID in dataset: {value}"
        ) 

# ---------------------------------------------------------------------------
# Destination browsing endpoints (for frontend integration)
# ---------------------------------------------------------------------------


@app.get("/destinations")
def list_destinations(
    category: str | None = Query(None),
    price_level: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> Mapping[str, Any]:
    """
    List destinations with optional filtering.
    """
    try:
        places = _coerce_places_v2(_places_v2())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Cannot load places: {exc}")

    filtered = places.copy()

    if category:
        cat = category.strip().lower()
        filtered = filtered[filtered["category"].str.lower() == cat]

    if price_level:
        pl = price_level.strip().lower()
        filtered = filtered[filtered["price_level"].str.lower() == pl]

    total = len(filtered)
    page = filtered.iloc[offset:offset + limit]

    destinations_out = [_row_to_place(r) for r in page.to_dict(orient="records")]
    return {
        "destinations": destinations_out,
        "total_count": total,
        "limit": limit,
        "offset": offset,
    }


@app.get("/destinations/search")
def search_destinations(
    q: str = Query("", description="Search query"),
    category: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> Mapping[str, Any]:
    """
    Search destinations by name, address, or description.
    """
    try:
        places = _coerce_places_v2(_places_v2())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Cannot load places: {exc}")

    filtered = places.copy()

    if category:
        cat = category.strip().lower()
        filtered = filtered[filtered["category"].str.lower() == cat]

    if q.strip():
        query_norm = normalize_text(q)
        mask = filtered["_search_text"].str.contains(query_norm, na=False)
        filtered = filtered[mask]

    # Sort by rating descending, then review_count descending
    sort_cols = []
    if "rating" in filtered.columns:
        sort_cols.append("rating")
    if "review_count" in filtered.columns:
        filtered["review_count"] = pd.to_numeric(filtered["review_count"], errors="coerce").fillna(0)
        sort_cols.append("review_count")
    if sort_cols:
        filtered = filtered.sort_values(by=sort_cols, ascending=False)

    results = filtered.iloc[offset:offset + limit]
    results_out = [_row_to_place(r) for r in results.to_dict(orient="records")]
    return {
        "results": results_out,
        "total_count": len(filtered),
    }


@app.get("/destinations/featured")
def featured_destinations(
    limit: int = Query(8, ge=1, le=50),
    offset: int = Query(0, ge=0),
) -> Mapping[str, Any]:
    """
    Get featured/popular destinations (highest rated with most reviews).
    Returns a diverse mix of categories.
    """
    try:
        places = _coerce_places_v2(_places_v2())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Cannot load places: {exc}")

    working = places.copy()
    working["review_count"] = pd.to_numeric(working["review_count"], errors="coerce").fillna(0)
    working["rating"] = pd.to_numeric(working["rating"], errors="coerce").fillna(0)

    # Score: weighted combination of rating and popularity (review count)
    max_reviews = working["review_count"].max() or 1
    working["_featured_score"] = (
        working["rating"] * 0.6
        + (working["review_count"] / max_reviews) * 5.0 * 0.4
    )

    # Get top items per category for diversity, then merge
    categories = working["category"].dropna().unique().tolist()
    per_cat = max(2, limit // max(len(categories), 1))

    featured_frames: list[pd.DataFrame] = []
    for cat in categories:
        cat_df = working[working["category"] == cat].nlargest(per_cat, "_featured_score")
        featured_frames.append(cat_df)

    if featured_frames:
        merged = pd.concat(featured_frames, ignore_index=True)
        merged = merged.drop_duplicates(subset=["place_id"], keep="first")
        merged = merged.nlargest(len(merged), "_featured_score")
    else:
        merged = working.nlargest(len(working), "_featured_score")

    if "_featured_score" in merged.columns:
        merged = merged.drop(columns=["_featured_score"])

    total = len(merged)
    page = merged.iloc[offset:offset + limit]

    destinations_out = [_row_to_place(r) for r in page.to_dict(orient="records")]
    return {
        "destinations": destinations_out,
        "total_count": total,
    }


@app.get("/destinations/{place_id}")
def get_destination(
    place_id: str,
) -> Mapping[str, Any]:
    """
    Get a single destination by place_id.
    """
    try:
        places = _coerce_places_v2(_places_v2())
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Cannot load places: {exc}")

    match = places[places["place_id"] == place_id]
    if match.empty:
        raise HTTPException(status_code=404, detail=f"Destination {place_id} not found")

    row = match.iloc[0].to_dict()
    return {"destination": _row_to_place(row)}


@app.get("/")
def root() -> Mapping[str, Any]:
    return _success(
        {
            "service": "smart-travel-recommendation",
            "docs": "/docs",
            "health": "/health",
        }
    )


@app.get("/health")
def health() -> Mapping[str, Any]:
    # MVP contract
    return {"status": "ok", "version": APP_VERSION}


@app.post("/recommend", response_model=RecommendResponse)
def recommend(
    req: RecommendRequest,
) -> Any:
    try:
        places = _coerce_places_v2(_places_v2())
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Cannot load places: {exc}")

    if "lat" not in places.columns or "lng" not in places.columns:
        raise HTTPException(status_code=500, detail="Dataset must include lat/lng")

    user_lat = float(req.location.lat)
    user_lng = float(req.location.lng)

    working = places.copy()
    working["distance_km"] = working.apply(
        lambda row: _haversine_km(user_lat, user_lng, float(row["lat"]), float(row["lng"])), axis=1
    )

    category = req.constraints.category.strip().lower()
    
    requested_radius = float(req.constraints.radius_km)
    radii = sorted(list(set([requested_radius, 5.0, 15.0, 30.0, 50.0, 100.0])))
    radii = [r for r in radii if r >= requested_radius]
    
    result = pd.DataFrame()
    used_radius = requested_radius
    
    for r in radii:
        result = _recommend_from_places(
            places=working,
            category=category,
            budget=req.constraints.budget,
            radius_km=r,
            top_k=200, # Get a larger pool so we can paginate
        )
        if not result.empty:
            used_radius = r
            break

    total_count = len(result)
    result = result.iloc[req.offset:req.offset + req.top_k]

    places_out = [_row_to_place(r) for r in result.to_dict(orient="records")]
    return {"places": places_out, "total_count": total_count, "radius_used": used_radius}


@app.post("/api/v1/recommendation")
def recommend_contract(
    payload: Mapping[str, Any] = Body(...),
    top_k: int = Query(DEFAULT_TOP_K, ge=1, le=50),
) -> Mapping[str, Any]:
    """Compatibility endpoint for older contract payload.

    This keeps existing adapter behavior for clients that send:
    - constraints.budget.{amount,currency}
    - constraints.main_category / sub_category
    - needs_wheelchair, CITY by city_name, ...

    It returns the MVP response shape (places/total_count).
    """

    try:
        normalized = normalize_recommendation_payload(payload)
        places = _coerce_places_v2(_places_v2())
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"Internal error: {exc}")

    # For compatibility we reuse the existing v0 recommender by translating the normalized request.
    # Coordinates are required to compute distance_km.
    if normalized.location.type != "COORDINATES" or normalized.location.lat is None or normalized.location.lng is None:
        raise HTTPException(status_code=400, detail="Only COORDINATES is supported for this endpoint")

    user_lat = float(normalized.location.lat)
    user_lng = float(normalized.location.lng)
    working = places.copy()
    working["distance_km"] = working.apply(
        lambda row: _haversine_km(user_lat, user_lng, float(row["lat"]), float(row["lng"])), axis=1
    )

    # category from adapter (sub_category or main_category)
    category = (normalized.constraints.sub_category or normalized.constraints.main_category or "").strip().lower()
    if not category:
        raise HTTPException(status_code=400, detail="constraints.category is required")

    # map numeric budget to buckets using the existing helper via normalize payload output
    # (the adapter already decided bucket via its own function when you call adapt_payload_to_internal_inputs;
    # here we approximate using currency-agnostic thresholds)
    # NOTE: if budget_amount is None we treat as 'high'
    amount = normalized.constraints.budget_amount
    if amount is None:
        budget_bucket = "high"
    else:
        low_max = float(os.getenv("APP_BUDGET_LOW_MAX", "200000"))
        medium_max = float(os.getenv("APP_BUDGET_MEDIUM_MAX", "1000000"))
        budget_bucket = "low" if amount <= low_max else ("medium" if amount <= medium_max else "high")

    result = recommend_places(
        data=working,
        category=category,
        max_budget=budget_bucket,
        max_distance_km=float(normalized.constraints.radius_km),
        top_k=int(top_k),
    )

    places_out = [_row_to_place(r) for r in result.to_dict(orient="records")]
    return {"places": places_out, "total_count": len(places_out)}


@app.post("/itinerary", response_model=ItineraryResponse)
def itinerary(
    req: ItineraryRequest,
) -> Any:
    """MVP itinerary contract."""
    user_lat = float(req.location.lat)
    user_lng = float(req.location.lng)
    preferences = [str(p).strip().lower() for p in req.preferences]
    budget = req.budget.strip().lower()
    radius_km = float(req.radius_km)

    places = _coerce_places_v2(_places_v2())
    working = places.copy()
    working["distance_km"] = working.apply(
        lambda row: _haversine_km(user_lat, user_lng, float(row["lat"]), float(row["lng"])), axis=1
    )

    slots = [
        {"time_slot": "morning", "label": "🌅 Sáng (8:00-11:00)", "fallback_reason": "Cafe yên tĩnh để bắt đầu ngày", "prefer": "cafe"},
        {"time_slot": "lunch", "label": "🍜 Trưa (11:30-13:30)", "fallback_reason": "Món ngon gần đó, phù hợp ngân sách", "prefer": "food"},
        {"time_slot": "afternoon", "label": "🌤 Chiều (14:00-17:00)", "fallback_reason": "Điểm tham quan thoáng mát, dễ di chuyển", "prefer": "sightseeing"},
        {"time_slot": "evening", "label": "🌙 Tối (18:00-21:00)", "fallback_reason": "Trải nghiệm buổi tối phù hợp sở thích", "prefer": None},
    ]

    used: set[str] = set()
    itinerary_out: list[Mapping[str, Any]] = []

    for idx, slot in enumerate(slots):
        desired = slot.get("prefer")
        if desired and desired in preferences:
            pref = desired
        elif slot["time_slot"] == "evening":
            pref = preferences[-1]
        else:
            pref = preferences[idx % len(preferences)]

        ranked = _recommend_from_places(
            places=working,
            category=pref,
            budget=budget,
            radius_km=radius_km,
            top_k=20,
        )

        chosen: Mapping[str, Any] | None = None
        for r in ranked.to_dict(orient="records"):
            key = str(r.get("place_id") or r.get("name") or "")
            if not key or key in used:
                continue
            used.add(key)
            chosen = r
            break

        itinerary_out.append(
            {
                "time_slot": slot["time_slot"],
                "label": slot["label"],
                "place": _row_to_place(chosen) if chosen is not None else None,
                "reason": slot["fallback_reason"],
            }
        )

    return {"itinerary": itinerary_out}


@app.get("/categories")
def categories() -> Mapping[str, Any]:
    places = _coerce_places_v2(_places_v2())
    if "category" not in places.columns:
        return {"categories": []}
    raw = (
        places["category"].dropna().astype(str).str.lower().str.strip().replace("", pd.NA).dropna().unique().tolist()
    )

    # Contract wants user-facing categories with a stable ordering.
    # Example: {"categories": ["cafe", "food", "hotel", "sightseeing", "park", "museum"]}
    base_order = ["cafe", "food", "hotel", "sightseeing", "park", "museum"]

    # Hide internal subcategories from the picker, but still allow them for /recommend.
    hidden_subcategories = {"walking", "wildlife"}

    observed: set[str] = set()
    has_sightseeing = False
    for c in raw:
        if c in SIGHTSEEING_CATEGORIES:
            has_sightseeing = True
        if c in hidden_subcategories:
            continue
        observed.add(c)

    if has_sightseeing:
        observed.add("sightseeing")

    # Always include the baseline categories so the frontend can render a consistent UI,
    # even if the current dataset doesn't contain all of them yet (e.g., "hotel").
    baseline: set[str] = set(base_order)
    combined = observed | baseline

    ordered = [c for c in base_order if c in combined]
    extras = sorted([c for c in combined if c not in base_order])
    return {"categories": ordered + extras}


# ---------------------------------------------------------------------------
# Landmark Recognition endpoint (Gemini Vision)
# ---------------------------------------------------------------------------

def _find_place_in_db(name: str) -> dict | None:
    """Tìm địa điểm trong bảng places theo tên (fuzzy ILIKE)."""
    from src.services.gemini_chat import get_db_connection
    from psycopg2.extras import RealDictCursor

    try:
        conn = get_db_connection()
    except Exception as e:
        logger.warning("Cannot connect to DB for landmark matching: %s", e)
        return None

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            query_base = """
                SELECT 
                    p.id::text as id, 
                    p.name, 
                    p.address, 
                    COALESCE(pes.rating, 0)::float as rating, 
                    COALESCE(pes.review_count, 0) as review_count, 
                    pes.price_level, 
                    ST_Y(p.geom) as lat, 
                    ST_X(p.geom) as lng, 
                    p.main_image_url, 
                    p.description 
                FROM places p
                LEFT JOIN place_external_stats pes ON p.id = pes.place_id
            """

            # Exact match (case-insensitive)
            cur.execute(
                query_base + " WHERE LOWER(p.name) = LOWER(%s) AND p.deleted_at IS NULL LIMIT 1",
                (name,),
            )
            row = cur.fetchone()
            if row:
                return dict(row)

            # Partial match
            cur.execute(
                query_base + " WHERE LOWER(p.name) LIKE LOWER(%s) AND p.deleted_at IS NULL "
                "ORDER BY pes.rating DESC NULLS LAST LIMIT 5",
                (f"%{name}%",),
            )
            rows = cur.fetchall()
            if rows:
                return dict(rows[0])

            # Reverse partial: place name is substring of AI name
            cur.execute(
                query_base + " WHERE LOWER(%s) LIKE '%%' || LOWER(p.name) || '%%' "
                "AND p.deleted_at IS NULL "
                "ORDER BY pes.rating DESC NULLS LAST LIMIT 5",
                (name,),
            )
            rows = cur.fetchall()
            if rows:
                return dict(rows[0])

    except Exception as e:
        logger.warning("DB place search error: %s", e)
    finally:
        conn.close()

    return None


@app.post("/landmarks/recognize")
async def recognize_landmark(
    file: UploadFile = File(...),
    lat: float | None = Form(None),
    lng: float | None = Form(None),
):
    """
    Nhận diện địa danh từ hình ảnh sử dụng Gemini 2.0 Flash (multimodal).
    Trả về thông tin nhận diện và địa điểm trùng khớp từ database (nếu có).
    """
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="File ảnh trống")
    if len(image_bytes) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(status_code=400, detail="File ảnh quá lớn (tối đa 10MB)")

    # Determine MIME type
    mime_type = file.content_type or "image/jpeg"
    if mime_type not in ("image/jpeg", "image/png", "image/webp", "image/gif"):
        mime_type = "image/jpeg"

    # Check if Gemini API key is available
    if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
        # Fallback: no AI, try GPS-based search only
        if lat is not None and lng is not None:
            place = _find_nearest_place_by_coords(lat, lng)
            if place:
                return {
                    "found": True,
                    "method": "gps",
                    "confidence": "medium",
                    "aiInfo": {
                        "name": place["name"],
                        "city": "",
                        "description": place.get("description", ""),
                        "cues": ["Dựa trên tọa độ GPS"],
                        "alternatives": [],
                    },
                    "dest": _format_db_place(place),
                }
        return {
            "found": False,
            "method": "none",
            "confidence": "low",
            "aiInfo": {
                "name": "",
                "city": "",
                "description": "Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm API key vào file .env của recommendation-service.",
                "cues": [],
                "alternatives": [],
            },
            "dest": None,
        }

    # Call Gemini Vision
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)

        gps_hint = ""
        if lat is not None and lng is not None:
            gps_hint = f"Ảnh có gợi ý tọa độ GPS: lat={lat:.5f}, lng={lng:.5f}. Hãy ưu tiên địa danh gần tọa độ này."
        else:
            gps_hint = "Ảnh không kèm tọa độ GPS. Hãy dựa hoàn toàn vào dấu hiệu hình ảnh."

        prompt_text = (
            "Nhận diện địa danh trong ảnh. " + gps_hint +
            "\nTrả về đúng JSON theo schema sau:\n"
            '{"found": boolean, "name": string, "city": string, "address": string, '
            '"country": string, "category": string, '
            '"confidence": "high"|"medium"|"low", '
            '"cues": string[], "alternatives": [{"name": string, "city": string}], '
            '"description": string}'
            "\nNếu không đủ cơ sở để xác định, đặt found=false và vẫn liệt kê cues quan sát được."
        )

        system_instruction = (
            "Bạn là chuyên gia nhận diện địa danh và điểm du lịch, am hiểu sâu Việt Nam. "
            "Nhiệm vụ: nhìn ảnh, xác định ĐỊA DANH/ĐIỂM ĐẾN cụ thể trong ảnh. "
            "Hãy phân tích các DẤU HIỆU NỔI BẬT để suy luận: kiến trúc đặc trưng, biển hiệu/chữ viết, "
            "tượng đài, logo, màu sắc công trình, cảnh quan thiên nhiên, bố cục xung quanh. "
            "CHỈ trả về JSON hợp lệ, không kèm giải thích, không markdown."
        )

        from PIL import Image
        import io

        # Load image via PIL
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if img.mode not in ("RGB", "RGBA", "L"):
            img = img.convert("RGB")
            
        # Scale down if too large (e.g. max 1024px side) to optimize speed
        img.thumbnail((1024, 1024))

        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=[
                img,
                prompt_text,
            ],
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                max_output_tokens=1024,
                temperature=0.2,
            ),
        )

        # Parse AI response
        ai_text = response.text or "{}"
        # Clean markdown code fences if present
        ai_text = ai_text.replace("```json", "").replace("```", "").strip()
        # Extract JSON block
        start_idx = ai_text.find("{")
        end_idx = ai_text.rfind("}")
        if start_idx != -1 and end_idx != -1:
            ai_text = ai_text[start_idx:end_idx + 1]

        ai_result = json.loads(ai_text)

    except json.JSONDecodeError as e:
        logger.warning("Gemini returned invalid JSON: %s", e)
        return {"found": False, "method": "ai", "confidence": "low",
                "aiInfo": {"name": "", "city": "", "description": "AI không trả về kết quả hợp lệ.", "cues": [], "alternatives": []},
                "dest": None}
    except Exception as e:
        logger.exception("Gemini Vision call failed: %s", e)
        return {"found": False, "method": "none", "confidence": "low",
                "aiInfo": {"name": "", "city": "", "description": f"Lỗi khi gọi AI: {str(e)}", "cues": [], "alternatives": []},
                "dest": None}

    # Normalize AI info
    ai_info = {
        "name": ai_result.get("name", ""),
        "city": ai_result.get("city", ""),
        "address": ai_result.get("address", ""),
        "country": ai_result.get("country", ""),
        "category": ai_result.get("category", ""),
        "description": ai_result.get("description", ""),
        "cues": (ai_result.get("cues") or [])[:5],
        "alternatives": (ai_result.get("alternatives") or [])[:3],
    }

    if not ai_result.get("found"):
        return {"found": False, "method": "ai", "confidence": ai_result.get("confidence", "low"),
                "aiInfo": ai_info, "dest": None}

    # Match AI result to database place
    dest = None
    ai_name = ai_result.get("name", "")
    if ai_name:
        db_place = _find_place_in_db(ai_name)
        if db_place:
            dest = _format_db_place(db_place)

    return {
        "found": True,
        "method": "ai",
        "confidence": ai_result.get("confidence", "medium"),
        "aiInfo": ai_info,
        "dest": dest,
    }


def _find_nearest_place_by_coords(lat: float, lng: float) -> dict | None:
    """Tìm địa điểm gần nhất trong DB theo tọa độ."""
    from src.services.gemini_chat import get_db_connection
    from psycopg2.extras import RealDictCursor

    try:
        conn = get_db_connection()
    except Exception:
        return None

    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT "
                "  p.id::text as id, "
                "  p.name, "
                "  p.address, "
                "  COALESCE(pes.rating, 0)::float as rating, "
                "  COALESCE(pes.review_count, 0) as review_count, "
                "  pes.price_level, "
                "  ST_Y(p.geom) as lat, "
                "  ST_X(p.geom) as lng, "
                "  p.main_image_url, "
                "  p.description, "
                "  ( 6371 * acos( cos(radians(%s)) * cos(radians(ST_Y(p.geom))) * cos(radians(ST_X(p.geom)) - radians(%s)) "
                "  + sin(radians(%s)) * sin(radians(ST_Y(p.geom))) ) ) AS distance_km "
                "FROM places p "
                "LEFT JOIN place_external_stats pes ON p.id = pes.place_id "
                "WHERE p.deleted_at IS NULL AND p.geom IS NOT NULL "
                "ORDER BY distance_km ASC LIMIT 1",
                (lat, lng, lat),
            )
            row = cur.fetchone()
            if row and row["distance_km"] < 50:
                return dict(row)
    except Exception as e:
        logger.warning("GPS place search error: %s", e)
    finally:
        conn.close()

    return None


def _format_db_place(place: dict) -> dict:
    """Format database place row cho response."""
    return {
        "id": str(place.get("id", "")),
        "name": place.get("name", ""),
        "address": place.get("address", ""),
        "main_image_url": place.get("main_image_url", ""),
        "rating": float(place["rating"]) if place.get("rating") else None,
        "review_count": int(place["review_count"]) if place.get("review_count") else 0,
        "lat": float(place["lat"]) if place.get("lat") else None,
        "lng": float(place["lng"]) if place.get("lng") else None,
        "description": place.get("description", ""),
    }

