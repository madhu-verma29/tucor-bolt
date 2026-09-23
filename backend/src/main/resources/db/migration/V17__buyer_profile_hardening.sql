ALTER TABLE buyer_notification_preferences
 ADD COLUMN IF NOT EXISTS email_kyc BOOLEAN NOT NULL DEFAULT TRUE,
 ADD COLUMN IF NOT EXISTS sms_orders BOOLEAN NOT NULL DEFAULT TRUE,
 ADD COLUMN IF NOT EXISTS whatsapp_updates BOOLEAN NOT NULL DEFAULT FALSE,
 ADD COLUMN IF NOT EXISTS marketing_emails BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE buyer_procurement_preferences (
 buyer_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 auto_reorder BOOLEAN NOT NULL DEFAULT FALSE,
 price_alerts BOOLEAN NOT NULL DEFAULT TRUE,
 weekly_report BOOLEAN NOT NULL DEFAULT TRUE,
 sustainability_report BOOLEAN NOT NULL DEFAULT FALSE,
 compact_view BOOLEAN NOT NULL DEFAULT FALSE,
 preferred_grade VARCHAR(20) NOT NULL DEFAULT 'Grade A',
 max_ffa VARCHAR(20) NOT NULL DEFAULT '3%',
 min_volume VARCHAR(40) NOT NULL DEFAULT '500 L',
 max_price VARCHAR(40) NOT NULL DEFAULT '₹55/L',
 preferred_regions VARCHAR(500) NOT NULL DEFAULT '',
 currency VARCHAR(10) NOT NULL DEFAULT 'INR',
 language VARCHAR(40) NOT NULL DEFAULT 'English',
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE buyer_bank_accounts
 ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

WITH ranked_primary AS (
 SELECT id, ROW_NUMBER() OVER (PARTITION BY buyer_id ORDER BY created_at, id) AS position
 FROM buyer_bank_accounts
 WHERE is_primary = TRUE
)
UPDATE buyer_bank_accounts
SET is_primary = FALSE
WHERE id IN (SELECT id FROM ranked_primary WHERE position > 1);

CREATE UNIQUE INDEX IF NOT EXISTS uq_buyer_bank_primary
 ON buyer_bank_accounts(buyer_id)
 WHERE is_primary = TRUE;
