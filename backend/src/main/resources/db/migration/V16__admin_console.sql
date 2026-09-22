ALTER TABLE registration_documents ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES users(id);
ALTER TABLE registration_documents ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

CREATE TABLE admin_audit_logs (
 id UUID PRIMARY KEY,
 public_id VARCHAR(80) NOT NULL UNIQUE,
 actor_id UUID REFERENCES users(id),
 actor VARCHAR(255) NOT NULL,
 actor_role VARCHAR(30) NOT NULL,
 action VARCHAR(160) NOT NULL,
 module VARCHAR(40) NOT NULL,
 target VARCHAR(255) NOT NULL,
 target_id VARCHAR(100) NOT NULL,
 ip_address VARCHAR(64) NOT NULL,
 severity VARCHAR(20) NOT NULL,
 details VARCHAR(2000) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_audit_created ON admin_audit_logs(created_at DESC);

CREATE TABLE admin_disputes (
 id UUID PRIMARY KEY,
 public_id VARCHAR(80) NOT NULL UNIQUE,
 order_id UUID NOT NULL UNIQUE REFERENCES buyer_orders(id),
 raised_by VARCHAR(255) NOT NULL,
 raised_by_role VARCHAR(30) NOT NULL,
 against_party VARCHAR(255) NOT NULL,
 reason VARCHAR(160) NOT NULL,
 description VARCHAR(3000) NOT NULL,
 status VARCHAR(40) NOT NULL,
 priority VARCHAR(20) NOT NULL,
 amount NUMERIC(12,2) NOT NULL,
 resolution VARCHAR(3000),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE admin_dispute_events (
 id UUID PRIMARY KEY,
 dispute_id UUID NOT NULL REFERENCES admin_disputes(id) ON DELETE CASCADE,
 action VARCHAR(1000) NOT NULL,
 actor_name VARCHAR(255) NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_dispute_events_dispute ON admin_dispute_events(dispute_id,created_at);

CREATE TABLE admin_settings (
 user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 platform_name VARCHAR(120) NOT NULL DEFAULT 'TUCOR',
 support_email VARCHAR(255) NOT NULL DEFAULT 'support@tucor.in',
 platform_fee_percent VARCHAR(20) NOT NULL DEFAULT '5',
 min_order_liters VARCHAR(20) NOT NULL DEFAULT '50',
 verification_days VARCHAR(20) NOT NULL DEFAULT '3',
 auto_approve_threshold VARCHAR(20) NOT NULL DEFAULT '500',
 email_new_registrations BOOLEAN NOT NULL DEFAULT TRUE,
 email_disputes BOOLEAN NOT NULL DEFAULT TRUE,
 email_payment_failures BOOLEAN NOT NULL DEFAULT TRUE,
 sms_urgent_alerts BOOLEAN NOT NULL DEFAULT TRUE,
 daily_digest BOOLEAN NOT NULL DEFAULT FALSE,
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
