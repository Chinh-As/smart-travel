"""Gemini Chat Service — AI chatbot with Function Calling.

This module integrates Google Gemini API with Supabase PostgreSQL database,
allowing the chatbot to query real place data through function calls.
"""

from __future__ import annotations

import logging
import math
import os
import psycopg2
import urllib.parse
from psycopg2.extras import RealDictCursor
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Any, Mapping

import pandas as pd
import google.genai as genai
from google.genai import types

from src.config import (
    GEMINI_API_KEY,
    GEMINI_MAX_TOKENS,
    GEMINI_MODEL,
    PLACES_V2_PATH,
)
from src.utils import normalize_text

logger = logging.getLogger(__name__)

# ── System Prompt ──────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """\
Bạn là Mr. Roboto — trợ lý du lịch AI của Smart Travel Việt Nam.

QUY TẮC:
- Luôn trả lời bằng tiếng Việt, thân thiện, ngắn gọn (3-5 câu hoặc dạng gạch đầu dòng).
- Dùng emoji phù hợp để tăng tính thân thiện.
- Khi user hỏi về địa điểm, quán ăn, cafe, khách sạn, tham quan hoặc yêu cầu gợi ý địa điểm ở bất kỳ thành phố nào: BẮT BUỘC sử dụng tool search_places hoặc search_places_by_name để tìm dữ liệu thật từ cơ sở dữ liệu. NGHIÊM CẤM tự đưa ra tên địa điểm từ bộ nhớ của bạn mà không gọi tool.
- Khi trình bày kết quả từ tool, format dạng danh sách dễ đọc với tên, rating, địa chỉ.
- Nếu user chưa nói rõ vị trí, hãy hỏi lại hoặc mặc định tìm ở TP.HCM.
- Nếu không tìm thấy kết quả từ tool, hãy thông báo rõ cho người dùng là không tìm thấy trong cơ sở dữ liệu và gợi ý thử mở rộng bán kính hoặc thay đổi tiêu chí, không được tự bịa ra địa điểm.
- Chuyên về: địa điểm tham quan VN, lịch trình du lịch, giá vé, ẩm thực, mẹo tiết kiệm.
- Nếu không chắc thông tin, hãy nói thành thật.
"""

# ── Default Coordinates (Ho Chi Minh City center) ──────────────────────────────

DEFAULT_LAT = 10.7769
DEFAULT_LNG = 106.7009

# ── Database Connection ────────────────────────────────────────────────────────

def get_db_connection():
    import time
    db_url = os.getenv("SPRING_DATASOURCE_URL")
    db_user = os.getenv("SPRING_DATASOURCE_USERNAME")
    db_password = os.getenv("SPRING_DATASOURCE_PASSWORD")
    
    if not db_url or not db_user or not db_password:
        raise ValueError("Missing database configuration environment variables.")
        
    dsn = db_url[5:] if db_url.startswith("jdbc:") else db_url
    parsed = urllib.parse.urlparse(dsn)
    
    last_exc = None
    ssl_modes = [os.getenv("DB_SSLMODE", "require"), "prefer", "allow", "disable"]
    
    for attempt in range(3):
        for ssl_mode in ssl_modes:
            try:
                conn = psycopg2.connect(
                    host=parsed.hostname,
                    port=parsed.port or 5432,
                    database=parsed.path.lstrip('/'),
                    user=db_user,
                    password=db_password,
                    sslmode=ssl_mode,
                    connect_timeout=5
                )
                logger.info("Connected to database successfully on attempt %d with sslmode %s", attempt + 1, ssl_mode)
                return conn
            except Exception as e:
                last_exc = e
                logger.warning("Database connection attempt %d with sslmode %s failed: %s", attempt + 1, ssl_mode, e)
        time.sleep(1)
        
    raise last_exc or Exception("Failed to connect to database after retries.")

# ── Category Mapping ───────────────────────────────────────────────────────────

_VI_CATEGORY_MAP = {
    "cảnh quan": "SIGHTSEEING",
    "lịch sử - văn hóa": "HISTORY_CULTURE",
    "nghỉ dưỡng biển": "BEACH_RESORT",
    "ẩm thực": "CULINARY",
    "giải trí": "ENTERTAINMENT",
    "mua sắm": "SHOPPING",
    "thiên nhiên": "NATURE",
    "tâm linh": "SPIRITUAL"
}

_DB_CATEGORY_MAP = {
    "sightseeing": ["SIGHTSEEING", "NATURE"],
    "culture": ["HISTORY_CULTURE", "SPIRITUAL"],
    "food": ["CULINARY"],
    "relax": ["CULINARY"],
    "stay": ["BEACH_RESORT"],
    "beach": ["BEACH_RESORT"],
    "cafe": ["CULINARY"],
    "restaurant": ["CULINARY"],
    "hotel": ["BEACH_RESORT"],
    "entertainment": ["ENTERTAINMENT"],
    "nature": ["NATURE", "SIGHTSEEING"],
    "shopping": ["SHOPPING"],
    "history": ["HISTORY_CULTURE"],
    "nightlife": ["ENTERTAINMENT", "CULINARY"],
    "tâm linh": ["SPIRITUAL"],
    "lịch sử": ["HISTORY_CULTURE"]
}

def map_category_to_db(cat: str) -> list[str]:
    c = cat.lower().strip()
    if c in _VI_CATEGORY_MAP:
        return [_VI_CATEGORY_MAP[c]]
    if c in _DB_CATEGORY_MAP:
        return _DB_CATEGORY_MAP[c]
    up = c.upper()
    if up in ["SIGHTSEEING", "HISTORY_CULTURE", "BEACH_RESORT", "CULINARY", "ENTERTAINMENT", "SHOPPING", "NATURE", "SPIRITUAL"]:
        return [up]
    return ["SIGHTSEEING"]

# ── Recommender scoring formula ────────────────────────────────────────────────

PRICE_ORDER = ["free", "low", "medium", "high", "unknown"]

def _price_rank(value: str) -> int:
    value = str(value).lower().strip()
    if value not in PRICE_ORDER:
        return len(PRICE_ORDER)
    return PRICE_ORDER.index(value)

def _normalize_rating(df: pd.DataFrame) -> pd.Series:
    return ((pd.to_numeric(df["rating"], errors="coerce").fillna(0) - 1.0) / 4.0).clip(0, 1)

def _normalize_popularity(df: pd.DataFrame) -> pd.Series:
    review_col = pd.to_numeric(df["review_count"], errors="coerce").fillna(0)
    return (review_col.clip(0, 1000) / 1000.0)

def _normalize_distance(series: pd.Series, max_distance_km: float) -> pd.Series:
    if max_distance_km <= 0:
        return pd.Series(1.0, index=series.index)
    return 1.0 - (series / max_distance_km).clip(0, 1)

def _compute_score(df: pd.DataFrame, max_distance_km: float, category: str) -> pd.Series:
    norm_rating = _normalize_rating(df)
    norm_pop = _normalize_popularity(df)
    norm_distance = _normalize_distance(df["distance_km"], max_distance_km)
    return 0.5 * norm_rating + 0.3 * norm_pop + 0.2 * norm_distance

def _row_to_place_dict(row: Mapping[str, Any]) -> dict[str, Any]:
    """Convert database row to a serialisable place dict."""
    def _safe(v: Any) -> Any:
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            return None
        return v

    return {
        "place_id": _safe(row.get("place_id")),
        "name": _safe(row.get("name")),
        "category": _safe(row.get("category")),
        "price_level": _safe(row.get("price_level")),
        "rating": _safe(row.get("rating")),
        "distance_km": _safe(row.get("distance_km")),
        "score": _safe(row.get("score")),
        "image_url": _safe(row.get("image_url")),
        "address": _safe(row.get("address")),
        "description": _safe(row.get("description")),
        "opening_hours": _safe(row.get("opening_hours")),
        "review_count": _safe(row.get("review_count")),
        "lat": _safe(row.get("lat")),
        "lng": _safe(row.get("lng")),
        "wheelchair_access": _safe(row.get("wheelchair_access")),
    }

# ── Local CSV Fallback Search ──────────────────────────────────────────────────

def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlnd = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlnd / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def _local_search_places(
    category: str,
    budget: str = "high",
    radius_km: float = 10.0,
    lat: float = DEFAULT_LAT,
    lng: float = DEFAULT_LNG,
    top_k: int = 5,
) -> dict:
    try:
        logger.info("Executing local search fallback for category: %s", category)
        if not os.path.exists(PLACES_V2_PATH):
            logger.warning("Local places CSV not found at: %s", PLACES_V2_PATH)
            return {"places": [], "count": 0}
            
        df = pd.read_csv(PLACES_V2_PATH)
        df["lat"] = pd.to_numeric(df["lat"], errors="coerce")
        df["lng"] = pd.to_numeric(df["lng"], errors="coerce")
        df = df.dropna(subset=["lat", "lng"])
        
        # Distance calculation
        df["distance_km"] = df.apply(lambda r: haversine_distance(lat, lng, r["lat"], r["lng"]), axis=1)
        df = df[df["distance_km"] <= radius_km]
        
        # Category filtering
        db_cats = map_category_to_db(category)
        db_cats_lower = [c.lower() for c in db_cats]
        df = df[df["category"].str.lower().str.strip().isin(db_cats_lower)]
        
        # Budget filtering
        budget_rank = _price_rank(budget)
        df["price_level"] = df["price_level"].fillna("medium")
        df["price_rank"] = df["price_level"].map(_price_rank)
        df = df[df["price_rank"] <= budget_rank]
        
        if df.empty:
            return {
                "places": [],
                "count": 0,
                "radius_used_km": radius_km,
                "category_searched": category,
            }
            
        # Score and rank
        df["score"] = _compute_score(df, radius_km, db_cats[0])
        ranked = df.sort_values(by=["score", "rating", "distance_km"], ascending=[False, False, True])
        
        results = ranked.head(top_k)
        
        places_out = []
        for _, r in results.iterrows():
            img_url = r.get("images_url", "")
            if isinstance(img_url, str) and img_url.startswith("["):
                try:
                    import json
                    parsed_imgs = json.loads(img_url)
                    img_url = parsed_imgs[0] if parsed_imgs else ""
                except Exception:
                    img_url = ""
            if not img_url:
                img_url = r.get("image_url", "")
                
            places_out.append({
                "place_id": str(r.get("place_id")),
                "name": str(r.get("name")),
                "category": str(r.get("category")).upper(),
                "price_level": str(r.get("price_level")),
                "rating": float(r.get("rating", 0)),
                "distance_km": float(r.get("distance_km", 0)),
                "score": float(r.get("score", 0)),
                "image_url": img_url,
                "address": str(r.get("address", "")),
                "description": str(r.get("description", "")),
                "opening_hours": str(r.get("opening_hours", "")),
                "review_count": int(r.get("review_count", 0)),
                "lat": float(r.get("lat")),
                "lng": float(r.get("lng")),
                "wheelchair_access": bool(r.get("wheelchair_access", False)),
            })
            
        return {
            "places": places_out,
            "count": len(places_out),
            "radius_used_km": radius_km,
            "category_searched": category,
        }
    except Exception as exc:
        logger.exception("local_search_places failed")
        return {"places": [], "count": 0, "error": str(exc)}

def _local_search_places_by_name(query: str, limit: int = 5) -> dict:
    try:
        logger.info("Executing local search by name fallback for query: %s", query)
        if not os.path.exists(PLACES_V2_PATH):
            logger.warning("Local places CSV not found at: %s", PLACES_V2_PATH)
            return {"places": [], "count": 0}
            
        df = pd.read_csv(PLACES_V2_PATH)
        df["lat"] = pd.to_numeric(df["lat"], errors="coerce")
        df["lng"] = pd.to_numeric(df["lng"], errors="coerce")
        df = df.dropna(subset=["lat", "lng"])
        
        q = normalize_text(query)
        
        def matches(r):
            name_norm = normalize_text(str(r.get("name", "")))
            desc_norm = normalize_text(str(r.get("description", "")))
            addr_norm = normalize_text(str(r.get("address", "")))
            return q in name_norm or q in desc_norm or q in addr_norm
            
        df["matches"] = df.apply(matches, axis=1)
        matched = df[df["matches"] == True]
        
        matched = matched.sort_values(by=["rating", "review_count"], ascending=[False, False])
        results = matched.head(limit)
        
        places_out = []
        for _, r in results.iterrows():
            img_url = r.get("images_url", "")
            if isinstance(img_url, str) and img_url.startswith("["):
                try:
                    import json
                    parsed_imgs = json.loads(img_url)
                    img_url = parsed_imgs[0] if parsed_imgs else ""
                except Exception:
                    img_url = ""
            if not img_url:
                img_url = r.get("image_url", "")
                
            places_out.append({
                "place_id": str(r.get("place_id")),
                "name": str(r.get("name")),
                "category": str(r.get("category")).upper(),
                "price_level": str(r.get("price_level")),
                "rating": float(r.get("rating", 0)),
                "distance_km": 0.0,
                "score": 0.0,
                "image_url": img_url,
                "address": str(r.get("address", "")),
                "description": str(r.get("description", "")),
                "opening_hours": str(r.get("opening_hours", "")),
                "review_count": int(r.get("review_count", 0)),
                "lat": float(r.get("lat")),
                "lng": float(r.get("lng")),
                "wheelchair_access": bool(r.get("wheelchair_access", False)),
            })
            
        return {"places": places_out, "count": len(places_out)}
    except Exception as exc:
        logger.exception("local_search_places_by_name failed")
        return {"places": [], "count": 0, "error": str(exc)}

# ── Tool Functions (called by Gemini via Function Calling) ─────────────────────

def search_places(
    category: str,
    budget: str = "high",
    radius_km: float = 10.0,
    lat: float = DEFAULT_LAT,
    lng: float = DEFAULT_LNG,
    top_k: int = 5,
) -> dict:
    """Tìm kiếm địa điểm theo thể loại, ngân sách và khoảng cách từ vị trí người dùng.

    Args:
        category: Loại địa điểm cần tìm (Cảnh quan, Lịch sử - Văn hóa, Nghỉ dưỡng biển, Ẩm thực, Giải trí, Mua sắm, Thiên nhiên, Tâm linh).
        budget: Mức ngân sách tối đa (low = dưới 200k, medium = 200k-1tr, high = trên 1tr VND).
        radius_km: Bán kính tìm kiếm tính bằng km từ vị trí người dùng.
        lat: Vĩ độ vị trí hiện tại của người dùng (mặc định TP.HCM).
        lng: Kinh độ vị trí hiện tại của người dùng (mặc định TP.HCM).
        top_k: Số lượng kết quả trả về tối đa.
    """
    try:
        db_cats = map_category_to_db(category)
        budget_rank = _price_rank(budget)
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Query matching places using PostGIS ST_DWithin and ST_Distance
        query = """
            SELECT 
                p.id::text as place_id,
                p.name,
                c.name as category,
                pes.price_level,
                COALESCE(pes.rating, 0)::float as rating,
                ST_Y(p.geom) as lat,
                ST_X(p.geom) as lng,
                ST_Distance(p.geom::geography, ST_SetSRID(ST_Point(%s, %s), 4326)::geography) / 1000.0 as distance_km,
                p.main_image_url as image_url,
                p.address,
                p.description,
                p.raw_opening_hours as opening_hours,
                COALESCE(pes.review_count, 0) as review_count,
                p.wheelchair_access
            FROM places p
            LEFT JOIN place_external_stats pes ON p.id = pes.place_id
            JOIN place_categories pc ON p.id = pc.place_id
            JOIN categories c ON pc.category_id = c.id
            WHERE c.name = ANY(%s)
              AND ST_DWithin(p.geom::geography, ST_SetSRID(ST_Point(%s, %s), 4326)::geography, %s * 1000.0)
        """
        cursor.execute(query, (lng, lat, db_cats, lng, lat, radius_km))
        rows = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        if not rows:
            return {
                "places": [],
                "count": 0,
                "radius_used_km": radius_km,
                "category_searched": category,
            }
            
        df = pd.DataFrame(rows)
        df["price_level"] = df["price_level"].fillna("medium")
        df["price_rank"] = df["price_level"].map(_price_rank)
        
        # Filter budget
        filtered = df[df["price_rank"] <= budget_rank].copy()
        if filtered.empty:
            return {
                "places": [],
                "count": 0,
                "radius_used_km": radius_km,
                "category_searched": category,
            }
            
        # Compute scores and rank
        filtered["score"] = _compute_score(filtered, radius_km, db_cats[0])
        ranked = filtered.sort_values(by=["score", "rating", "distance_km"], ascending=[False, False, True])
        
        results = ranked.head(top_k)
        places_out = [_row_to_place_dict(r) for r in results.to_dict(orient="records")]
        
        return {
            "places": places_out,
            "count": len(places_out),
            "radius_used_km": radius_km,
            "category_searched": category,
        }
    except Exception as exc:
        logger.warning("Database search failed, falling back to local search: %s", exc)
        return _local_search_places(
            category=category,
            budget=budget,
            radius_km=radius_km,
            lat=lat,
            lng=lng,
            top_k=top_k
        )

def search_places_by_name(query: str, limit: int = 5) -> dict:
    """Tìm kiếm địa điểm theo tên, địa chỉ hoặc mô tả.

    Args:
        query: Từ khóa tìm kiếm (tên quán, địa chỉ, mô tả, v.v.).
        limit: Số lượng kết quả tối đa trả về.
    """
    try:
        if not query or not query.strip():
            return {"places": [], "count": 0}
            
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        sql_query = """
            SELECT 
                p.id::text as place_id,
                p.name,
                c.name as category,
                pes.price_level,
                COALESCE(pes.rating, 0)::float as rating,
                ST_Y(p.geom) as lat,
                ST_X(p.geom) as lng,
                0.0 as distance_km,
                p.main_image_url as image_url,
                p.address,
                p.description,
                p.raw_opening_hours as opening_hours,
                COALESCE(pes.review_count, 0) as review_count,
                p.wheelchair_access
            FROM places p
            LEFT JOIN place_external_stats pes ON p.id = pes.place_id
            LEFT JOIN place_categories pc ON p.id = pc.place_id
            LEFT JOIN categories c ON pc.category_id = c.id
            WHERE p.name ILIKE %s 
               OR p.description ILIKE %s 
               OR p.address ILIKE %s
            ORDER BY pes.rating DESC NULLS LAST, pes.review_count DESC NULLS LAST
            LIMIT %s
        """
        search_pattern = f"%{query}%"
        cursor.execute(sql_query, (search_pattern, search_pattern, search_pattern, limit))
        rows = cursor.fetchall()
        
        cursor.close()
        conn.close()
        
        places_out = [_row_to_place_dict(r) for r in rows]
        return {"places": places_out, "count": len(places_out)}
    except Exception as exc:
        logger.warning("Database search_places_by_name failed, falling back to local search: %s", exc)
        return _local_search_places_by_name(query=query, limit=limit)

def get_available_categories() -> dict:
    """Lấy danh sách tất cả các loại địa điểm có trong hệ thống Smart Travel."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT display_name FROM categories WHERE display_name IS NOT NULL ORDER BY display_name;")
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        cats = [row[0] for row in rows]
        return {"categories": cats}
    except Exception as exc:
        logger.exception("get_available_categories failed")
        return {"categories": [], "error": str(exc)}

# ── Gemini Chat Service ────────────────────────────────────────────────────────

# Tools list for Gemini
TOOL_FUNCTIONS = [search_places, search_places_by_name, get_available_categories]

# Map function names to callables for execution
_TOOL_DISPATCH: dict[str, Any] = {
    "search_places": search_places,
    "search_places_by_name": search_places_by_name,
    "get_available_categories": get_available_categories,
}

MAX_FUNCTION_CALL_ROUNDS = 3

@dataclass
class ChatResult:
    """Result from a chat interaction."""
    reply: str
    places: list[dict[str, Any]] = field(default_factory=list)

class GeminiChatService:
    """Manages Gemini API interactions with function calling support."""

    def __init__(self) -> None:
        if not GEMINI_API_KEY or GEMINI_API_KEY == "your_gemini_api_key_here":
            raise ValueError(
                "GEMINI_API_KEY is not set. "
                "Please set it in your .env file or environment variables."
            )
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model = GEMINI_MODEL

    def _build_contents(
        self,
        history: list[dict[str, str]],
        message: str,
    ) -> list[types.Content]:
        contents: list[types.Content] = []

        for msg in history:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            gemini_role = "model" if role in ("assistant", "bot", "model") else "user"
            contents.append(
                types.Content(
                    role=gemini_role,
                    parts=[types.Part.from_text(text=content)],
                )
            )

        contents.append(
            types.Content(
                role="user",
                parts=[types.Part.from_text(text=message)],
            )
        )
        return contents

    def _execute_function(self, name: str, args: dict[str, Any]) -> Any:
        fn = _TOOL_DISPATCH.get(name)
        if fn is None:
            return {"error": f"Unknown function: {name}"}
        try:
            return fn(**args)
        except Exception as exc:
            logger.exception("Function %s failed", name)
            return {"error": str(exc)}

    def chat(
        self,
        message: str,
        history: list[dict[str, str]] | None = None,
        user_lat: float | None = None,
        user_lng: float | None = None,
    ) -> ChatResult:
        if history is None:
            history = []

        contents = self._build_contents(history, message)
        collected_places: list[dict[str, Any]] = []

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=TOOL_FUNCTIONS,
            temperature=0.1,
            max_output_tokens=GEMINI_MAX_TOKENS,
        )

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=contents,
                config=config,
            )
        except Exception as exc:
            logger.exception("Gemini API call failed")
            return ChatResult(
                reply=f"Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau. ({exc})"
            )

        for _round in range(MAX_FUNCTION_CALL_ROUNDS):
            if not response.candidates:
                break

            function_calls = []
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    function_calls.append(part.function_call)

            if not function_calls:
                break

            function_response_parts: list[types.Part] = []
            for fc in function_calls:
                logger.info("Gemini calling function: %s(%s)", fc.name, fc.args)
                
                # Inject user lat/lng if available in arguments and not overridden by Gemini
                args = dict(fc.args)
                if user_lat is not None and "lat" not in args:
                    args["lat"] = user_lat
                if user_lng is not None and "lng" not in args:
                    args["lng"] = user_lng
                    
                result = self._execute_function(fc.name, args)

                if isinstance(result, dict) and "places" in result:
                    collected_places.extend(result["places"])

                function_response_parts.append(
                    types.Part.from_function_response(
                        name=fc.name,
                        response={"result": result},
                    )
                )

            function_call_parts = [
                types.Part.from_function_call(name=fc.name, args=dict(fc.args))
                for fc in function_calls
            ]

            contents.append(
                types.Content(role="model", parts=function_call_parts)
            )
            contents.append(
                types.Content(role="user", parts=function_response_parts)
            )

            try:
                response = self.client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=config,
                )
            except Exception as exc:
                logger.exception("Gemini API follow-up call failed")
                return ChatResult(
                    reply="Xin lỗi, đã xảy ra lỗi khi xử lý kết quả. Vui lòng thử lại.",
                    places=collected_places,
                )

        reply_text = ""
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if part.text:
                    reply_text += part.text

        if not reply_text:
            reply_text = "Xin lỗi, tôi không thể tạo câu trả lời lúc này. Vui lòng thử lại."

        seen_ids: set[str] = set()
        unique_places: list[dict[str, Any]] = []
        for p in collected_places:
            pid = p.get("place_id", "")
            if pid and pid in seen_ids:
                continue
            if pid:
                seen_ids.add(pid)
            unique_places.append(p)

        return ChatResult(reply=reply_text, places=unique_places)

# ── Singleton Service ──────────────────────────────────────────────────────────

_service_instance: GeminiChatService | None = None

def get_gemini_service() -> GeminiChatService:
    """Get or create the singleton GeminiChatService instance."""
    global _service_instance
    if _service_instance is None:
        _service_instance = GeminiChatService()
    return _service_instance
