# Problem Analysis – Smart Travel System (MVP v1)

## 1. Problem Context

In modern tourism, users are often overwhelmed by the large number of available travel destinations and lack efficient tools to quickly plan suitable trips. Travelers need to consider multiple factors such as budget, distance, preferences, and time constraints, which makes decision-making complex and time-consuming.

Existing platforms typically provide static lists of locations or generic recommendations, but they do not effectively support personalized filtering or automatic itinerary generation within a short time frame.

To address this, the Smart Travel System aims to build a **recommendation prototype** that helps users quickly discover suitable places based on their constraints (category, budget, distance).

In the current MVP, the system focuses on a single core flow:

* **Search (exploration):** Filtering and ranking places by category, budget level, distance, and rating using a rule-based scoring formula.

Future iterations may extend this into an **Instant Plan** flow (auto-generating daily itineraries) and integrate AI/NLP components — see Section 6 for scope boundaries.

### AI Roadmap

The current prototype uses a **rule-based scoring formula** for transparency and simplicity. However, the system is designed to be AI-ready:

* **Current (MVP):** Rule-based filtering + deterministic scoring (`score = rating × 2 − distance_km × 0.25`)
* **Near-term:** NLP extraction from free-text user prompts (e.g., "quán yên tĩnh, có mèo") to generate filter tags
* **Long-term:** LLM-based match reasoning, personalized scoring via collaborative filtering, and sentiment analysis from user reviews

This progression aligns with the course objective of demonstrating how computational thinking can evolve into AI-augmented systems.

---

## 2. From Ill-Defined to Well-Defined

During the first two weeks, the team refined the problem from a vague concept to a precise, implementable specification through group discussion and iterative analysis:

| Aspect | Ill-Defined (Week 1 initial brainstorm) | Well-Defined (After Week 1–2 analysis) |
|---|---|---|
| Goal | "Recommend travel places" | Filter and rank Top-K places by category + budget level + distance + rating |
| Input | "User preferences" | Specific fields: category, max_budget (low/medium/high), max_distance_km, top_k |
| Output | "A list of places" | Ranked list with name, category, price_level, distance_km, rating, score |
| Scoring | "Show the best ones" | `score = rating × 2 − distance_km × 0.25` |
| Data | "Some place data" | Structured CSV with 5 required columns: name, category, price_level, distance_km, rating |
| Scope | "Smart travel system" | MVP: Search flow with rule-based recommendation; no booking, no chatbot, no mobile app |

The key insight from this refinement process was that **reducing scope** (from "smart travel system" to "search-based recommendation with 4 input fields") made the problem tractable and testable within the project timeline.

---

## 3. Pain Points

* **Filtering difficulty:** Travelers visiting a new city cannot efficiently filter places by budget AND distance AND category at the same time — most platforms only support 1–2 filters.
* **No explainable ranking:** Existing tools show results without explaining why a place ranks higher, making users distrust recommendations.
* **Budget mismatch:** Budget-conscious users (students, backpackers) frequently encounter expensive options that waste their browsing time.
* **Information overload:** Multiple review sites with conflicting ratings create decision fatigue.
* **No quick plan:** Users who want a ready-to-go itinerary must manually combine search results across food, sightseeing, and accommodation — a tedious process.

---

## 4. Input / Output and Constraints

### 4.1 Search Flow (Current Prototype)

#### Input

| Field | Type | Description | Example |
|---|---|---|---|
| `category` | string | Place type to filter | `food`, `sightseeing`, `hotel` |
| `max_budget` | string (low / medium / high) | Maximum budget level | `medium` |
| `max_distance_km` | float | Maximum radius in km | `3.0` |
| `top_k` | int (1–10) | Number of results to return | `5` |

> **Note on budget representation:** The MVP prototype uses a simplified `price_level` string (low/medium/high) for rapid development. The expanded IO design (documented in [io-recommendation-and-database-schema.md](io-recommendation-and-database-schema.md)) specifies a numeric budget in VND — this will be adopted when the system migrates to a real database.

#### Output

| Field | Type | Description |
|---|---|---|
| `name` | string | Place name |
| `category` | string | Place category |
| `price_level` | string | Budget level (low / medium / high) |
| `distance_km` | float | Distance from user in km |
| `rating` | float | User rating (e.g. 4.5) |
| `score` | float | Composite ranking score |

#### Scoring & Ranking Formula

```
score = rating × 2 − distance_km × 0.25
```
This formula prioritizes high-rated, nearby places while penalizing far-away locations.

Results are sorted by: **score DESC → rating DESC → distance_km ASC**

#### Filtering Rules

1. Category must match exactly (case-insensitive)
2. `price_rank(place) ≤ price_rank(max_budget)` where low=0, medium=1, high=2
3. `distance_km ≤ max_distance_km`
4. Return top K results after sorting

### 4.2 Future Extension: Instant Plan Flow

The team envisions an **Instant Plan** feature that auto-generates a daily itinerary (morning → afternoon → evening) based on user constraints. This is listed as out-of-scope for MVP v1 and will be explored in Week 6–7 if the Search flow is stable.

### 4.3 System Constraints

* Uses static dataset (CSV with 8 sample records for development; planned expansion to 50+ records for final demo)
* No real-time API integration (Google Maps, etc.)
* Basic recommendation logic: rule-based filtering + scoring formula
* No booking/payment system
* No user authentication
* Web-based only (Streamlit demo UI)
* Python tech stack: Streamlit, Pandas, Pytest

---

## 5. User Scenarios

### Scenario 1: Budget Student Looking for Cheap Food

**User:** Minh, a second-year university student in Ho Chi Minh City with a limited daily food budget of under 50,000 VND.

**Context:** Minh is near campus and wants to find a cheap lunch spot within walking distance.

**Input:** category=food, budget=low, radius=2km, top_k=3

**Expected behavior:** The system filters 8 records → keeps only `food` category → keeps only `low` price level → keeps places within 2km → ranks by score. With the current sample dataset, **Pho Local** (rating=4.5, distance=1.2km, score=8.7) should be the top result.

---

### Scenario 2: Foreign Tourist Exploring Attractions

**User:** Sarah, a backpacker from Australia visiting Vietnam for the first time.

**Context:** Sarah has a moderate budget and wants to explore popular sightseeing spots near her hotel within a 5km radius.

**Input:** category=sightseeing, budget=medium, radius=5km, top_k=5

**Expected behavior:** The system returns sightseeing places with price level ≤ medium within 5km. Expected results sorted by score: **Old Quarter Walk** (4.8★, 2.6km, score=8.95), **City Park** (4.3★, 0.9km, score=8.375), **Museum Center** (4.4★, 1.8km, score=8.35).

---

### Scenario 3: Edge Case — No Results

**User:** Any user with very strict constraints.

**Input:** category=food, budget=low, radius=0.5km

**Expected behavior:** No place in the sample dataset matches all three filters simultaneously → the system displays: *"No place matches the current filters."*

---

### Summary Table

| # | User Type | Input | Expected Result |
|---|---|---|---|
| 1 | Budget student | food, low, 2km, top_k=3 | Pho Local (score=8.7) |
| 2 | Foreign tourist | sightseeing, medium, 5km, top_k=5 | Old Quarter Walk, City Park, Museum Center |
| 3 | Edge case | food, low, 0.5km | "No place matches" warning |
| 4 | Family group | sightseeing, high, 3km, top_k=3 | All sightseeing within 3km across all price levels |

---

## 6. Scope Alignment

This analysis follows the MVP scope defined in the Project Proposal:

**In scope (MVP v1):**
* Search flow with category + budget + distance filtering
* Scoring-based ranking with explainable formula
* Lightweight web interface (Streamlit-based prototype)
* Sample dataset (CSV, expanding from 8 to 50+ records)
* Basic test coverage

**Out of scope (future iterations):**
* Instant Plan / itinerary generation
* NLP prompt input (`prompt_text`) and AI-based tag extraction
* GPS-based location (coordinates / city selection)
* User authentication (JWT, Google login)
* Database (PostgreSQL + PostGIS)
* LLM-based match reasoning
* Booking, chatbot, or mobile app

> **Reference:** The full expanded I/O design and database schema for future iterations are documented in [io-recommendation-and-database-schema.md](io-recommendation-and-database-schema.md).

---

## 7. Validation

| Check | Status | Evidence |
|---|---|---|
| Input fields match prototype code | ✅ | `app.py` line 25–31: selectbox(category), selectbox(budget), slider(radius), number_input(top_k) |
| Output fields match prototype code | ✅ | `app.py` line 47: `result[["name", "category", "price_level", "distance_km", "rating", "score"]]` |
| Scoring formula matches code | ✅ | `recommender.py` line 38: `filtered["score"] = filtered["rating"] * 2 - filtered["distance_km"] * 0.25` |
| Filtering rules match code | ✅ | `recommender.py` lines 28–32: category, price_rank, distance filters |
| Data columns match loader | ✅ | `data_loader.py` lines 7–13: REQUIRED_COLUMNS = {name, category, price_level, distance_km, rating} |
| Edge case (empty result) handled | ✅ | `app.py` lines 42–44: `if result.empty: st.warning(...)` |
| Scope boundary separates MVP from future | ✅ | Section 6 explicitly lists in-scope vs out-of-scope |
