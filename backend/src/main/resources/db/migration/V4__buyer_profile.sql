alter table registration_profiles add column if not exists trade_name varchar(255);
alter table registration_profiles add column if not exists category varchar(150);
alter table registration_profiles add column if not exists pan varchar(20);
alter table registration_profiles add column if not exists cin varchar(30);
alter table registration_profiles add column if not exists year_established varchar(4);
alter table registration_profiles add column if not exists website varchar(255);
alter table registration_profiles add column if not exists country varchar(100) not null default 'India';