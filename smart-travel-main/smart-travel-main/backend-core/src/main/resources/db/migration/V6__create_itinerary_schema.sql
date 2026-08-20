CREATE TABLE itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    city_id UUID REFERENCES cities(id),

    title VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    total_budget NUMERIC(12,2),
    currency VARCHAR(5) NOT NULL DEFAULT 'VND',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_itinerary_date
        CHECK (end_date >= start_date),

    CONSTRAINT chk_itinerary_status
        CHECK (status IN ('DRAFT', 'CONFIRMED', 'COMPLETED', 'CANCELLED'))
);

CREATE TABLE itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,

    trip_date DATE NOT NULL,
    day_index INT NOT NULL,

    UNIQUE (itinerary_id, trip_date),
    UNIQUE (itinerary_id, day_index)
);

CREATE TABLE itinerary_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_day_id UUID NOT NULL REFERENCES itinerary_days(id) ON DELETE CASCADE,
    place_id UUID REFERENCES places(id),

    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    order_index INT NOT NULL,

    estimated_cost NUMERIC(12,2),
    travel_minutes_from_previous INT,
    note TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_item_time
        CHECK (end_time > start_time),

    UNIQUE (itinerary_day_id, order_index)
);