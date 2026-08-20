from __future__ import annotations

import pandas as pd

PRICE_ORDER = ["low", "medium", "high"]
W_RATING = 0.4
W_DISTANCE = 0.3
W_PREFERENCE = 0.3

def _price_rank(value: str) -> int:
    value = str(value).lower().strip()
    if value not in PRICE_ORDER:
        return len(PRICE_ORDER)
    return PRICE_ORDER.index(value)

def _normalize_rating(df: pd.DataFrame) -> pd.Series:
    return ((pd.to_numeric(df["rating"], errors="coerce").fillna(0) - 1.0) / 4.0).clip(0, 1)

def _normalize_popularity(df: pd.DataFrame) -> pd.Series:
    if "review_count" in df.columns:
        review_col = pd.to_numeric(df["review_count"], errors="coerce").fillna(0)
        return (review_col.clip(0, 1000) / 1000.0)
    return pd.Series(0.0, index=df.index)

def _normalize_distance(series: pd.Series, max_distance_km: float) -> pd.Series:
    if max_distance_km <= 0:
        return pd.Series(1.0, index=series.index)
    return 1.0 - (series / max_distance_km).clip(0, 1)

def _compute_score(df: pd.DataFrame, max_distance_km: float, category: str) -> pd.Series:
    norm_rating = _normalize_rating(df)
    norm_pop = _normalize_popularity(df)
    norm_distance = _normalize_distance(df["distance_km"], max_distance_km)

    return 0.5 * norm_rating + 0.3 * norm_pop + 0.2 * norm_distance

def recommend_places(
    data: pd.DataFrame,
    category: str,
    max_budget: str,
    max_distance_km: float,
    top_k: int = 5,
) -> pd.DataFrame:
    working = data.copy()

    category = category.lower().strip()
    budget_rank = _price_rank(max_budget)

    working["price_rank"] = working["price_level"].map(_price_rank)
    filtered = working[
        (working["category"].str.lower().str.strip() == category)
        & (working["price_rank"] <= budget_rank)
        & (working["distance_km"] <= float(max_distance_km))
    ].copy()

    if filtered.empty:
        return filtered.drop(columns=["price_rank"], errors="ignore")

    # Higher rating, trusted review volume, shorter distance, and preference match get better score.
    filtered["score"] = _compute_score(filtered, max_distance_km, category)
    ranked = filtered.sort_values(by=["score", "rating", "distance_km"], ascending=[False, False, True])

    return ranked.head(top_k).drop(columns=["price_rank"], errors="ignore")
