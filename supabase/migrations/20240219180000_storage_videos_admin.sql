-- Storage RLS: allow admins to upload and manage objects in the videos bucket
-- Required for Admin panel paid video uploads

CREATE POLICY "Admins can insert into videos bucket"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'videos' AND public.is_admin()
  );

CREATE POLICY "Admins can select from videos bucket"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'videos' AND public.is_admin()
  );

CREATE POLICY "Admins can update objects in videos bucket"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'videos' AND public.is_admin()
  )
  WITH CHECK (
    bucket_id = 'videos' AND public.is_admin()
  );

CREATE POLICY "Admins can delete from videos bucket"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'videos' AND public.is_admin()
  );
