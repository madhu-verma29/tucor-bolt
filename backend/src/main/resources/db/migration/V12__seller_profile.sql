ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS fssai_number VARCHAR(40);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(500);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS gst_state VARCHAR(120);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS kitchen_type VARCHAR(160);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS seating_capacity VARCHAR(40);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS avg_daily_covers VARCHAR(40);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS operating_days VARCHAR(160);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(160);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS cuisine_types VARCHAR(500);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS avg_monthly_uco VARCHAR(40);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS storage_capacity VARCHAR(40);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS collection_frequency VARCHAR(80);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS preferred_pickup_day VARCHAR(80);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS pickup_contact VARCHAR(160);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS pickup_phone VARCHAR(32);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS pickup_availability VARCHAR(160);

UPDATE registration_profiles p
SET fssai_number = p.registration_number
FROM users u
WHERE p.user_id = u.id AND u.role = 'SELLER' AND p.fssai_number IS NULL;

ALTER TABLE registration_documents ADD COLUMN IF NOT EXISTS expires_at DATE;
ALTER TABLE registration_documents ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(1000);

CREATE TABLE IF NOT EXISTS seller_bank_accounts (
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 account_holder VARCHAR(255) NOT NULL,
 account_number VARCHAR(64) NOT NULL,
 bank_name VARCHAR(160) NOT NULL,
 branch VARCHAR(255),
 ifsc VARCHAR(20) NOT NULL,
 account_type VARCHAR(80) NOT NULL,
 upi_id VARCHAR(160),
 verified BOOLEAN NOT NULL DEFAULT FALSE,
 verified_at TIMESTAMPTZ,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_preferences (
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 email_orders BOOLEAN NOT NULL DEFAULT TRUE,
 email_pickups BOOLEAN NOT NULL DEFAULT TRUE,
 email_payments BOOLEAN NOT NULL DEFAULT TRUE,
 sms_pickups BOOLEAN NOT NULL DEFAULT TRUE,
 sms_payments BOOLEAN NOT NULL DEFAULT FALSE,
 app_all BOOLEAN NOT NULL DEFAULT TRUE,
 two_factor BOOLEAN NOT NULL DEFAULT FALSE,
 login_alerts BOOLEAN NOT NULL DEFAULT TRUE,
 auto_invoice BOOLEAN NOT NULL DEFAULT TRUE,
 weekly_report BOOLEAN NOT NULL DEFAULT FALSE,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
