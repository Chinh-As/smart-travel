from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.services.data_adapter_v1 import (
    adapt_payload_to_internal_inputs,
    apply_contract_request_to_places_v2,
    normalize_recommendation_payload,
)


def _load_places_v2_sample() -> pd.DataFrame:
    root = Path(__file__).resolve().parents[1]
    path = root / "data/processed/places_v2_sample.csv"
    return pd.read_csv(path)


def test_normalize_payload_coercion_and_defaults_coordinates() -> None:
    payload = {
        "location": {"type": "COORDINATES", "lat": "10.762622", "lng": "106.681043"},
        "constraints": {
            "budget": {"amount": "50000000.0", "currency": "VND"},
            "radius_km": "5.0",
            "number_of_people": "3",
            "transport_type": "MOTORBIKE",
            "needs_wheelchair": "false",
            "main_category": "FOOD",
            "sub_category": "CAFE",
        },
        "prompt_text": None,
    }

    req = normalize_recommendation_payload(payload)
    assert req.location.type == "COORDINATES"
    assert req.location.lat == 10.762622
    assert req.location.lng == 106.681043
    assert req.constraints.radius_km == 5.0
    assert req.constraints.number_of_people == 3
    assert req.constraints.needs_wheelchair is False
    assert req.prompt_text == ""


def test_adapt_payload_to_internal_inputs_mapping() -> None:
    payload = {
        "location": {"type": "COORDINATES", "lat": 10.762622, "lng": 106.681043},
        "constraints": {
            "budget": {"amount": 120000, "currency": "VND"},
            "radius_km": 3,
            "needs_wheelchair": True,
            "main_category": "FOOD",
            "sub_category": "CAFE",
        },
        "prompt_text": "quiet cats",
    }

    internal = adapt_payload_to_internal_inputs(payload)
    assert internal["location_type"] == "COORDINATES"
    assert internal["radius_km"] == 3.0
    assert internal["needs_wheelchair"] is True
    assert internal["category"] == "cafe"
    assert internal["max_budget_bucket"] in {"low", "medium", "high"}


def test_apply_contract_request_to_places_v2_coordinates_returns_results() -> None:
    places = _load_places_v2_sample()
    payload = {
        "location": {"type": "COORDINATES", "lat": 10.762622, "lng": 106.681043},
        "constraints": {
            "budget": {"amount": 50000000.0, "currency": "VND"},
            "radius_km": 5.0,
            "needs_wheelchair": False,
            "main_category": "FOOD",
            "sub_category": "CAFE",
        },
        "prompt_text": "space with cats",
    }

    req = normalize_recommendation_payload(payload)
    result = apply_contract_request_to_places_v2(places, req, top_k=5)
    assert not result.empty
    assert set(result["category"].unique().tolist()) == {"cafe"}


def test_apply_contract_request_to_places_v2_city_uses_city_centroid() -> None:
    places = _load_places_v2_sample()
    payload = {
        "location": {"type": "CITY", "city_name": "Dak Lak"},
        "constraints": {
            "budget": {"amount": 50000000.0, "currency": "VND"},
            "radius_km": 10.0,
            "needs_wheelchair": True,
            "main_category": "FOOD",
            "sub_category": "CAFE",
        },
        "prompt_text": "coffee quiet",
    }

    req = normalize_recommendation_payload(payload)
    result = apply_contract_request_to_places_v2(places, req, top_k=5)
    assert not result.empty
    # should respect wheelchair filter
    assert (result.get("wheelchair_access", True) == True).all()  # noqa: E712
