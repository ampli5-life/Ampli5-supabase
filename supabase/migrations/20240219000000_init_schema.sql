CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ampli5 Supabase Schema Migration
-- Migrates from Spring Boot / Flyway schema to Supabase

-- Profiles: synced from auth.users (replaces users table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  avatar_url text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  paypal_subscription_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan_id text NOT NULL,
  status text NOT NULL,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions(user_id, status);

-- Videos (add storage_path for paid Supabase Storage videos)
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  youtube_url text NOT NULL,
  thumbnail_url text NOT NULL,
  is_paid boolean NOT NULL DEFAULT false,
  storage_path text,
  category text NOT NULL DEFAULT '',
  duration integer NOT NULL DEFAULT 0,
  instructor text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date date NOT NULL,
  description text NOT NULL,
  instructor text NOT NULL,
  sort_order integer
);

-- Blog posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text NOT NULL,
  tag text NOT NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  sort_order integer
);

-- Page content
CREATE TABLE IF NOT EXISTS public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL UNIQUE,
  content_json text
);

-- FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer
);

-- Schedules
CREATE TABLE IF NOT EXISTS public.schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week text NOT NULL,
  time text NOT NULL,
  class_name text NOT NULL,
  instructor text NOT NULL,
  level text NOT NULL,
  sort_order integer
);

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author text NOT NULL,
  sort_order integer
);

-- Team members
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  bio text,
  avatar_url text,
  sort_order integer
);

-- Apps
CREATE TABLE IF NOT EXISTS public.apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  sort_order integer
);

-- Books
CREATE TABLE IF NOT EXISTS public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  description text,
  sort_order integer
);

-- Recommended readings
CREATE TABLE IF NOT EXISTS public.recommended_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  sort_order integer
);

-- Video channels
CREATE TABLE IF NOT EXISTS public.video_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  url text,
  description text,
  sort_order integer
);

-- Contact submissions (replaces contact email - store for admin to view)
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Trigger: create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'email', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ ROW LEVEL SECURITY ============

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommended_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Helper: is_admin check
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles: users can read/update own
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles (for admin panel)
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin());

-- Service role handles profile creation via trigger

-- Subscriptions: users can read own only; insert/update via Edge Function (service role)
CREATE POLICY "Users can read own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Videos: anon can read metadata (public content)
CREATE POLICY "Anyone can read videos"
  ON public.videos FOR SELECT
  USING (true);

-- Admins can manage videos
CREATE POLICY "Admins can insert videos"
  ON public.videos FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update videos"
  ON public.videos FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can delete videos"
  ON public.videos FOR DELETE
  USING (public.is_admin());

-- Content tables: anon read, admin write
CREATE POLICY "Anyone can read events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Admins can manage events" ON public.events FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read blog_posts" ON public.blog_posts FOR SELECT USING (true);
CREATE POLICY "Admins can manage blog_posts" ON public.blog_posts FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read page_content" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage page_content" ON public.page_content FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Admins can manage faqs" ON public.faqs FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read schedules" ON public.schedules FOR SELECT USING (true);
CREATE POLICY "Admins can manage schedules" ON public.schedules FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read team_members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team_members" ON public.team_members FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read apps" ON public.apps FOR SELECT USING (true);
CREATE POLICY "Admins can manage apps" ON public.apps FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read books" ON public.books FOR SELECT USING (true);
CREATE POLICY "Admins can manage books" ON public.books FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read recommended_readings" ON public.recommended_readings FOR SELECT USING (true);
CREATE POLICY "Admins can manage recommended_readings" ON public.recommended_readings FOR ALL USING (public.is_admin());

CREATE POLICY "Anyone can read video_channels" ON public.video_channels FOR SELECT USING (true);
CREATE POLICY "Admins can manage video_channels" ON public.video_channels FOR ALL USING (public.is_admin());

-- Contact: anon can insert (form submission); admin can read
CREATE POLICY "Anyone can submit contact"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read contact submissions"
  ON public.contact_submissions FOR SELECT
  USING (public.is_admin());

-- Storage bucket for paid videos (private; signed URLs only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'videos',
  'videos',
  false,
  524288000,
  ARRAY['video/mp4', 'video/webm', 'video/ogg']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Videos bucket is private; signed URLs generated by Edge Function only
