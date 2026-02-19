-- Fix profile creation for Google OAuth: use picture for avatar, fallbacks for required fields, upsert on conflict
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_email text;
  user_name text;
  user_avatar text;
BEGIN
  user_email := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'email'), ''),
    NULLIF(TRIM(NEW.email), ''),
    'user-' || NEW.id::text || '@local'
  );
  user_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    'User'
  );
  user_avatar := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'avatar_url'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'picture'), '')
  );

  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, user_email, user_name, user_avatar)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill profiles for existing auth.users that have no profile (e.g. Google sign-in before trigger fix)
INSERT INTO public.profiles (id, email, full_name, avatar_url)
SELECT
  u.id,
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'email'), ''), NULLIF(TRIM(u.email), ''), 'user-' || u.id::text || '@local'),
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'full_name'), ''), NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''), 'User'),
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'avatar_url'), ''), NULLIF(TRIM(u.raw_user_meta_data->>'picture'), ''))
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
