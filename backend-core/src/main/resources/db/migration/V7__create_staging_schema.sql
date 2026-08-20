CREATE TABLE staging_places_crawl (
    place_id UUID,
    name TEXT,
    category TEXT,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    address TEXT,
    description TEXT,
    opening_hours TEXT,
    rating NUMERIC(2,1),
    review_count INT,
    price_level TEXT,
    wheelchair_access BOOLEAN,
    images_url JSONB,
    match_reason TEXT,
    imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);