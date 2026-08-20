-- V21: Transform staging_places_crawl into main tables (places, place_images, place_external_stats, place_categories)
-- This runs after V18 seeds the staging table.

-- 1. Transform staging -> places
INSERT INTO places (id, name, description, address, geom, main_image_url, wheelchair_access, raw_opening_hours, created_at, updated_at)
SELECT 
    place_id, 
    name, 
    description, 
    address, 
    ST_SetSRID(ST_Point(lng, lat), 4326), 
    jsonb_extract_path_text(images_url, '0'), 
    COALESCE(wheelchair_access, FALSE), 
    opening_hours,
    imported_at,
    imported_at
FROM staging_places_crawl
ON CONFLICT (id) DO NOTHING;

-- 2. Transform staging -> place_images
INSERT INTO place_images (place_id, image_url, position, source_name, created_at)
SELECT 
    place_id, 
    img_url, 
    row_number() OVER (PARTITION BY place_id) - 1,
    'CRAWL',
    imported_at
FROM (
    SELECT 
        place_id, 
        jsonb_array_elements_text(images_url) as img_url,
        imported_at
    FROM staging_places_crawl
) sub
ON CONFLICT (place_id, image_url) DO NOTHING;

-- 3. Transform staging -> place_external_stats
INSERT INTO place_external_stats (place_id, source_name, rating, review_count, price_level, raw_match_reason, fetched_at)
SELECT 
    place_id, 
    'CRAWL', 
    rating, 
    review_count, 
    price_level, 
    match_reason,
    imported_at
FROM staging_places_crawl
ON CONFLICT (place_id, source_name) DO NOTHING;

-- 4. Transform staging -> place_categories
INSERT INTO place_categories (place_id, category_id)
SELECT 
    spc.place_id, 
    c.id
FROM staging_places_crawl spc
JOIN categories c ON 
    (spc.category = 'sightseeing' AND c.name = 'SIGHTSEEING') OR
    (spc.category = 'restaurant' AND c.name = 'CULINARY') OR
    (spc.category = 'cafe' AND c.name = 'CULINARY') OR
    (spc.category = 'hotel' AND c.name = 'BEACH_RESORT')
ON CONFLICT (place_id, category_id) DO NOTHING;

-- 5. Normalize "Hồ Chí Minh" -> "TP. Hồ Chí Minh"
UPDATE places 
SET address = REPLACE(address, 'Hồ Chí Minh', 'TP. Hồ Chí Minh') 
WHERE address LIKE '%Hồ Chí Minh%' AND address NOT LIKE '%TP. Hồ Chí Minh%';

UPDATE places 
SET description = REPLACE(description, 'Hồ Chí Minh', 'TP. Hồ Chí Minh') 
WHERE description LIKE '%Hồ Chí Minh%' AND description NOT LIKE '%TP. Hồ Chí Minh%';

