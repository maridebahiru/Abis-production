-- =========================================================
-- CONSOLIDATED SQL MIGRATION: RLS POLICIES, STORAGE & ADMIN USERS
-- Abis Luxury Photo Studio - Production Fixes
-- Safe to execute directly in Supabase SQL Editor
-- =========================================================

-- Enable UUID & pgcrypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Ensure public.admin_users table exists & has default emails
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

INSERT INTO public.admin_users (email, role)
VALUES 
  ('admin@luxphotography.com', 'admin'),
  ('admin@abisproduction.com', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 2. Seed & Reset Admin Accounts in Supabase Auth (auth.users)
-- Default Credentials:
-- Email: admin@luxphotography.com / admin@abisproduction.com
-- Password: AdminPassword123!
DO $$
DECLARE
  uid1 UUID := gen_random_uuid();
  uid2 UUID := gen_random_uuid();
BEGIN
  -- Admin 1: admin@luxphotography.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@luxphotography.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', uid1, 'authenticated', 'authenticated',
      'admin@luxphotography.com', crypt('AdminPassword123!', gen_salt('bf')), now(),
      now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Abis Studio Admin"}',
      false, now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      uid1, uid1, format('{"sub":"%s","email":"%s"}', uid1, 'admin@luxphotography.com')::jsonb,
      'email', now(), now(), now(), 'admin@luxphotography.com'
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('AdminPassword123!', gen_salt('bf')),
        email_confirmed_at = now()
    WHERE email = 'admin@luxphotography.com';
  END IF;

  -- Admin 2: admin@abisproduction.com
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@abisproduction.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', uid2, 'authenticated', 'authenticated',
      'admin@abisproduction.com', crypt('AdminPassword123!', gen_salt('bf')), now(),
      now(), now(), '{"provider":"email","providers":["email"]}', '{"name":"Abis Studio Admin"}',
      false, now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, provider_id
    ) VALUES (
      uid2, uid2, format('{"sub":"%s","email":"%s"}', uid2, 'admin@abisproduction.com')::jsonb,
      'email', now(), now(), now(), 'admin@abisproduction.com'
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('AdminPassword123!', gen_salt('bf')),
        email_confirmed_at = now()
    WHERE email = 'admin@abisproduction.com';
  END IF;
END $$;

-- 3. Enable RLS on all core tables
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- 4. PUBLIC READ & INSERT POLICIES
DROP POLICY IF EXISTS "Allow public read services" ON public.services;
CREATE POLICY "Allow public read services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read packages" ON public.packages;
CREATE POLICY "Allow public read packages" ON public.packages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read blocked dates" ON public.blocked_dates;
CREATE POLICY "Allow public read blocked dates" ON public.blocked_dates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read portfolio" ON public.portfolio_items;
CREATE POLICY "Allow public read portfolio" ON public.portfolio_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read payment settings" ON public.payment_settings;
CREATE POLICY "Allow public read payment settings" ON public.payment_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read site settings" ON public.site_settings;
CREATE POLICY "Allow public read site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read admin users" ON public.admin_users;
CREATE POLICY "Allow public read admin users" ON public.admin_users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert bookings" ON public.bookings;
CREATE POLICY "Allow public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow booking reference lookup" ON public.bookings;
CREATE POLICY "Allow booking reference lookup" ON public.bookings FOR SELECT USING (true);

-- 5. ADMIN MANAGE POLICIES (CHECK AGAINST public.admin_users)
DROP POLICY IF EXISTS "Allow admin full manage bookings" ON public.bookings;
CREATE POLICY "Allow admin full manage bookings" ON public.bookings
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

DROP POLICY IF EXISTS "Allow admin full manage blocked dates" ON public.blocked_dates;
CREATE POLICY "Allow admin full manage blocked dates" ON public.blocked_dates
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

DROP POLICY IF EXISTS "Allow admin manage services" ON public.services;
CREATE POLICY "Allow admin manage services" ON public.services
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

DROP POLICY IF EXISTS "Allow admin manage packages" ON public.packages;
CREATE POLICY "Allow admin manage packages" ON public.packages
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

DROP POLICY IF EXISTS "Allow admin manage portfolio" ON public.portfolio_items;
CREATE POLICY "Allow admin manage portfolio" ON public.portfolio_items
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

DROP POLICY IF EXISTS "Allow admin manage payment settings" ON public.payment_settings;
CREATE POLICY "Allow admin manage payment settings" ON public.payment_settings
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

DROP POLICY IF EXISTS "Allow admin manage site settings" ON public.site_settings;
CREATE POLICY "Allow admin manage site settings" ON public.site_settings
  FOR ALL USING (auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users));

DROP POLICY IF EXISTS "Allow admin manage admin users" ON public.admin_users;
CREATE POLICY "Allow admin manage admin users" ON public.admin_users
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. PORTFOLIO STORAGE BUCKET & POLICIES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio', 'portfolio', true, 524288000,
  ARRAY[
    'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/mov', 'video/x-m4v', 'video/avi'
  ]
)
ON CONFLICT (id) DO UPDATE SET 
  public = true, file_size_limit = 524288000;

DROP POLICY IF EXISTS "Allow public read portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin write portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete portfolio storage" ON storage.objects;

CREATE POLICY "Allow public read portfolio storage" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Allow admin write portfolio storage" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio' AND auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
  );

CREATE POLICY "Allow admin update portfolio storage" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio' AND auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
  );

CREATE POLICY "Allow admin delete portfolio storage" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio' AND auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
  );

-- 7. RECEIPTS STORAGE BUCKET & POLICIES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'receipts', 'receipts', false, 20971520,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET 
  public = false, file_size_limit = 20971520;

DROP POLICY IF EXISTS "Allow public insert receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin read receipts" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete receipts" ON storage.objects;

CREATE POLICY "Allow public insert receipts" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Allow admin read receipts" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'receipts' AND auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
  );

CREATE POLICY "Allow admin delete receipts" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'receipts' AND auth.jwt() ->> 'email' IN (SELECT email FROM public.admin_users)
  );
