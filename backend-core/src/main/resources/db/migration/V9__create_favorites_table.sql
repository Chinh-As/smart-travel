CREATE TABLE favorites (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     VARCHAR(255) NOT NULL,
    place_id    BIGINT       NOT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_place UNIQUE (user_id, place_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
