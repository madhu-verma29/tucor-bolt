CREATE TABLE IF NOT EXISTS buyer_pickups (
 id UUID PRIMARY KEY,
 public_id VARCHAR(64) NOT NULL UNIQUE,
 buyer_id UUID NOT NULL REFERENCES users(id),
 order_id UUID NOT NULL REFERENCES buyer_orders(id),
 scheduled_date DATE,
 status VARCHAR(32) NOT NULL DEFAULT 'Pending',
 agent_name VARCHAR(160),
 vehicle_number VARCHAR(64),
 notes TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_buyer_pickups_buyer ON buyer_pickups(buyer_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_buyer_pickups_order ON buyer_pickups(order_id);