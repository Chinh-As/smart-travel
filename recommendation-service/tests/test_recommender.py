from __future__ import annotations

import pandas as pd

from src.core.recommender import recommend_places


def test_recommend_places_filters_and_ranks() -> None:
    data = pd.DataFrame(
        [
            {"name": "A", "category": "food", "price_level": "low", "distance_km": 1.0, "rating": 4.5},
            {"name": "B", "category": "food", "price_level": "medium", "distance_km": 2.0, "rating": 4.8},
            {"name": "C", "category": "hotel", "price_level": "low", "distance_km": 1.5, "rating": 4.9},
        ]
    )

    result = recommend_places(
        data=data,
        category="food",
        max_budget="medium",
        max_distance_km=3.0,
        top_k=2,
    )

    assert len(result) == 2
    assert set(result["name"].tolist()) == {"A", "B"}
