ALTER TABLE favorites ALTER COLUMN place_id TYPE UUID USING place_id::text::uuid;
ALTER TABLE favorites ADD CONSTRAINT fk_favorites_place FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE;
