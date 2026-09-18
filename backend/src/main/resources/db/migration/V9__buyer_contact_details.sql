ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS primary_role VARCHAR(160);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS alternate_name VARCHAR(160);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS alternate_role VARCHAR(160);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(32);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS alternate_email VARCHAR(320);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS warehouse_address TEXT;
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS warehouse_contact VARCHAR(32);
ALTER TABLE registration_profiles ADD COLUMN IF NOT EXISTS warehouse_hours VARCHAR(160);