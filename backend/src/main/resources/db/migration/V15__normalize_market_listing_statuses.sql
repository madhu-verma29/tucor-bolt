UPDATE market_listings
SET status = 'Available'
WHERE status = 'Active';

UPDATE market_listings
SET status = 'Reserved'
WHERE status = 'Matched';
