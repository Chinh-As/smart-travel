# Smart Travel Prototype

## Overview
This repository contains the team prototype for the CTT009 Smart Travel project.
The initial scope is a recommendation flow for places based on budget, category, and distance.

## Project Structure
- `src/app.py`: FastAPI entry point (REST API).
- `src/core/recommender.py`: Core recommendation logic.
- `src/services/data_loader.py`: Data loading utilities.
- `data/processed/places_sample.csv`: Sample dataset for local demo.
- `tests/test_recommender.py`: Basic test for recommendation behavior.
- `scripts/bootstrap_data.py`: Optional script to regenerate sample data.

## Quick Start
1. Create and activate a Python environment.
2. Install dependencies:
   - `pip install -r requirements.txt`
3. Run the API service:
   - `uvicorn src.app:app --reload --port 8000`
4. Endpoints (MVP contract):
   - `GET /health` → `{ "status": "ok", "version": "0.1.0" }`
   - `POST /recommend` → request `{location, constraints, top_k}` → response `{places, total_count}`
   - `POST /itinerary` → request `{location, preferences, budget, radius_km}` → response `{itinerary}`
   - `GET /categories` → `{ "categories": [...] }`
5. Compatibility:
   - `POST /api/v1/recommendation` is kept for older payloads.
4. Run tests:
   - `python -m pytest -q`

## Branch and Commit Rules
- Branch naming: `type/short-description`
- Allowed types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
- Commit format: `<type>: short description`

## Current Milestone
- Week 1-2 foundation: scope, data schema, recommendation skeleton, and basic demo UI.
