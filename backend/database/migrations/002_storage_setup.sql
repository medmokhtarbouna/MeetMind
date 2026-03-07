-- backend/database/migrations/002_storage_setup.sql
-- MeetMind: Storage bucket + Storage policies (Single-User hardened)
-- Public table name: users (NOT profiles)

-- ============================================================================
-- BUCKET: recordings (private)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'recordings',
  'recordings',
  false,
  52428800,
  ARRAY[
    'audio/mpeg','audio/mp3','audio/wav','audio/webm',
    'video/mp4','video/webm','video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE OBJECT POLICIES
-- Single-user: owner-only.
-- Upload requires a matching recordings row (prevents orphan uploads).
-- ============================================================================
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Storage: owner upload with DB row" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Storage: owner read" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Storage: owner update" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Storage: owner delete" ON storage.objects';

  -- drop older names if they exist
  EXECUTE 'DROP POLICY IF EXISTS "Users can upload recording objects with DB row" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users can read recording objects with meeting access" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Owners and editors can manage recording objects" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Owners and editors can manage recording objects (delete)" ON storage.objects';

  EXECUTE 'DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users can read authorized recordings" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update own recordings" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Users can delete own recordings" ON storage.objects';
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- INSERT (Upload)
CREATE POLICY "Storage: owner upload with DB row"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'recordings'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.storage_path = name
        AND r.uploader_id = auth.uid()
        AND public.is_meeting_owner(r.meeting_id)
    )
  );

-- SELECT (Read)
CREATE POLICY "Storage: owner read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'recordings'
    AND EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.storage_path = name
        AND public.is_meeting_owner(r.meeting_id)
    )
  );

-- UPDATE
CREATE POLICY "Storage: owner update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'recordings'
    AND EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.storage_path = name
        AND public.is_meeting_owner(r.meeting_id)
    )
  )
  WITH CHECK (
    bucket_id = 'recordings'
    AND EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.storage_path = name
        AND public.is_meeting_owner(r.meeting_id)
    )
  );

-- DELETE
CREATE POLICY "Storage: owner delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'recordings'
    AND EXISTS (
      SELECT 1
      FROM public.recordings r
      WHERE r.storage_path = name
        AND public.is_meeting_owner(r.meeting_id)
    )
  );
