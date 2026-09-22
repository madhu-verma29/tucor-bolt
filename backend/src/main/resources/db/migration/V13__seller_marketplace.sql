ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS available_to DATE;
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS pickup_days VARCHAR(160);
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS pickup_time_slot VARCHAR(160);
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS storage_type VARCHAR(160);
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS pickup_location VARCHAR(700);
ALTER TABLE market_listings ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE buyer_pickups ADD COLUMN IF NOT EXISTS volume_confirmed INTEGER;
CREATE INDEX IF NOT EXISTS idx_market_listings_seller ON market_listings(seller_id);
CREATE TABLE IF NOT EXISTS seller_notifications (
 id UUID PRIMARY KEY, seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 type VARCHAR(32) NOT NULL, title VARCHAR(255) NOT NULL, message VARCHAR(1000) NOT NULL,
 is_read BOOLEAN NOT NULL DEFAULT FALSE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seller_notifications_seller ON seller_notifications(seller_id,created_at DESC);
CREATE TABLE IF NOT EXISTS seller_withdrawals (
 id UUID PRIMARY KEY, public_id VARCHAR(40) NOT NULL UNIQUE, seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 amount NUMERIC(12,2) NOT NULL, note VARCHAR(500), status VARCHAR(32) NOT NULL DEFAULT 'Pending', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seller_withdrawals_seller ON seller_withdrawals(seller_id,created_at DESC);
