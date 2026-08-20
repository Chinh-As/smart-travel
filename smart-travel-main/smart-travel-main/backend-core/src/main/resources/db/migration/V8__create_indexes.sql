CREATE INDEX idx_places_geom
ON places
USING GIST (geom);

CREATE INDEX idx_places_city_id
ON places(city_id);

CREATE INDEX idx_places_deleted_at
ON places(deleted_at);

CREATE INDEX idx_place_categories_category_id
ON place_categories(category_id);

CREATE INDEX idx_opening_hours_place_day
ON opening_hours(place_id, day_of_week);

CREATE INDEX idx_place_external_stats_rating
ON place_external_stats(rating DESC);

CREATE INDEX idx_saved_places_user_id
ON saved_places(user_id);

CREATE INDEX idx_ratings_place_id
ON ratings(place_id);

CREATE INDEX idx_itineraries_user_id
ON itineraries(user_id);

CREATE INDEX idx_itinerary_items_day_id
ON itinerary_items(itinerary_day_id);

CREATE INDEX idx_place_images_place_id
ON place_images(place_id);

CREATE INDEX idx_place_external_stats_place_id
ON place_external_stats(place_id);

CREATE INDEX idx_itinerary_days_itinerary_id
ON itinerary_days(itinerary_id);

CREATE INDEX idx_search_history_user_id
ON search_history(user_id);

CREATE INDEX idx_places_name
ON places(name);

CREATE INDEX idx_place_prices_place_id
ON place_prices(place_id);

CREATE INDEX idx_place_prices_price_type_id
ON place_prices(price_type_id);