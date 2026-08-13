-- Contact details for properties listed by admin on behalf of an owner
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_phone TEXT;

COMMENT ON COLUMN public.properties.owner_name IS 'Owner display name when listed by admin (or override)';
COMMENT ON COLUMN public.properties.owner_phone IS 'Owner phone when listed by admin (used for contact reveal)';
