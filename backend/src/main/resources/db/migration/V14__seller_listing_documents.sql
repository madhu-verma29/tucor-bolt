CREATE TABLE IF NOT EXISTS seller_listing_documents (
 id UUID PRIMARY KEY,
 listing_id UUID NOT NULL REFERENCES market_listings(id) ON DELETE CASCADE,
 original_filename VARCHAR(255) NOT NULL,
 stored_filename VARCHAR(255) NOT NULL,
 content_type VARCHAR(100) NOT NULL,
 size_bytes BIGINT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_seller_listing_documents_listing ON seller_listing_documents(listing_id,created_at DESC);
