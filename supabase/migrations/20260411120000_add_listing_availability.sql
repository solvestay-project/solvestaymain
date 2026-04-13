-- Owner: mark as on market (Tolet) vs sold/rented out
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS listing_availability TEXT NOT NULL DEFAULT 'available';

COMMENT ON COLUMN properties.listing_availability IS 'available = Tolet / on market; sold_out = filled';
