from __future__ import annotations

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/processed/places_sample.csv"


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    sample = pd.DataFrame(
        [
            {"name": "Pho Local", "category": "food", "price_level": "low", "distance_km": 1.2, "rating": 4.5},
            {"name": "River Grill", "category": "food", "price_level": "medium", "distance_km": 2.1, "rating": 4.6},
            {"name": "Sky Cafe", "category": "food", "price_level": "high", "distance_km": 3.5, "rating": 4.7},
            {"name": "Museum Center", "category": "sightseeing", "price_level": "low", "distance_km": 1.8, "rating": 4.4},
            {"name": "City Park", "category": "sightseeing", "price_level": "low", "distance_km": 0.9, "rating": 4.3},
            {"name": "Old Quarter Walk", "category": "sightseeing", "price_level": "medium", "distance_km": 2.6, "rating": 4.8},
            {"name": "Comfort Stay", "category": "hotel", "price_level": "medium", "distance_km": 1.4, "rating": 4.2},
            {"name": "Budget Sleep", "category": "hotel", "price_level": "low", "distance_km": 2.9, "rating": 4.1},
        ]
    )
    sample.to_csv(OUT, index=False)
    print(f"Wrote sample data to {OUT}")


if __name__ == "__main__":
    main()
