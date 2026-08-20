CREATE TABLE place_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    position INT NOT NULL DEFAULT 0,
    source_name VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_place_image_url UNIQUE (place_id, image_url)
);

CREATE TABLE opening_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL,
    open_time TIME,
    close_time TIME,
    is_closed BOOLEAN NOT NULL DEFAULT FALSE,

    CONSTRAINT chk_day_of_week
        CHECK (day_of_week BETWEEN 1 AND 7), -- 1 = Monday ... 7 = Sunday

    CONSTRAINT chk_open_close_time
        CHECK (
            is_closed = TRUE
            OR (open_time IS NOT NULL AND close_time IS NOT NULL)
        )
);

CREATE TABLE place_external_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,

    source_name VARCHAR(50) NOT NULL,
    external_place_id VARCHAR(255),

    rating NUMERIC(2,1),
    review_count INT,
    price_level VARCHAR(20),
    raw_match_reason TEXT,

    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_external_rating
        CHECK (rating IS NULL OR rating BETWEEN 0 AND 5),

    CONSTRAINT chk_external_review_count
        CHECK (review_count IS NULL OR review_count >= 0),

    CONSTRAINT chk_external_price_level
        CHECK (price_level IS NULL OR price_level IN ('free', 'low', 'medium', 'high', 'unknown')),

    CONSTRAINT uq_place_external_source
        UNIQUE (place_id, source_name)
);

CREATE TABLE price_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE place_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    price_type_id UUID NOT NULL REFERENCES price_types(id),
    price NUMERIC(12,2) NOT NULL,
    currency VARCHAR(5) NOT NULL DEFAULT 'VND',

    CONSTRAINT chk_place_price
        CHECK (price >= 0)
);