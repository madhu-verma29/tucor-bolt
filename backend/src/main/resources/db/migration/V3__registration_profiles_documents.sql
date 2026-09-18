create table registration_profiles(
 user_id uuid primary key references users(id) on delete cascade,
 business_name varchar(255) not null,
 business_type varchar(100) not null,
 gst_number varchar(20) not null,
 registration_number varchar(100),
 address varchar(500) not null,
 city varchar(100) not null,
 state varchar(100) not null,
 pincode varchar(6) not null,
 estimated_volume_monthly varchar(50),
 full_name varchar(255) not null,
 phone varchar(20) not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create table registration_documents(
 id uuid primary key,
 user_id uuid not null references users(id) on delete cascade,
 document_type varchar(40) not null,
 original_filename varchar(255) not null,
 stored_filename varchar(255) not null,
 content_type varchar(100) not null,
 size_bytes bigint not null,
 status varchar(30) not null default 'PENDING_REVIEW',
 created_at timestamptz not null default now(),
 unique(user_id,document_type)
);
create index idx_registration_documents_user on registration_documents(user_id);