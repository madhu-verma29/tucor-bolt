ALTER TABLE users ADD COLUMN display_name VARCHAR(160);
ALTER TABLE buyer_orders ADD COLUMN payment_previous_status VARCHAR(30);
ALTER TABLE admin_disputes ADD COLUMN previous_order_status VARCHAR(30);
CREATE TABLE admin_document_requests (
 id UUID PRIMARY KEY, user_id UUID NOT NULL REFERENCES users(id), requested_by UUID NOT NULL REFERENCES users(id),
 message VARCHAR(2000) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'Open',
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_document_requests_owner ON admin_document_requests(user_id,created_at DESC);
CREATE TABLE admin_notification_receipts (
 id UUID PRIMARY KEY, admin_id UUID NOT NULL REFERENCES users(id), alert_id VARCHAR(80) NOT NULL,
 message VARCHAR(1000) NOT NULL, UNIQUE(admin_id,alert_id)
);
INSERT INTO admin_disputes(id,public_id,order_id,raised_by,raised_by_role,against_party,reason,description,status,priority,amount)
SELECT gen_random_uuid(),'DSP-'||replace(o.id::text,'-',''),o.id,'TUCOR Administration','Admin','Order participants','Legacy Order Dispute',LEFT(COALESCE(NULLIF(o.notes,''),'Legacy dispute requires investigation'),3000),'Open','High',o.total_amount
FROM buyer_orders o WHERE o.status='Disputed' AND NOT EXISTS(SELECT 1 FROM admin_disputes d WHERE d.order_id=o.id);
