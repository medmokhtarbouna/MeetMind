-- backend/database/migrations/001_initial_schema.sql
-- MeetMind: schema + functions + triggers + RLS (Single-User hardened)
-- Public table name: users (NOT profiles)

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- 1) users (application user table linked to auth.users)
-- Contains: Full name + Email. Password is managed by Supabase Auth (auth.users).
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) meetings
CREATE TABLE IF NOT EXISTS public.meetings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3) meeting_participants (kept for future, but locked down by RLS in single-user mode)
CREATE TABLE IF NOT EXISTS public.meeting_participants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role       TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor','viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

-- 4) recordings
CREATE TABLE IF NOT EXISTS public.recordings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id       UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  uploader_id      UUID NOT NULL DEFAULT auth.uid() REFERENCES public.users(id) ON DELETE RESTRICT,
  storage_path     TEXT NOT NULL,
  file_name        TEXT,
  mime_type        TEXT,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5) transcriptions
CREATE TABLE IF NOT EXISTS public.transcriptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  language     TEXT NOT NULL DEFAULT 'en',
  text         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6) ai_summaries
CREATE TABLE IF NOT EXISTS public.ai_summaries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id   UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  summary      TEXT,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  decisions    JSONB NOT NULL DEFAULT '[]'::jsonb,
  key_points   JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7) tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id  UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
  deadline    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_meetings_owner_id           ON public.meetings(owner_id);
CREATE INDEX IF NOT EXISTS idx_meetings_created_at         ON public.meetings(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_meeting_participants_mid    ON public.meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_uid    ON public.meeting_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_recordings_meeting_id       ON public.recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_recordings_uploader_id      ON public.recordings(uploader_id);
CREATE INDEX IF NOT EXISTS idx_recordings_storage_path     ON public.recordings(storage_path);

CREATE INDEX IF NOT EXISTS idx_transcriptions_recording_id ON public.transcriptions(recording_id);

CREATE INDEX IF NOT EXISTS idx_ai_summaries_meeting_id     ON public.ai_summaries(meeting_id);

CREATE INDEX IF NOT EXISTS idx_tasks_meeting_id            ON public.tasks(meeting_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to           ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status                ON public.tasks(status);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Auto-create public.users row on auth user creation (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NULL)
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

ALTER FUNCTION public.handle_new_user() SET search_path = public, auth;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_meetings ON public.meetings;
CREATE TRIGGER set_updated_at_meetings
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_ai_summaries ON public.ai_summaries;
CREATE TRIGGER set_updated_at_ai_summaries
  BEFORE UPDATE ON public.ai_summaries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_tasks ON public.tasks;
CREATE TRIGGER set_updated_at_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Block ownership transfer unless current owner is performing it
CREATE OR REPLACE FUNCTION public.block_owner_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.owner_id <> OLD.owner_id AND auth.uid() <> OLD.owner_id THEN
    RAISE EXCEPTION 'Only the current meeting owner can change owner_id';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_owner_change ON public.meetings;
CREATE TRIGGER trg_block_owner_change
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW EXECUTE FUNCTION public.block_owner_change();

-- Block changing meeting_id/storage_path/uploader_id in recordings
CREATE OR REPLACE FUNCTION public.block_recording_key_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.meeting_id <> OLD.meeting_id THEN
    RAISE EXCEPTION 'meeting_id cannot be changed';
  END IF;

  IF NEW.storage_path <> OLD.storage_path THEN
    RAISE EXCEPTION 'storage_path cannot be changed';
  END IF;

  IF NEW.uploader_id <> OLD.uploader_id THEN
    RAISE EXCEPTION 'uploader_id cannot be changed';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_block_recording_key_changes ON public.recordings;
CREATE TRIGGER trg_block_recording_key_changes
  BEFORE UPDATE ON public.recordings
  FOR EACH ROW EXECUTE FUNCTION public.block_recording_key_changes();

-- ============================================================================
-- PERMISSION HELPERS (Single-user: participant always false, role always owner/null)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_meeting_owner(meeting_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.meetings m
    WHERE m.id = meeting_uuid AND m.owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

ALTER FUNCTION public.is_meeting_owner(UUID) SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.is_meeting_participant(meeting_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT FALSE;
$$ LANGUAGE sql SECURITY DEFINER;

ALTER FUNCTION public.is_meeting_participant(UUID) SET search_path = public, auth;

CREATE OR REPLACE FUNCTION public.get_meeting_role(meeting_uuid UUID)
RETURNS TEXT AS $$
  SELECT CASE
    WHEN public.is_meeting_owner(meeting_uuid) THEN 'owner'
    ELSE NULL
  END;
$$ LANGUAGE sql SECURITY DEFINER;

ALTER FUNCTION public.get_meeting_role(UUID) SET search_path = public, auth;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transcriptions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_summaries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                 ENABLE ROW LEVEL SECURITY;

-- Clean policy surface (safe re-run)
DO $$
BEGIN
  -- users
  EXECUTE 'DROP POLICY IF EXISTS "Users: self select" ON public.users';
  EXECUTE 'DROP POLICY IF EXISTS "Users: self update" ON public.users';

  -- meetings
  EXECUTE 'DROP POLICY IF EXISTS "Meetings: owner select" ON public.meetings';
  EXECUTE 'DROP POLICY IF EXISTS "Meetings: owner insert" ON public.meetings';
  EXECUTE 'DROP POLICY IF EXISTS "Meetings: owner update" ON public.meetings';
  EXECUTE 'DROP POLICY IF EXISTS "Meetings: owner delete" ON public.meetings';

  -- participants
  EXECUTE 'DROP POLICY IF EXISTS "Participants: deny all" ON public.meeting_participants';

  -- recordings
  EXECUTE 'DROP POLICY IF EXISTS "Recordings: owner select" ON public.recordings';
  EXECUTE 'DROP POLICY IF EXISTS "Recordings: owner insert" ON public.recordings';
  EXECUTE 'DROP POLICY IF EXISTS "Recordings: owner update" ON public.recordings';
  EXECUTE 'DROP POLICY IF EXISTS "Recordings: owner delete" ON public.recordings';

  -- transcriptions
  EXECUTE 'DROP POLICY IF EXISTS "Transcriptions: owner select" ON public.transcriptions';
  EXECUTE 'DROP POLICY IF EXISTS "Transcriptions: owner insert" ON public.transcriptions';
  EXECUTE 'DROP POLICY IF EXISTS "Transcriptions: owner update" ON public.transcriptions';
  EXECUTE 'DROP POLICY IF EXISTS "Transcriptions: owner delete" ON public.transcriptions';

  -- summaries
  EXECUTE 'DROP POLICY IF EXISTS "Summaries: owner select" ON public.ai_summaries';
  EXECUTE 'DROP POLICY IF EXISTS "Summaries: owner insert" ON public.ai_summaries';
  EXECUTE 'DROP POLICY IF EXISTS "Summaries: owner update" ON public.ai_summaries';
  EXECUTE 'DROP POLICY IF EXISTS "Summaries: owner delete" ON public.ai_summaries';

  -- tasks
  EXECUTE 'DROP POLICY IF EXISTS "Tasks: owner select" ON public.tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Tasks: owner insert" ON public.tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Tasks: owner update" ON public.tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Tasks: owner delete" ON public.tasks';
END $$;

-- USERS (self only)
CREATE POLICY "Users: self select"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users: self update"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- MEETINGS (owner only)
CREATE POLICY "Meetings: owner select"
  ON public.meetings FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "Meetings: owner insert"
  ON public.meetings FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Meetings: owner update"
  ON public.meetings FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Meetings: owner delete"
  ON public.meetings FOR DELETE
  USING (owner_id = auth.uid());

-- PARTICIPANTS (locked down)
CREATE POLICY "Participants: deny all"
  ON public.meeting_participants FOR ALL
  USING (false)
  WITH CHECK (false);

-- RECORDINGS (owner only; uploader must be self)
CREATE POLICY "Recordings: owner select"
  ON public.recordings FOR SELECT
  USING (public.is_meeting_owner(meeting_id));

CREATE POLICY "Recordings: owner insert"
  ON public.recordings FOR INSERT
  WITH CHECK (
    public.is_meeting_owner(meeting_id)
    AND uploader_id = auth.uid()
  );

CREATE POLICY "Recordings: owner update"
  ON public.recordings FOR UPDATE
  USING (public.is_meeting_owner(meeting_id))
  WITH CHECK (public.is_meeting_owner(meeting_id));

CREATE POLICY "Recordings: owner delete"
  ON public.recordings FOR DELETE
  USING (public.is_meeting_owner(meeting_id));

-- TRANSCRIPTIONS (owner only)
CREATE POLICY "Transcriptions: owner select"
  ON public.transcriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.id = recording_id
        AND public.is_meeting_owner(r.meeting_id)
    )
  );

CREATE POLICY "Transcriptions: owner insert"
  ON public.transcriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.id = recording_id
        AND public.is_meeting_owner(r.meeting_id)
    )
  );

CREATE POLICY "Transcriptions: owner update"
  ON public.transcriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.id = recording_id
        AND public.is_meeting_owner(r.meeting_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.id = recording_id
        AND public.is_meeting_owner(r.meeting_id)
    )
  );

CREATE POLICY "Transcriptions: owner delete"
  ON public.transcriptions FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.id = recording_id
        AND public.is_meeting_owner(r.meeting_id)
    )
  );

-- SUMMARIES (owner only)
CREATE POLICY "Summaries: owner select"
  ON public.ai_summaries FOR SELECT
  USING (public.is_meeting_owner(meeting_id));

CREATE POLICY "Summaries: owner insert"
  ON public.ai_summaries FOR INSERT
  WITH CHECK (public.is_meeting_owner(meeting_id));

CREATE POLICY "Summaries: owner update"
  ON public.ai_summaries FOR UPDATE
  USING (public.is_meeting_owner(meeting_id))
  WITH CHECK (public.is_meeting_owner(meeting_id));

CREATE POLICY "Summaries: owner delete"
  ON public.ai_summaries FOR DELETE
  USING (public.is_meeting_owner(meeting_id));

-- TASKS (owner only)
CREATE POLICY "Tasks: owner select"
  ON public.tasks FOR SELECT
  USING (public.is_meeting_owner(meeting_id));

CREATE POLICY "Tasks: owner insert"
  ON public.tasks FOR INSERT
  WITH CHECK (public.is_meeting_owner(meeting_id));

CREATE POLICY "Tasks: owner update"
  ON public.tasks FOR UPDATE
  USING (public.is_meeting_owner(meeting_id))
  WITH CHECK (public.is_meeting_owner(meeting_id));

CREATE POLICY "Tasks: owner delete"
  ON public.tasks FOR DELETE
  USING (public.is_meeting_owner(meeting_id));

-- ============================================================================
-- AUTO-CONFIRM USERS
-- ============================================================================
-- Confirm all existing users who haven't confirmed their email
-- Note: confirmed_at is a generated column and cannot be updated directly
-- Only update email_confirmed_at (confirmed_at will be updated automatically)

UPDATE auth.users
SET 
  email_confirmed_at = COALESCE(email_confirmed_at, NOW())
WHERE 
  email_confirmed_at IS NULL;
