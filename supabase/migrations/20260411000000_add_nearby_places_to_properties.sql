-- Nearby places owners can tag (schools, metro, etc.) — shown on listing & detail pages
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS nearby_places JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN properties.nearby_places IS 'Array of strings, e.g. ["Metro", "School", "Hospital - 500m"]';
