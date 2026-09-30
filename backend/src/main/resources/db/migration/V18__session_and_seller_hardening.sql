ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0;
UPDATE seller_preferences SET two_factor=FALSE, login_alerts=FALSE, auto_invoice=FALSE, weekly_report=FALSE;
ALTER TABLE seller_preferences ALTER COLUMN login_alerts SET DEFAULT FALSE;
ALTER TABLE seller_preferences ALTER COLUMN auto_invoice SET DEFAULT FALSE;
CREATE INDEX idx_documents_owner_created ON registration_documents(user_id,created_at DESC);
UPDATE registration_documents d SET document_type='FSSAI' FROM users u WHERE u.id=d.user_id AND u.role='SELLER' AND d.document_type='FSSAI_OR_REGISTRATION' AND NOT EXISTS (SELECT 1 FROM registration_documents existing WHERE existing.user_id=d.user_id AND existing.document_type='FSSAI');
