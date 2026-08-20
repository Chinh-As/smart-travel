-- Add budget_tier to user_preferences for onboarding preferences
-- (existing base_budget is a numeric amount; budget_tier is a coarse enum
-- selected during onboarding: 'save' | 'mid' | 'high')

ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS budget_tier VARCHAR(10);

ALTER TABLE user_preferences
    ADD CONSTRAINT chk_budget_tier
    CHECK (budget_tier IS NULL OR budget_tier IN ('save', 'mid', 'high'));