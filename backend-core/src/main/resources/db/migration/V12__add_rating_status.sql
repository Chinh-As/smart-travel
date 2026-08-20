ALTER TABLE ratings ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'APPROVED';
ALTER TABLE ratings ADD CONSTRAINT chk_rating_status CHECK (status IN ('PENDING', 'APPROVED', 'HIDDEN'));

CREATE INDEX idx_ratings_status ON ratings(status);
CREATE INDEX idx_ratings_created_at ON ratings(created_at DESC);
CREATE INDEX idx_itineraries_created_at ON itineraries(created_at DESC);
