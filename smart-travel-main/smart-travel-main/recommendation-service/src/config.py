from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=ROOT_DIR.parent / ".env")

DATA_PATH = Path(os.getenv("APP_DATA_PATH", ROOT_DIR / "data/processed/places_sample.csv"))
PLACES_V2_PATH = Path(os.getenv("APP_PLACES_V2_PATH", ROOT_DIR / "data/processed/places_v2_full.csv"))
DEFAULT_RADIUS_KM = float(os.getenv("APP_RADIUS_KM", "3.0"))
DEFAULT_TOP_K = int(os.getenv("APP_TOP_K", "5"))

# Gemini Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_MAX_TOKENS = int(os.getenv("GEMINI_MAX_TOKENS", "1024"))
