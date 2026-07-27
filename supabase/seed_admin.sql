-- =========================================================
-- ABIS PRODUCTION - SEED ADMIN USER IN SUPABASE DATABASE
-- =========================================================
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- to register the admin user into Supabase Auth and public.admin_users table.

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create public.admin_users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Allow public read admin_users" ON public.admin_users FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Allow authenticated manage admin_users" ON public.admin_users FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. Seed Default Admin Emails in public.admin_users
INSERT INTO public.admin_users (email, role)
VALUES 
  ('admin@luxphotography.com', 'admin'),
  ('admin@abisproduction.com', 'admin')
ON CONFLICT (email) DO NOTHING;

-- 4. Register & Confirm Admin Users in Supabase Auth (auth.users)
-- Default Credentials:
-- Email: admin@luxphotography.com (or admin@abisproduction.com)
-- Password: AdminPassword123!

DO $$
DECLARE
  uid1 UUID := gen_random_uuid();
  uid2 UUID := gen_random_uuid();
BEGIN
  -- Seed admin@luxphotography.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@luxphotography.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid1,
      'authenticated',
      'authenticated',
      'admin@luxphotography.com',
      crypt('AdminPassword123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Abis Studio Admin"}',
      false,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      provider_id
    ) VALUES (
      uid1,
      uid1,
      format('{"sub":"%s","email":"%s"}', uid1, 'admin@luxphotography.com')::jsonb,
      'email',
      now(),
      now(),
      now(),
      'admin@luxphotography.com'
    );
  END IF;

  -- Seed admin@abisproduction.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@abisproduction.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid2,
      'authenticated',
      'authenticated',
      'admin@abisproduction.com',
      crypt('AdminPassword123!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Abis Studio Admin"}',
      false,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at,
      provider_id
    ) VALUES (
      uid2,
      uid2,
      format('{"sub":"%s","email":"%s"}', uid2, 'admin@abisproduction.com')::jsonb,
      'email',
      now(),
      now(),
      now(),
      'admin@abisproduction.com'
    );
  END IF;
END $$;

-- =========================================================
-- 5. CREATE SUPABASE STORAGE BUCKET FOR PORTFOLIO MEDIA (VIDEOS & IMAGES)
-- =========================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio', 
  'portfolio', 
  true, 
  524288000, -- 500MB max file size
  ARRAY[
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/mov', 'video/x-m4v', 'video/avi'
  ]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true,
  file_size_limit = 524288000;

-- Storage RLS Policies
DO $$ BEGIN
  CREATE POLICY "Allow public read portfolio storage" ON storage.objects
    FOR SELECT USING (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public insert portfolio storage" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public update portfolio storage" ON storage.objects
    FOR UPDATE USING (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Allow public delete portfolio storage" ON storage.objects
    FOR DELETE USING (bucket_id = 'portfolio');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
