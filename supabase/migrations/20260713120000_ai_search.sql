-- AI Dream Home Search: one-time trial per user + session audit log

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_trial_used BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.ai_trial_used IS 'True after the user consumes their one free AI Dream Home Search tryout';

CREATE TABLE IF NOT EXISTS ai_search_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  parsed_criteria JSONB,
  result_count INT,
  used_trial BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_search_sessions_user_created
  ON ai_search_sessions (user_id, created_at DESC);

ALTER TABLE ai_search_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY ai_search_sessions_select_own ON ai_search_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY ai_search_sessions_insert_own ON ai_search_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
