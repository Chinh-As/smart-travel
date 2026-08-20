CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Vietnam',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (name, country)
);

CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID REFERENCES cities(id),

    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,

    geom GEOMETRY(Point, 4326) NOT NULL,

    main_image_url TEXT,
    wheelchair_access BOOLEAN NOT NULL DEFAULT FALSE,
    raw_opening_hours TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    parent_id UUID REFERENCES categories(id)
);

CREATE TABLE place_categories (
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,

    PRIMARY KEY (place_id, category_id)
);