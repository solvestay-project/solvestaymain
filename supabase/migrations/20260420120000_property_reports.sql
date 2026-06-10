-- User-submitted listing reports (shown in admin panel)
CREATE TABLE IF NOT EXISTS public.property_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties (id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  property_title TEXT,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS property_reports_property_id_idx
  ON public.property_reports (property_id);

CREATE INDEX IF NOT EXISTS property_reports_created_at_idx
  ON public.property_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS property_reports_status_idx
  ON public.property_reports (status);

COMMENT ON TABLE public.property_reports IS 'Listing flags from users (broker, wrong info, etc.); managed in admin.';

-- Lock down direct client access; app uses service role in API routes.
ALTER TABLE public.property_reports ENABLE ROW LEVEL SECURITY;
